import { Queue } from 'bullmq';
import { redisConnection } from './redis';
import { sendEmail } from '../services/emailService';

let queue: Queue | null = null;
let queueReady = false;

const initializeQueue = () => {
  if (queueReady || queue) return;
  try {
    if (redisConnection.status === 'ready') {
      queue = new Queue('emailQueue', {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        },
      });
      queueReady = true;
      console.log('📦 Email queue ready');
    }
  } catch (err) {
    console.warn('⚠️ Queue initialization failed, will try again');
  }
};

// Try to initialize queue
redisConnection.on('ready', () => {
  initializeQueue();
});

export const emailQueue = new Queue('emailQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  },
});

export const addEmailToQueue = async (
  jobData: {
    recipient: string;
    subject: string;
    body: string;
    sender: string;
    userId: string;
    emailJobId: string;
  },
  delayMs: number
) => {
  try {
    const job = await emailQueue.add('sendEmail', jobData, {
      delay: delayMs,
      jobId: `${jobData.emailJobId}-${Date.now()}`,
    });
    console.log(`📨 Email queued for ${jobData.recipient}`);
    return job;
  } catch (error) {
    console.warn(`⚠️ Queue unavailable, sending email synchronously:`, error instanceof Error ? error.message : error);
    // Fallback: send email immediately if Redis is not available
    try {
      await sendEmail({
        recipient: jobData.recipient,
        subject: jobData.subject,
        body: jobData.body,
        sender: jobData.sender,
        emailJobId: jobData.emailJobId,
      });
      console.log(`✅ Email sent synchronously to ${jobData.recipient}`);
      return { data: jobData, id: `sync-${Date.now()}` };
    } catch (syncError) {
      console.error(`❌ Failed to send email synchronously:`, syncError);
      throw syncError;
    }
  }
};