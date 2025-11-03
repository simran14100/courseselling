// Load environment variables first
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Current working directory:', process.cwd());

// Import the main app from backend/index.js
let app;
try {
  app = require('./backend/index');
  console.log('Successfully imported Express app from backend/index.js');
} catch (error) {
  console.error('Failed to import Express app:', error);
  process.exit(1);
}

// Get port from environment variables or use default
const PORT = process.env.PORT || 4000;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server time: ${new Date().toISOString()}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM (for Docker and other container orchestration)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Perform any cleanup if needed
  process.exit(1);
});
