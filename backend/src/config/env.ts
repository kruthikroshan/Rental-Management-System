/**
 * Environment Variable Validation
 * Validates required environment variables on server startup
 */

interface EnvConfig {
  PORT: string;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  BCRYPT_SALT_ROUNDS: string;
  ALLOWED_ORIGINS?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;
  MAX_REQUEST_SIZE?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

/**
 * Validates environment variables
 * Throws error if critical variables are missing or invalid
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`❌ Missing required environment variable: ${key}`);
    }
  }

  // Validate JWT secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      errors.push('❌ JWT_SECRET must be at least 32 characters long in production');
    }
    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
      errors.push('❌ JWT_REFRESH_SECRET must be at least 32 characters long in production');
    }
    if (!process.env.ALLOWED_ORIGINS) {
      warnings.push('⚠️  ALLOWED_ORIGINS not set - using defaults (may be insecure)');
    }
  }

  // Check for default/weak secrets
  const weakSecrets = [
    'your_super_secret_jwt_key',
    'hackathon_secret_key',
    'change_in_production',
    'development',
    'fallback'
  ];

  const jwtSecret = process.env.JWT_SECRET?.toLowerCase() || '';
  const refreshSecret = process.env.JWT_REFRESH_SECRET?.toLowerCase() || '';

  for (const weak of weakSecrets) {
    if (jwtSecret.includes(weak) || refreshSecret.includes(weak)) {
      if (process.env.NODE_ENV === 'production') {
        errors.push('❌ JWT secrets appear to be default/weak values. Generate secure secrets!');
      } else {
        warnings.push('⚠️  Using default JWT secrets (development only - change for production!)');
      }
      break;
    }
  }

  // Validate MongoDB URI
  if (process.env.MONGODB_URI) {
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && 
        !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      errors.push('❌ MONGODB_URI must start with mongodb:// or mongodb+srv://');
    }
    if (process.env.MONGODB_URI.includes('<username>') || 
        process.env.MONGODB_URI.includes('<password>')) {
      errors.push('❌ MONGODB_URI contains placeholder values - update with real credentials');
    }
  }

  // Validate PORT
  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push('❌ PORT must be a valid number between 1 and 65535');
  }

  // Validate BCRYPT_SALT_ROUNDS
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  if (isNaN(saltRounds) || saltRounds < 10 || saltRounds > 15) {
    warnings.push('⚠️  BCRYPT_SALT_ROUNDS should be between 10 and 15 (default: 12)');
  }

  // Validate rate limiting
  if (process.env.RATE_LIMIT_MAX_REQUESTS) {
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10);
    if (isNaN(maxRequests) || maxRequests < 1) {
      warnings.push('⚠️  RATE_LIMIT_MAX_REQUESTS must be a positive number');
    }
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  Environment Configuration Warnings:');
    warnings.forEach(warning => console.log(warning));
    console.log('');
  }

  // Throw if there are errors
  if (errors.length > 0) {
    console.error('\n🚨 Environment Configuration Errors:');
    errors.forEach(error => console.error(error));
    console.error('\n💡 Tip: Copy .env.example to .env and fill in the required values\n');
    throw new Error('Invalid environment configuration');
  }

  // Success message
  console.log('✅ Environment configuration validated successfully');

  return {
    PORT: process.env.PORT || '3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || '12',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
  };
}

/**
 * Helper to generate secure secrets
 */
export function generateSecrets() {
  const crypto = require('crypto');
  console.log('\n🔐 Secure Secret Generation:');
  console.log('Copy these to your .env file:\n');
  console.log(`JWT_SECRET=${crypto.randomBytes(64).toString('hex')}`);
  console.log(`JWT_REFRESH_SECRET=${crypto.randomBytes(64).toString('hex')}`);
  console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}`);
  console.log('');
}
