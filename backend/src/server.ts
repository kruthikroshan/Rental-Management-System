import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './config/database';
import { validateEnv } from './config/env';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboardRoutes';
import productRoutes from './routes/productRoutes';
import bookingRoutes from './routes/bookingRoutes';
import quotationRoutes from './routes/quotationRoutes';
import customerRoutes from './routes/customerRoutes';
import publicRoutes from './routes/publicRoutes';
import recommendationRoutes from './routes/recommendationRoutes';

// Load environment variables
dotenv.config();

// Validate environment configuration
try {
  validateEnv();
} catch (error) {
  console.error('Failed to start server due to environment configuration errors');
  process.exit(1);
}

// Create Express app
const app = express();

// Security middleware - Helmet for secure HTTP headers
app.use(helmet({
  // Allow cross-origin requests for frontend
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // Content Security Policy - customize based on your needs
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false, // Disable CSP in development for easier debugging
  
  // Prevent clickjacking attacks
  frameguard: { action: 'deny' },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // HSTS - Force HTTPS in production
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false,
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per minute for dev
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Skip rate limiting in development
});

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Get allowed origins from environment variable or use defaults
    const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
    const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim()).filter(Boolean);
    
    // Add default development origins if in dev mode
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push(
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000'
      );
    }
    
    console.log('CORS Origin Check:', { origin, allowedOrigins });
    
    // In development mode, allow requests with no origin (mobile apps, Postman, etc.)
    if (process.env.NODE_ENV !== 'production' && !origin) {
      console.log('Allowing request with no origin (development mode)');
      return callback(null, true);
    }
    
    // In development, allow local network requests
    if (process.env.NODE_ENV !== 'production' && origin) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || 
          origin.match(/http:\/\/(?:192\.168|10\.|172\.(?:1[6-9]|2[0-9]|3[01])\.)/)) {
        console.log('CORS: Development - allowing local network origin:', origin);
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS: Origin allowed:', origin);
      callback(null, true);
    } else {
      console.error('CORS Error: Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Rental Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Properties routes (placeholder)
app.get('/api/properties', (req, res) => {
  res.json({ message: 'Properties endpoint - Coming soon' });
});

// Bookings routes (placeholder)
app.get('/api/bookings', (req, res) => {
  res.json({ message: 'Bookings endpoint - Coming soon' });
});

// Customers routes (placeholder)
app.get('/api/customers', (req, res) => {
  res.json({ message: 'Customers endpoint - Coming soon' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Rental Management System API',
    documentation: '/api/docs',
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = parseInt(process.env.PORT || '3000');

// Start server after database initialization
async function startServer() {
  try {
    // Initialize database in background (non-blocking)
    console.log('🔄 Initializing database connection...');
    initializeDatabase()
      .then(() => console.log('✅ Database connected successfully'))
      .catch(err => console.log('❌ MongoDB connection failed:', err.message));
    
    // Start the HTTP server immediately (don't wait for DB)
    console.log('🔄 Starting HTTP server...');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`🌐 Server listening on all interfaces (0.0.0.0:${PORT})`);
    });

    server.on('error', (err) => {
      console.error('❌ Server failed to start:', err);
      process.exit(1);
    });

    server.on('listening', () => {
      console.log('✅ Server is now listening for connections');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 Received SIGINT, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
