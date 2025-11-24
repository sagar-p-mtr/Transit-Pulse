import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userService } from './firebaseService';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create user profile in Firestore
      await userService.createUser({
        email: user.email!,
        name: name,
        preferences: {
          language: 'en',
          notifications: true,
          favorite_routes: []
        }
      });

      return {
        uid: user.uid,
        email: user.email,
        displayName: name,
        emailVerified: user.emailVerified
      };
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      };
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out');
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        });
      } else {
        callback(null);
      }
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  // Get user ID token
  async getUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Convert Firebase auth error codes to user-friendly messages
  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return 'An error occurred during authentication.';
    }
  }
}

export const authService = new AuthService();
