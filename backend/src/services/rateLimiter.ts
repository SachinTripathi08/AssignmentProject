import { redisConnection } from '../queues/redis';
import dotenv from 'dotenv';

dotenv.config();

const MAX_EMAILS_PER_HOUR = parseInt(
  process.env.MAX_EMAILS_PER_HOUR_PER_SENDER || '200'
);

/**
 * Rate limiting logic:
 * - Uses Redis hash to track emails per hour per sender
 * - Key format: rate:SENDER:HOUR (e.g., rate:user@gmail.com:2024-01-21-14)
 * - When limit is reached, jobs are rescheduled to the next hour
 * - Safe across multiple workers (Redis atomic operations)
 */
export const checkAndUpdateRateLimit = async (sender: string): Promise<boolean> => {
  const now = new Date();
  const hourKey = `rate:${sender}:${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}-${String(now.getUTCHours()).padStart(2, '0')}`;

  try {
    const current = await redisConnection.incr(hourKey);

    await redisConnection.expire(hourKey, 3661);

    console.log(
      `📊 Rate limit: ${current}/${MAX_EMAILS_PER_HOUR} for ${sender}`
    );

    return current <= MAX_EMAILS_PER_HOUR;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open: allow sending if Redis is down
    
};


export const getRateLimitStatus = async (sender: string): Promise<{
  current: number;
  limit: number;
  remaining: number;
}> => {
  const now = new Date();
  const hourKey = `rate:${sender}:${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}-${String(now.getUTCHours()).padStart(2, '0')}`;

  try {
    const value = await redisConnection.get(hourKey);
    const current = value ? parseInt(value) : 0;
    return {
      current,
      limit: MAX_EMAILS_PER_HOUR,
      remaining: Math.max(0, MAX_EMAILS_PER_HOUR - current),
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return {
      current: 0,
      limit: MAX_EMAILS_PER_HOUR,
      remaining: MAX_EMAILS_PER_HOUR,
    };
  }
};