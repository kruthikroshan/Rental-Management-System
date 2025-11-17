/**
 * Frontend Security Utilities
 * Client-side security measures and input validation
 */

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML.slice(0, 1000);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain a lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain a special character' };
  }
  
  return { valid: true };
}

/**
 * Calculate password strength
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: 'No Password', color: 'gray' };
  
  let score = 0;
  
  // Length score
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
  
  // Additional complexity
  if (/[a-z].*[a-z]/.test(password)) score += 5;
  if (/[A-Z].*[A-Z]/.test(password)) score += 5;
  if (/\d.*\d/.test(password)) score += 5;
  
  // Penalize common patterns
  if (/^[0-9]+$/.test(password)) score -= 20;
  if (/^[a-zA-Z]+$/.test(password)) score -= 10;
  if (/(abc|123|qwerty|password)/i.test(password)) score -= 30;
  
  score = Math.max(0, Math.min(100, score));
  
  if (score < 40) return { score, label: 'Weak', color: 'red' };
  if (score < 60) return { score, label: 'Fair', color: 'orange' };
  if (score < 80) return { score, label: 'Good', color: 'yellow' };
  return { score, label: 'Strong', color: 'green' };
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^[\+]?[0-9]{7,15}$/.test(cleaned);
}

/**
 * Secure token storage
 */
export const secureStorage = {
  setToken(key: string, token: string): void {
    try {
      // In production, consider using httpOnly cookies instead
      sessionStorage.setItem(key, token);
    } catch (error) {
      // Handle storage quota exceeded
    }
  },
  
  getToken(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  
  removeToken(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      // Handle error
    }
  },
  
  clearAll(): void {
    try {
      sessionStorage.clear();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch (error) {
      // Handle error
    }
  }
};

/**
 * Prevent clickjacking
 */
export function preventClickjacking(): void {
  if (window.self !== window.top) {
    // Page is in an iframe
    window.top!.location = window.self.location;
  }
}

/**
 * Secure URL validation
 */
export function isSecureUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Rate limit tracker for client-side
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  checkLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false; // Rate limit exceeded
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * CSRF token management
 */
export const csrfToken = {
  get(): string | null {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
  },
  
  addToHeaders(headers: HeadersInit = {}): HeadersInit {
    const token = this.get();
    if (token) {
      return {
        ...headers,
        'X-CSRF-Token': token
      };
    }
    return headers;
  }
};

/**
 * Safe redirect to prevent open redirect vulnerabilities
 */
export function safeRedirect(url: string, allowedDomains: string[] = []): void {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Only allow same origin or whitelisted domains
    if (parsed.origin === window.location.origin) {
      window.location.href = url;
      return;
    }
    
    if (allowedDomains.some(domain => parsed.hostname.endsWith(domain))) {
      window.location.href = url;
      return;
    }
    
    // Fallback to home
    window.location.href = '/';
  } catch {
    window.location.href = '/';
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Initialize security measures
 */
export function initSecurity(): void {
  // Prevent clickjacking
  preventClickjacking();
  
  // Disable right-click in production (optional)
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      // Uncomment to disable right-click
      // e.preventDefault();
    });
  }
  
  // Clear sensitive data on beforeunload
  window.addEventListener('beforeunload', () => {
    // Clear any sensitive temporary data
    sessionStorage.removeItem('temp_sensitive_data');
  });
  
  // Monitor for suspicious activity
  let suspiciousActivityCount = 0;
  const MAX_SUSPICIOUS = 10;
  
  window.addEventListener('error', (event) => {
    // Log errors without exposing sensitive data
    suspiciousActivityCount++;
    
    if (suspiciousActivityCount > MAX_SUSPICIOUS) {
      // Too many errors - possible attack
      secureStorage.clearAll();
      window.location.href = '/';
    }
  });
}
