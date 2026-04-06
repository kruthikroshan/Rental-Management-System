import 'dotenv/config';

const trimTrailingSlash = (value) => String(value || '').trim().replace(/\/+$/, '');

const normalizeOrigin = (value) => {
  const raw = trimTrailingSlash(value);
  if (!raw) return null;

  try {
    return new URL(raw).origin;
  } catch {
    return raw;
  }
};

const normalizeHostAsOrigin = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return normalizeOrigin(withScheme);
};

const isTrustedVercelOrigin = (value) => {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

const buildCorsOrigin = () => {
  const envOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN
        .split(',')
        .map(normalizeOrigin)
        .filter(Boolean)
    : [];

  const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);
  const vercelOrigin = normalizeHostAsOrigin(
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  );

  const dedupedOrigins = [...new Set([...envOrigins, frontendOrigin, vercelOrigin].filter(Boolean))];

  // In development, automatically allow common Vite ports
  if ((process.env.NODE_ENV || 'development') !== 'production') {
    const devOrigins = ['http://localhost:5173', 'http://localhost:5174'];
    for (const origin of devOrigins) {
      if (!dedupedOrigins.includes(origin)) dedupedOrigins.push(origin);
    }
  }

  return dedupedOrigins.length > 0 ? dedupedOrigins : true; // reflect request origin if none provided
};

const buildCorsOriginValidator = (allowedOrigins) => {
  const allowVercelOrigins = process.env.ALLOW_VERCEL_ORIGINS
    ? process.env.ALLOW_VERCEL_ORIGINS === 'true'
    : true;

  return (origin, callback) => {
    // Requests from tools/servers may not include an Origin header.
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    if (!normalizedOrigin) return callback(null, false);

    if (allowedOrigins === true) return callback(null, true);
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    if (allowVercelOrigins && isTrustedVercelOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(null, false);
  };
};

const corsOrigins = buildCorsOrigin();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please copy config.example.env to .env and configure your environment variables');
  process.exit(1);
}

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  mongoFallbackUri: process.env.MONGO_FALLBACK_URI || 'mongodb://127.0.0.1:27017/smartrent',
  mongoUris: [
    process.env.MONGO_URI,
    process.env.MONGO_FALLBACK_URI || 'mongodb://127.0.0.1:27017/smartrent'
  ].filter(Boolean),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtlSec: 60 * 15,
    refreshTtlSec: 60 * 60 * 24 * 7
  },
  cors: {
    // Accept env-provided origins, plus common localhost dev ports when not in production.
    origin: buildCorsOriginValidator(corsOrigins),
    credentials: true,
    allowedOrigins: corsOrigins === true ? [] : corsOrigins,
  },
  cookies: {
    name: process.env.COOKIE_NAME || 'rt',
    // Default to secure cookies only in production unless explicitly overridden
    secure: process.env.COOKIE_SECURE
      ? process.env.COOKIE_SECURE === 'true'
      : (process.env.NODE_ENV === 'production'),
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    // Ensure cookie is sent to all routes (so it reaches '/auth' behind '/api' proxy)
    path: process.env.COOKIE_PATH || '/',
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        trimTrailingSlash(process.env.GOOGLE_CALLBACK_URL) ||
        (trimTrailingSlash(process.env.RENDER_EXTERNAL_URL)
          ? `${trimTrailingSlash(process.env.RENDER_EXTERNAL_URL)}/auth/google/callback`
          : 'http://localhost:4000/auth/google/callback')
    }
  },
  frontendUrl: trimTrailingSlash(process.env.FRONTEND_URL || 'http://localhost:5173')
};
