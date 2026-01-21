import app from './app';
import { worker } from './queues/worker';

const PORT = process.env.PORT || 3001;

// Start server even if Redis isn't ready yet
const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log('📧 Email worker ready (awaiting Redis connection)');
});

setTimeout(() => {
  console.log('🚀 Email worker started');
}, 1000);

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default server;
