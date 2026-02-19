import 'dotenv/config'; // Loads variables immediately
import app from './app.js';
import connectDB from './config/database.js';
import logger from './utils/logger.js';

const DEFAULT_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_TRIES = Number(process.env.PORT_TRIES) || 10;

const startServer = async () => {
  try {
    await connectDB();
    logger.info('✅ Database handshake successful.');

    let currentPort = DEFAULT_PORT;
    let triesLeft = MAX_PORT_TRIES;
    let server;

    while (!server) {
      try {
        // eslint-disable-next-line no-await-in-loop
        server = await new Promise((resolve, reject) => {
          const s = app.listen(currentPort, () => resolve(s));
          s.on('error', reject);
        });
      } catch (err) {
        if (err?.code === 'EADDRINUSE' && triesLeft > 0) {
          logger.warn(`⚠️ Port ${currentPort} is in use. Trying ${currentPort + 1}...`);
          currentPort += 1;
          triesLeft -= 1;
          continue;
        }
        throw err;
      }
    }

    logger.info(`🚀 RecallIQ AI Server running on port ${currentPort} [${process.env.NODE_ENV}]`);

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${currentPort} is already in use.`);
      } else {
        logger.error('❌ Server Error:', err);
      }
      process.exit(1);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('💥 FATAL ERROR DURING STARTUP:');
    logger.error(err.message);

    if (err.message.includes('ECONNREFUSED')) {
      logger.error('👉 TIP: Is your MongoDB service running? Try: services.msc');
    }

    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
