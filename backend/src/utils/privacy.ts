/**
 * Data Privacy and Masking Utilities
 * Protects sensitive user data from being exposed in responses
 */

/**
 * Sensitive fields that should never be sent to the client
 */
export const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'salt',
  'secret',
  'apiKey',
  'api_key',
  'token',
  'refreshToken',
  'accessToken',
  'privateKey',
  'private_key',
  '__v',
] as const;

/**
 * Fields that should be partially masked when displayed
 */
export const MASKABLE_FIELDS = [
  'email',
  'phone',
  'ssn',
  'creditCard',
  'bankAccount',
] as const;

/**
 * Remove sensitive fields from an object
 */
export function removeSensitiveFields<T extends Record<string, any>>(
  obj: T,
  additionalFields: string[] = []
): Partial<T> {
  if (!obj || typeof obj !== 'object') return obj;

  const fieldsToRemove = [...SENSITIVE_FIELDS, ...additionalFields];
  const cleaned = { ...obj };

  fieldsToRemove.forEach((field) => {
    delete cleaned[field];
  });

  return cleaned;
}

/**
 * Deep clean an object or array, removing sensitive fields recursively
 */
export function deepCleanObject<T>(
  data: T,
  additionalFields: string[] = []
): T {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) =>
      deepCleanObject(item, additionalFields)
    ) as unknown as T;
  }

  // Handle objects
  if (typeof data === 'object') {
    const cleaned: any = {};
    const fieldsToRemove = [...SENSITIVE_FIELDS, ...additionalFields];

    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (fieldsToRemove.includes(key)) {
        continue;
      }

      // Recursively clean nested objects/arrays
      if (value && typeof value === 'object') {
        cleaned[key] = deepCleanObject(value, additionalFields);
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned as T;
  }

  return data;
}

/**
 * Mask email address: j***@ex***.com
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return email;

  const [username, domain] = email.split('@');
  if (!username || !domain) return email;

  const maskedUsername =
    username.length > 2
      ? `${username[0]}${'*'.repeat(username.length - 1)}`
      : username;

  const [domainName, extension] = domain.split('.');
  const maskedDomain =
    domainName.length > 2
      ? `${domainName.slice(0, 2)}${'*'.repeat(domainName.length - 2)}`
      : domainName;

  return `${maskedUsername}@${maskedDomain}.${extension}`;
}

/**
 * Mask phone number: +1 (***) ***-1234
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return phone;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 4) return '***';

  // Show only last 4 digits
  return `***-***-${digits.slice(-4)}`;
}

/**
 * Mask credit card: **** **** **** 1234
 */
export function maskCreditCard(card: string): string {
  if (!card || typeof card !== 'string') return card;

  const digits = card.replace(/\D/g, '');

  if (digits.length < 4) return '****';

  return `**** **** **** ${digits.slice(-4)}`;
}

/**
 * Generic masking function that shows first and last characters
 */
export function maskString(str: string, visible: number = 1): string {
  if (!str || typeof str !== 'string') return str;

  if (str.length <= visible * 2) {
    return '*'.repeat(str.length);
  }

  const start = str.slice(0, visible);
  const end = str.slice(-visible);
  const masked = '*'.repeat(str.length - visible * 2);

  return `${start}${masked}${end}`;
}

/**
 * Sanitize user object for safe transmission
 */
export function sanitizeUser(user: any): any {
  if (!user) return user;

  const cleaned = removeSensitiveFields(user);

  // Optionally mask email for certain contexts
  if (cleaned.email && process.env.MASK_USER_DATA === 'true') {
    cleaned.email = maskEmail(cleaned.email);
  }

  // Optionally mask phone
  if (cleaned.phone && process.env.MASK_USER_DATA === 'true') {
    cleaned.phone = maskPhone(cleaned.phone);
  }

  return cleaned;
}

/**
 * Sanitize error messages to avoid leaking sensitive information
 */
export function sanitizeErrorMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;

  // Remove potential sensitive patterns
  const patterns = [
    /password[^,}]*/gi,
    /token[^,}]*/gi,
    /secret[^,}]*/gi,
    /mongodb\+srv:\/\/[^"']*/gi,
    /api[_-]?key[^,}]*/gi,
    /bearer [a-zA-Z0-9\-._~+/]*/gi,
  ];

  let sanitized = message;
  patterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });

  return sanitized;
}

/**
 * Safe JSON stringify that removes sensitive fields
 */
export function safeStringify(
  obj: any,
  additionalFields: string[] = []
): string {
  const cleaned = deepCleanObject(obj, additionalFields);
  return JSON.stringify(cleaned);
}

/**
 * Mask MongoDB connection string
 */
export function maskConnectionString(connStr: string): string {
  if (!connStr || typeof connStr !== 'string') return connStr;

  // Mask password in MongoDB connection string
  return connStr.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    'mongodb$1://$2:***@'
  );
}

/**
 * Create a safe response object
 */
export function createSafeResponse<T>(
  data: T,
  options: {
    maskSensitive?: boolean;
    additionalFields?: string[];
  } = {}
): T {
  const { maskSensitive = true, additionalFields = [] } = options;

  let result = deepCleanObject(data, additionalFields);

  if (maskSensitive && typeof result === 'object') {
    // Apply masking to specific fields if present
    if (Array.isArray(result)) {
      result = result.map((item) => {
        if (item && typeof item === 'object') {
          const cleaned = { ...item };
          if (cleaned.email) cleaned.email = maskEmail(cleaned.email);
          if (cleaned.phone) cleaned.phone = maskPhone(cleaned.phone);
          return cleaned;
        }
        return item;
      }) as any;
    } else {
      const cleaned: any = { ...result };
      if (cleaned.email) cleaned.email = maskEmail(cleaned.email);
      if (cleaned.phone) cleaned.phone = maskPhone(cleaned.phone);
      result = cleaned;
    }
  }

  return result;
}
