"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmailToQueue = exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
exports.emailQueue = new bullmq_1.Queue('emailQueue', {
    connection: redis_1.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: true,
    },
});
const addEmailToQueue = async (jobData, delayMs) => {
    const job = await exports.emailQueue.add('sendEmail', jobData, {
        delay: delayMs,
        jobId: `${jobData.emailJobId}-${Date.now()}`,
    });
    return job;
};
exports.addEmailToQueue = addEmailToQueue;
