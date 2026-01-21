import { Request, Response } from 'express';
import { addEmailToQueue } from '../queues/producer';
import { parseCSV } from '../utils/csvParser';
import { prisma } from '../models/prismaClient';
import { getRateLimitStatus } from '../services/rateLimiter';

interface ScheduleEmailRequest extends Request {
  body: {
    subject: string;
    body: string;
    recipients: string[];
    startTime: string;
    delayBetweenEmails: number;
    sender: string;
    userId: string;
  };
}

export const scheduleEmails = async (
  req: ScheduleEmailRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      subject,
      body,
      recipients,
      startTime,
      delayBetweenEmails,
      sender,
      userId,
    } = req.body;

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

      const scheduledAt = new Date(
        startDateTime.getTime() + i * delayBetweenEmails * 1000
      );

      const emailJob = await prisma.emailJob.create({
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

      const delayMs = Math.max(
        0,
        scheduledAt.getTime() - Date.now()
      );

      await addEmailToQueue(
        {
          recipient,
          subject,
          body,
          sender,
          userId,
          emailJobId: emailJob.id,
        },
        delayMs
      );

      emailJobs.push(emailJob);
    }

    res.status(201).json({
      message: `${emailJobs.length} emails scheduled successfully`,
      emailCount: emailJobs.length,
      firstScheduledAt: emailJobs[0]?.scheduledAt,
      lastScheduledAt: emailJobs[emailJobs.length - 1]?.scheduledAt,
    });
  } catch (error) {
    console.error('Schedule emails error:', error);
    res.status(500).json({
      error: 'Failed to schedule emails',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getScheduledEmails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'userId query parameter is required' });
      return;
    }

    const emails = await prisma.emailJob.findMany({
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
  } catch (error) {
    console.error('Get scheduled emails error:', error);
    res.status(500).json({
      error: 'Failed to fetch scheduled emails',
    });
  }
};

export const getSentEmails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'userId query parameter is required' });
      return;
    }

    const emails = await prisma.emailJob.findMany({
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
  } catch (error) {
    console.error('Get sent emails error:', error);
    res.status(500).json({
      error: 'Failed to fetch sent emails',
    });
  }
};

/**
 * Get rate limit status for a sender
 */
): Promise<void> => {
  try {
    const { sender } = req.query;

    if (!sender || typeof sender !== 'string') {
      res.status(400).json({ error: 'sender query parameter is required' });
      return;
    }

    const status = await getRateLimitStatus(sender);
    res.json(status);
  } catch (error) {
    console.error('Get rate limit error:', error);
    res.status(500).json({
      error: 'Failed to fetch rate limit status',
    });
  }
};

export const sendEmailsNow = async (
  req: ScheduleEmailRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      subject,
      body,
      recipients,
      delayBetweenEmails,
      sender,
      userId,
    } = req.body;

    if (!subject || !body || !recipients || !sender) {
      res.status(400).json({
        error: 'Missing required fields: subject, body, recipients, sender',
      });
      return;
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({
        error: 'Recipients must be a non-empty array',
      });
      return;
    }

    const emailJobs = [];
    const currentTime = new Date();
    const delayMs = (delayBetweenEmails || 1) * 1000; // Convert seconds to milliseconds

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i].trim();

      if (!recipient.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.warn(`⚠️ Skipping invalid email: ${recipient}`);
        continue;
      }

      // Calculate scheduled time with delay between emails
      const scheduledAt = new Date(
        currentTime.getTime() + i * delayMs
      );

      const emailJob = await prisma.emailJob.create({
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

      // Add to queue with spacing between emails
      const jobDelayMs = i * delayMs;

      await addEmailToQueue(
        {
          recipient,
          subject,
          body,
          sender,
          userId,
          emailJobId: emailJob.id,
        },
        jobDelayMs
      );

      emailJobs.push(emailJob);
    }

    res.status(200).json({
      message: `Emails queued for immediate sending to ${emailJobs.length} recipient(s)`,
      jobs: emailJobs,
    });
  } catch (error) {
    console.error('Send emails now error:', error);
    res.status(500).json({
      error: 'Failed to send emails',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};