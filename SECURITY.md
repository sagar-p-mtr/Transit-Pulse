# Security Policy

## 🔒 Reporting a Vulnerability

We take the security of Where Is My Bus seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security issues by:

1. **Email:** Send details to **security@whereismybus.in** (or your actual email)
2. **Subject:** Include "SECURITY" in the subject line
3. **Details:** Provide as much information as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Status Updates:** Every 5-7 days until resolved
- **Resolution:** Security patches released ASAP

### Responsible Disclosure

We ask that you:
- ✅ Give us reasonable time to fix the issue before public disclosure
- ✅ Make a good faith effort to avoid privacy violations and data destruction
- ✅ Do not exploit the vulnerability beyond what is necessary to demonstrate it

### Recognition

Security researchers who responsibly disclose vulnerabilities will be:
- 🏆 Acknowledged in our security hall of fame (with permission)
- 📝 Credited in release notes (unless you prefer to remain anonymous)

## 🛡️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes            |
| < 1.0   | ❌ No             |

## 🔐 Security Best Practices

### For Users

1. **API Keys:**
   - Never commit `.env` files to Git
   - Rotate keys regularly
   - Use separate keys for development and production

2. **Authentication:**
   - Use strong passwords
   - Enable two-factor authentication
   - Keep Firebase security rules updated

3. **Dependencies:**
   - Keep all dependencies updated
   - Review security advisories regularly
   - Run `npm audit` before deploying

### For Developers

1. **Environment Variables:**
   ```bash
   # NEVER do this
   const API_KEY = "hardcoded_key_123"
   
   # ALWAYS do this
   const API_KEY = process.env.VITE_API_KEY
   ```

2. **Input Validation:**
   - Validate all user inputs
   - Sanitize data before database operations
   - Use parameterized queries

3. **Authentication:**
   - Use JWT with short expiration times
   - Implement refresh token rotation
   - Hash passwords with bcrypt (min 10 rounds)

4. **API Security:**
   - Implement rate limiting
   - Use CORS properly
   - Validate all API inputs
   - Use HTTPS in production

## 🚨 Known Security Considerations

### Current Status

1. **Firebase Security Rules:**
   - Firestore rules need to be configured per deployment
   - Default rules are permissive for development
   - **ACTION REQUIRED:** Tighten rules in production

2. **API Keys Exposure:**
   - Google Maps API key visible in frontend (by design)
   - **MITIGATION:** Use API key restrictions in Google Cloud Console
   - Restrict to specific domains and APIs

3. **CORS Configuration:**
   - Currently allows localhost for development
   - **ACTION REQUIRED:** Update `CORS_ORIGIN` for production

### Recommendations

#### Before Production Deployment:

- [ ] Set up proper Firebase Security Rules
- [ ] Restrict Google Maps API key to production domain
- [ ] Configure CORS for production URL only
- [ ] Enable rate limiting on all API endpoints
- [ ] Set up DDoS protection (Cloudflare, AWS Shield)
- [ ] Implement request validation on all endpoints
- [ ] Set up security monitoring and alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Enable HTTPS only

## 🔍 Security Checklist

### Backend Security

- [ ] Environment variables properly configured
- [ ] JWT secret strong and unique
- [ ] Password hashing implemented
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting enabled
- [ ] Helmet.js configured
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Logging and monitoring active

### Frontend Security

- [ ] No sensitive data in localStorage
- [ ] API keys properly restricted
- [ ] XSS prevention in user inputs
- [ ] HTTPS enforced
- [ ] Dependencies up to date
- [ ] Content Security Policy configured
- [ ] Proper error handling (no sensitive info leaked)

### Database Security

- [ ] Firebase Security Rules implemented
- [ ] User data properly isolated
- [ ] Indexes created for frequently queried fields
- [ ] Backup strategy in place
- [ ] Access logs enabled

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://react.dev/learn/security)

## 📞 Contact

For security-related questions or concerns:
- **Email:** security@whereismybus.in
- **GitHub:** Open a security advisory (private)

---

**Last Updated:** December 4, 2024

Thank you for helping keep Where Is My Bus and our users safe! 🛡️
