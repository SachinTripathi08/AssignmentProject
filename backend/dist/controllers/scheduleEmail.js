"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRateLimitInfo = exports.getSentEmails = exports.getScheduledEmails = exports.scheduleEmails = void 0;
const producer_1 = require("../queues/producer");
const prismaClient_1 = require("../models/prismaClient");
const rateLimiter_1 = require("../services/rateLimiter");
const scheduleEmails = async (req, res) => {
    try {
        const { subject, body, recipients, startTime, delayBetweenEmails, sender, userId, } = req.body;
        if (!subject || !body || !recipients || !startTime || !sender) {
            res.status(400).json({
                error: 'Missing required fields: subject, body, recipients, startTime, sender',
            });
            return;
        }
        if (!Array.isArray(recipients) || recipients.length === 0) {
            res.status(400).json({
                error: 'Recipients must be a non-empty array',
            });
            return;
        }
        const startDateTime = new Date(startTime);
        if (isNaN(startDateTime.getTime())) {
            res.status(400).json({ error: 'Invalid startTime format' });
            return;
        }
        const emailJobs = [];
        for (let i = 0; i < recipients.length; i++) {
            const recipient = recipients[i].trim();
            if (!recipient.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                console.warn(`⚠️ Skipping invalid email: ${recipient}`);
                continue;
            }
            const scheduledAt = new Date(startDateTime.getTime() + i * delayBetweenEmails * 1000);
            const emailJob = await prismaClient_1.prisma.emailJob.create({
                data: {
                    subject,
                    body,
                    recipient,
                    sender,
                    scheduledAt,
                    userId,
                    status: 'scheduled',
                    sentAt: null,
                },
            });
            const delayMs = Math.max(0, scheduledAt.getTime() - Date.now());
            await (0, producer_1.addEmailToQueue)({
                recipient,
                subject,
                body,
                sender,
                userId,
                emailJobId: emailJob.id,
            }, delayMs);
            emailJobs.push(emailJob);
        }
        res.status(201).json({
            message: `${emailJobs.length} emails scheduled successfully`,
            emailCount: emailJobs.length,
            firstScheduledAt: emailJobs[0]?.scheduledAt,
            lastScheduledAt: emailJobs[emailJobs.length - 1]?.scheduledAt,
        });
    }
    catch (error) {
        console.error('Schedule emails error:', error);
        res.status(500).json({
            error: 'Failed to schedule emails',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.scheduleEmails = scheduleEmails;

const getScheduledEmails = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ error: 'userId query parameter is required' });
            return;
        }
        const emails = await prismaClient_1.prisma.emailJob.findMany({
            where: {
                userId,
                status: 'scheduled',
            },
            orderBy: {
                scheduledAt: 'asc',
            },
            take: 100,
        });
        res.json({
            count: emails.length,
            emails,
        });
    }
    catch (error) {
        console.error('Get scheduled emails error:', error);
        res.status(500).json({
            error: 'Failed to fetch scheduled emails',
        });
    }
};
exports.getScheduledEmails = getScheduledEmails;

const getSentEmails = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ error: 'userId query parameter is required' });
            return;
        }
        const emails = await prismaClient_1.prisma.emailJob.findMany({
            where: {
                userId,
                status: {
                    in: ['sent', 'failed'],
                },
            },
            orderBy: {
                sentAt: 'desc',
            },
            take: 100,
        });
        res.json({
            count: emails.length,
            emails,
        });
    }
    catch (error) {
        console.error('Get sent emails error:', error);
        res.status(500).json({
            error: 'Failed to fetch sent emails',
        });
    }
};
exports.getSentEmails = getSentEmails;

const getRateLimitInfo = async (req, res) => {
    try {
        const { sender } = req.query;
        if (!sender || typeof sender !== 'string') {
            res.status(400).json({ error: 'sender query parameter is required' });
            return;
        }
        const status = await (0, rateLimiter_1.getRateLimitStatus)(sender);
        res.json(status);
    }
    catch (error) {
        console.error('Get rate limit error:', error);
        res.status(500).json({
            error: 'Failed to fetch rate limit status',
        });
    }
};
exports.getRateLimitInfo = getRateLimitInfo;
