// Progressive Web App service
export interface PWAInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAService {
  private deferredPrompt: PWAInstallPromptEvent | null = null;
  private isInstalled = false;
  private notificationPermission: NotificationPermission = 'default';
  private readonly rebrandVersion = 'transit-pulse-v2';

  constructor() {
    this.checkInstallStatus();
    this.setupInstallPrompt();
    this.setupNotifications();
    void this.migrateLegacyBrandingCache();
    this.registerServiceWorker();
  }

  private async migrateLegacyBrandingCache() {
    const migrationKey = `brand_migration_${this.rebrandVersion}`;
    if (localStorage.getItem(migrationKey) === 'done') {
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      Object.keys(localStorage)
        .filter((key) => key.toLowerCase().includes('whereismybus'))
        .forEach((key) => localStorage.removeItem(key));

      localStorage.setItem(migrationKey, 'done');
      window.location.reload();
    } catch (error) {
      console.warn('Brand migration cache cleanup skipped:', error);
    }
  }

  private checkInstallStatus() {
    // Check if app is installed
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      window.matchMedia('(display-mode: fullscreen)').matches ||
                      (window.navigator as any).standalone === true;
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as PWAInstallPromptEvent;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.showInstallSuccess();
    });
  }

  private setupNotifications() {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registered successfully:', registration);
        
        // Update available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }

  async requestInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error during install prompt:', error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  showNotification(title: string, options: NotificationOptions = {}) {
    if (this.notificationPermission !== 'granted') {
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      tag: 'transitpulse',
      renotify: true,
      ...options
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, defaultOptions);
      });
    } else {
      new Notification(title, defaultOptions);
    }
  }

  private showInstallPrompt() {
    if (this.isInstalled) return;

    // Create install prompt UI
    const installBanner = document.createElement('div');
    installBanner.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 transition-all transform translate-y-full';
    installBanner.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h4 class="font-semibold text-sm">Install Transit Pulse</h4>
          <p class="text-xs opacity-90">Get faster access with our app!</p>
        </div>
        <div class="flex space-x-2 ml-4">
          <button id="install-app" class="bg-white text-blue-600 px-3 py-1 rounded text-xs font-semibold">
            Install
          </button>
          <button id="dismiss-install" class="text-white opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(installBanner);

    // Animate in
    setTimeout(() => {
      installBanner.style.transform = 'translateY(0)';
    }, 100);

    // Event listeners
    const installBtn = installBanner.querySelector('#install-app');
    const dismissBtn = installBanner.querySelector('#dismiss-install');

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        const installed = await this.requestInstall();
        if (installed) {
          installBanner.remove();
        }
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        installBanner.style.transform = 'translateY(100%)';
        setTimeout(() => installBanner.remove(), 300);
      });
    }

    // Auto dismiss after 10 seconds
    setTimeout(() => {
      if (installBanner.parentNode) {
        installBanner.style.transform = 'translateY(100%)';
        setTimeout(() => installBanner.remove(), 300);
      }
    }, 10000);
  }

  private showInstallSuccess() {
    this.showNotification('Transit Pulse Installed!', {
      body: 'You can now track buses offline and get push notifications.',
      icon: '/icons/icon-192x192.png'
    });
  }

  private showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-green-600 text-white p-4 rounded-lg shadow-lg z-50';
    updateBanner.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h4 class="font-semibold text-sm">Update Available</h4>
          <p class="text-xs opacity-90">New features and improvements!</p>
        </div>
        <div class="flex space-x-2 ml-4">
          <button id="update-app" class="bg-white text-green-600 px-3 py-1 rounded text-xs font-semibold">
            Update
          </button>
          <button id="dismiss-update" class="text-white opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(updateBanner);

    const updateBtn = updateBanner.querySelector('#update-app');
    const dismissBtn = updateBanner.querySelector('#dismiss-update');

    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        updateBanner.remove();
      });
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
    }
  }

  async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  }

  getInstallationStatus(): boolean {
    return this.isInstalled;
  }

  getNotificationPermission(): NotificationPermission {
    return this.notificationPermission;
  }

  // Offline data management
  async saveOfflineData(key: string, data: any): Promise<void> {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      }));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  async getOfflineData(key: string, maxAge: number = 24 * 60 * 60 * 1000): Promise<any> {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const age = Date.now() - parsed.timestamp;
      
      if (age > maxAge) {
        localStorage.removeItem(`offline_${key}`);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }

  async shareApp(): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Transit Pulse - Real-time Bus Tracking',
          text: 'Track buses in real-time across India with crowd detection!',
          url: window.location.origin,
        });
        return true;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        return false;
      }
    }
    
    // Fallback to copying link
    try {
      await navigator.clipboard.writeText(window.location.origin);
      this.showNotification('Link Copied!', {
        body: 'Share link has been copied to clipboard.',
      });
      return true;
    } catch (error) {
      console.error('Error copying link:', error);
      return false;
    }
  }
}

export const pwaService = new PWAService();

export const initializePWA = (): void => {
  // PWA service is automatically initialized when imported
  console.log('PWA service initialized');
};

export default pwaService;
