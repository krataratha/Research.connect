import './config/env.js';
import dns from 'node:dns';
import { installSecureLogger } from './middleware/security/requestGuard.js';

// Install secure logger FIRST — scrubs passwords/tokens from all subsequent console output
installSecureLogger();

// Configure public DNS resolvers ONLY if your local ISP blocks MongoDB Atlas SRV records
// try {
//   dns.setServers(['1.1.1.1', '8.8.8.8']);
// } catch (dnsErr) {
//   console.warn('Failed to configure custom DNS servers:', dnsErr.message);
// }
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './services/socket.service.js';

import { verifyCloudinaryConnection } from './services/upload.service.js';
import { runDailyBackgroundSync } from './services/scholar.service.js';

// Handle uncaught exceptions globally
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    // 1. MongoDB Connect
    await connectDB();
    console.log('\n✓ MongoDB Connected');

    // 2. Cloudinary Connect
    const isCloudinaryOk = await verifyCloudinaryConnection();
    if (isCloudinaryOk) {
      console.log('✓ Cloudinary Connected Successfully');
    }

    // 3. Google Scholar Connect
    if (process.env.SERP_API_KEY) {
      console.log('✓ Google Scholar Connected');
    } else {
      console.warn('⚠️ Google Scholar integrated in Mock fallback mode.');
    }

    // 4. REST API Ready & Server Running
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log('✓ REST API Ready');
      console.log('✓ Server Running\n');
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
    });

    // Initialize Socket.io
    initSocket(server);

    // 5. Start Google Scholar Background Sync (runs every 24 hours)
    runDailyBackgroundSync();
    setInterval(runDailyBackgroundSync, 24 * 60 * 60 * 1000);

    // Handle unhandled promise rejections globally
    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION! 💥 Shutting down gracefully...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
