/**
 * Frontend Data Privacy Utilities
 * Protects user data on the client side
 */

/**
 * Mask email for display
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  const visibleChars = Math.min(2, username.length - 1);
  const maskedUsername = username.length > 2
    ? username.substring(0, visibleChars) + '*'.repeat(username.length - visibleChars)
    : username;
    
  const [domainName, ext] = domain.split('.');
  const maskedDomain = domainName.length > 2
    ? domainName.substring(0, 2) + '*'.repeat(domainName.length - 2)
    : domainName;
    
  return `${maskedUsername}@${maskedDomain}.${ext}`;
}

/**
 * Mask phone number
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  
  return `***-***-${digits.slice(-4)}`;
}

/**
 * Mask credit card number
 */
export function maskCreditCard(card: string): string {
  if (!card || typeof card !== 'string') return '';
  
  const digits = card.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  
  return `**** **** **** ${digits.slice(-4)}`;
}

/**
 * Generic string masking
 */
export function maskString(str: string, visibleStart: number = 1, visibleEnd: number = 1): string {
  if (!str || typeof str !== 'string') return '';
  
  if (str.length <= visibleStart + visibleEnd) {
    return '*'.repeat(str.length);
  }
  
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const middle = '*'.repeat(str.length - visibleStart - visibleEnd);
  
  return `${start}${middle}${end}`;
}

/**
 * Check if localStorage is accessible
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Securely store sensitive data with encryption
 * Note: This is basic obfuscation, not true encryption
 * For production, use Web Crypto API or similar
 */
export function secureStore(key: string, value: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    // Basic encoding (NOT secure encryption, just obfuscation)
    const encoded = btoa(value);
    localStorage.setItem(key, encoded);
  } catch (error) {
    console.error('Failed to store data securely');
  }
}

/**
 * Retrieve securely stored data
 */
export function secureRetrieve(key: string): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  try {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;
    
    return atob(encoded);
  } catch (error) {
    console.error('Failed to retrieve data securely');
    return null;
  }
}

/**
 * Securely remove data
 */
export function secureRemove(key: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove data securely');
  }
}

/**
 * Clear all sensitive data from storage
 */
export function clearSensitiveData(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    // Remove known sensitive keys
    const sensitiveKeys = [
      'auth_token',
      'token',
      'accessToken',
      'refreshToken',
      'user',
      'userProfile',
      'session',
    ];
    
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear sensitive data');
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
    
  return sanitized;
}

/**
 * Validate if string contains sensitive patterns
 */
export function containsSensitiveData(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  
  const sensitivePatterns = [
    /\b\d{16}\b/g, // Credit card
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /password/gi,
    /secret/gi,
    /token/gi,
    /api[_-]?key/gi,
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(str));
}

/**
 * Remove sensitive fields from object before logging or display
 */
export function stripSensitiveFields<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'api_key',
    'creditCard',
    'ssn',
    'salt',
  ];
  
  const cleaned = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (field in cleaned) {
      delete cleaned[field];
    }
  });
  
  return cleaned;
}

/**
 * Safe console log that strips sensitive data
 */
export function safeLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'production') {
    // Don't log in production
    return;
  }
  
  if (data) {
    const cleanedData = stripSensitiveFields(data);
    console.log(message, cleanedData);
  } else {
    console.log(message);
  }
}

/**
 * Detect if user is viewing sensitive data
 * Returns true if sensitive data should be masked
 */
export function shouldMaskData(): boolean {
  // Check if user has privacy mode enabled
  const privacyMode = localStorage.getItem('privacyMode');
  if (privacyMode === 'true') return true;
  
  // Check if user is in public/shared environment
  // This could be detected via screen sharing APIs if available
  return false;
}

/**
 * Format user data for display with privacy protection
 */
export function formatUserForDisplay(user: any): any {
  if (!user) return null;
  
  const masked = { ...user };
  
  // Apply masking based on privacy settings
  if (shouldMaskData()) {
    if (masked.email) masked.email = maskEmail(masked.email);
    if (masked.phone) masked.phone = maskPhone(masked.phone);
  }
  
  // Always remove sensitive fields
  delete masked.passwordHash;
  delete masked.password;
  delete masked.salt;
  delete masked.token;
  delete masked.refreshToken;
  
  return masked;
}

/**
 * Prevent screenshot/screen recording detection
 * Note: This is informational only, can't actually prevent it
 */
export function detectScreenCapture(): void {
  if (typeof document === 'undefined') return;
  
  // Detect if DevTools is open (common for screen recording)
  const devtools = /./;
  devtools.toString = function() {
    // This gets called when console is open
    if (process.env.NODE_ENV === 'production') {
      console.warn('Privacy Notice: Avoid sharing sensitive information');
    }
    return '';
  };
}

/**
 * Initialize privacy protections
 */
export function initializePrivacy(): void {
  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    // Clear session storage
    sessionStorage.clear();
  });
  
  // Detect screen capture attempts
  detectScreenCapture();
  
  // Disable right-click in production for sensitive pages
  if (process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('sensitive-data')) {
        e.preventDefault();
      }
    });
  }
}
