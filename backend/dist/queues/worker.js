"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
const emailService_1 = require("../services/emailService");
const rateLimiter_1 = require("../services/rateLimiter");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DELAY_BETWEEN_EMAILS_MS = parseInt(process.env.DELAY_BETWEEN_EMAILS_MS || '1000');
let worker = null;
exports.worker = worker;
let workerInitialized = false;
const initializeWorker = async () => {
    if (worker)
        return;
    try {
        exports.worker = worker = new bullmq_1.Worker('emailQueue', async (job) => {
            try {
                const { recipient, subject, body, sender, userId, emailJobId, } = job.data;
                // Check rate limit for this sender
                const canSend = await (0, rateLimiter_1.checkAndUpdateRateLimit)(sender);
                if (!canSend) {
                    // Reschedule to next hour window
                    console.log(`Rate limit reached for sender ${sender}. Rescheduling...`);
                    await job.moveToDelayed(Date.now() + 3600000, 'default');
                    throw new Error('Rate limit exceeded. Job rescheduled.');
                }
          
                await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_EMAILS_MS));
       
                await (0, emailService_1.sendEmail)({
                    recipient,
                    subject,
                    body,
                    sender,
                    emailJobId,
                });
                return { success: true, emailJobId };
            }
            catch (error) {
                console.error('Worker error:', error);
                throw error;
            }
        }, {
            connection: redis_1.redisConnection,
            concurrency: parseInt(process.env.CONCURRENCY || '5'),
        });
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
    }
    catch (err) {
        console.warn('⚠️ Worker initialization (will retry when Redis is ready)');
        setTimeout(initializeWorker, 5000);
    }
};

setImmediate(() => {
    initializeWorker().catch((err) => {
        
        console.debug('Worker init pending...');
    });
});

const retryInterval = setInterval(() => {
    if (!workerInitialized) {
        initializeWorker().catch(() => {
          
        });
    }
    else {
        clearInterval(retryInterval);
    }
}, 10000);

redis_1.redisConnection.on('connect', () => {
    if (!workerInitialized) {
        initializeWorker().catch(() => {
          
        });
    }
});
