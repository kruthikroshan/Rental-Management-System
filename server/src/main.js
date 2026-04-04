import { createApp } from './app.module.js';
import { config } from './config/configuration.js';

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ [UNCAUGHT EXCEPTION]', error);
});

createApp()
  .then(app => {
    app.listen(config.port, () => {
      console.log(`API running on http://localhost:${config.port}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
