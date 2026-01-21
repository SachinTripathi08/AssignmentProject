import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redisConnection.on('connect', () => {
  console.log('✅ Redis connected');
});

redisConnection.on('error', (err) => {
  const errorCode = (err as any).code || 'UNKNOWN';
  console.warn('⚠️ Redis connection error (will retry automatically):', errorCode);
});

redisConnection.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

export { redisConnection };
