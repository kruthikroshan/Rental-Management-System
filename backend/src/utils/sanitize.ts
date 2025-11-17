/**
 * Input Sanitization Utilities
 * Prevents XSS, SQL injection, and other security vulnerabilities
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>'"]/g, '')
    .slice(0, 255);
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all characters except digits, spaces, +, -, (, )
  return phone
    .trim()
    .replace(/[^\d\s\+\-\(\)]/g, '')
    .slice(0, 20);
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(input: any, min?: number, max?: number): number | null {
  const num = Number(input);
  
  if (isNaN(num) || !isFinite(num)) return null;
  
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  
  return num;
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj || typeof obj !== 'object') return {};
  
  const sanitized: any = {};
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  for (const [key, value] of Object.entries(obj)) {
    if (!dangerousKeys.includes(key)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one digit
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'password1', '123456789', 'letmein', 'welcome', 'admin123'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, message: 'Password is too common. Please choose a stronger password' };
  }
  
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 */
export function sanitizeUrl(url: string, allowedDomains: string[] = []): string | null {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }
    
    // If allowed domains specified, check against them
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) return null;
    }
    
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  filename: string,
  filesize: number,
  allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.pdf'],
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB default
): { valid: boolean; message?: string } {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, message: 'Invalid filename' };
  }
  
  // Check file size
  if (filesize > maxSizeBytes) {
    return { valid: false, message: `File size must not exceed ${maxSizeBytes / 1024 / 1024}MB` };
  }
  
  // Check file extension
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, message: `File type not allowed. Allowed: ${allowedExtensions.join(', ')}` };
  }
  
  // Check for directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { valid: false, message: 'Invalid filename' };
  }
  
  return { valid: true };
}
