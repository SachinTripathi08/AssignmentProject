import { Worker, Job } from 'bullmq';
import { redisConnection } from './redis';
import { sendEmail } from '../services/emailService';
import { checkAndUpdateRateLimit } from '../services/rateLimiter';
import dotenv from 'dotenv';

dotenv.config();

const DELAY_BETWEEN_EMAILS_MS = parseInt(
  process.env.DELAY_BETWEEN_EMAILS_MS || '1000'
);

let worker: Worker | null = null;
let workerInitialized = false;

const initializeWorker = async () => {
  if (worker) return;

  try {
    worker = new Worker(
      'emailQueue',
      async (job: Job) => {
        try {
          const {
            recipient,
            subject,
            body,
            sender,
            userId,
            emailJobId,
          } = job.data;

          // Check rate limit for this sender
          const canSend = await checkAndUpdateRateLimit(sender);

          if (!canSend) {
            // Reschedule to next hour window
            console.log(
              `Rate limit reached for sender ${sender}. Rescheduling...`
            );
            await job.moveToDelayed(Date.now() + 3600000, 'default');
            throw new Error('Rate limit exceeded. Job rescheduled.');
          }

          // Add delay between emails
          await new Promise((resolve) =>
            setTimeout(resolve, DELAY_BETWEEN_EMAILS_MS)
          );

          // Send email
          await sendEmail({
            recipient,
            subject,
            body,
            sender,
            emailJobId,
          });

          return { success: true, emailJobId };
        } catch (error) {
          console.error('Worker error:', error);
          throw error;
        }
      },
      {
        connection: redisConnection,
        concurrency: parseInt(process.env.CONCURRENCY || '5'),
      }
    );

    worker.on('completed', (job) => {
      console.log(`✅ Job ${job?.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    worker.on('error', (err) => {
      console.error('Worker error event:', err);
    });

    workerInitialized = true;
    console.log('🚀 Email worker initialized');
  } catch (err) {
    console.warn('⚠️ Worker initialization (will retry when Redis is ready)');
    setTimeout(initializeWorker, 5000);
  }
};

// Start initialization asynchronously without blocking
setImmediate(() => {
  initializeWorker().catch((err) => {
    // Silently fail - will retry on next interval
    console.debug('Worker init pending...');
  });
});

// Retry every 10 seconds until worker is ready
const retryInterval = setInterval(() => {
  if (!workerInitialized) {
    initializeWorker().catch(() => {
      // Silently handle retries
    });
  } else {
    clearInterval(retryInterval);
  }
}, 10000);

// Also try when Redis connects
redisConnection.on('connect', () => {
  if (!workerInitialized) {
    initializeWorker().catch(() => {
      // Silently handle
    });
  }
});

export { worker };