import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import mongoose from 'mongoose';
import os from 'os';
import path from 'path';
import { config } from './config/configuration.js';
import { authRouter } from './auth/auth.module.js';
import { usersRouter } from './users/users.controller.js';
import { productsRouter } from './products/products.module.js';
import { rentalsRouter } from './rentals/rentals.module.js';
import { paymentsRouter } from './payments/payments.module.js';
import { reportsRouter } from './reports/reports.module.js';
import { reviewsRouter } from './reviews/reviews.module.js';
import { startRemindersCron } from './notifications/reminders.service.js';
import './auth/oauth.service.js';  // Initialize OAuth strategies

import fs from 'fs';

const logFile = path.join(os.tmpdir(), 'server_trace.log');
const trace = (msg) => {
  try {
    fs.appendFileSync(logFile, `${new Date().toISOString()} ${msg}\n`);
  } catch (e) {}
};

async function connectMongoWithFallback() {
  const candidates = config.mongoUris || [config.mongoUri];
  let lastError = null;

  for (let i = 0; i < candidates.length; i += 1) {
    const uri = candidates[i];
    if (!uri) continue;

    try {
      await mongoose.connect(uri);
      const label = i === 0 ? 'primary' : 'fallback';
      console.log(`MongoDB connected using ${label} URI`);
      trace(`MongoDB connected (${label})`);
      return;
    } catch (err) {
      lastError = err;
      console.error(`MongoDB connection failed (${i === 0 ? 'primary' : 'fallback'}): ${err.message}`);
      trace(`MongoDB connect failed (${i === 0 ? 'primary' : 'fallback'}) ${err.message}`);
    }
  }

  throw lastError || new Error('Failed to connect to MongoDB');
}

export async function createApp() {
  trace('=== APP STARTING ===');
  await connectMongoWithFallback();

  const app = express();
  app.set('trust proxy', true);

  // Earliest logging - before anything else
  app.use((req, res, next) => {
    const requestId = Date.now();
    process.stderr.write(`\n[REQ-${requestId}] START ${req.method} ${req.path}\n`);
    trace(`${req.method} ${req.path}`);
    console.log(`\n🔵 [REQUEST] ${req.method} ${req.path}`);
    console.log(`   Origin: ${req.get('origin')}`);
    console.log(`   Auth Header: ${req.get('authorization') ? 'YES' : 'NO'}`);

    // Store requestId in request for tracing
    req.requestId = requestId;
    next();
  });

  app.use(cors({ origin: config.cors.origin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  // Log all requests for debugging
  app.use((req, res, next) => {
    console.log(`📋 [Parsed] ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`   Body keys: ${Object.keys(req.body).join(', ')}`);
    }
    next();
  });

  // Serve static files for PDF generation
  app.use('/static', express.static(path.join(process.cwd(), 'public')));

  const limiter = rateLimit({ windowMs: 60_000, max: 60 });
  app.use('/auth', limiter);

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Routes without /api prefix (Vite proxy will handle /api rewriting in dev mode)
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/products', productsRouter);
  app.use('/rentals', rentalsRouter);
  app.use('/payments', paymentsRouter);
  app.use('/reports', reportsRouter);
  app.use('/reviews', reviewsRouter);

  // Start background jobs
  startRemindersCron();

  // Global error handler (must be last)
  app.use((err, req, res, next) => {
    const requestId = req.requestId || 'UNKNOWN';
    process.stderr.write(`\n[REQ-${requestId}] ERROR CAUGHT BY GLOBAL HANDLER\n`);
    process.stderr.write(`  Message: ${err.message}\n`);
    process.stderr.write(`  Type: ${err.constructor.name}\n`);
    process.stderr.write(`  Stack: ${err.stack}\n`);

    console.error(`\n❌ [GLOBAL ERROR] REQ-${requestId} ${err.message}`);
    console.error(`   Path: ${req.path}, Method: ${req.method}`);
    console.error(`   Error type: ${err.constructor.name}`);
    console.error(`   Full Error:`, err);

    res.status(err.status || 500).json({ message: err.message });
  });

  return app;
}

