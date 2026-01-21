import nodemailer from 'nodemailer';
import { prisma } from '../models/prismaClient';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async ({
  recipient,
  subject,
  body,
  sender,
  emailJobId,
}: {
  recipient: string;
  subject: string;
  body: string;
  sender: string;
  emailJobId: string;
}) => {
  try {
    console.log(`📧 Sending email to ${recipient}...`);
    await transporter.sendMail({
      from: sender,
      to: recipient,
      subject,
      html: body,
    });

    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });

    console.log(`✅ Email sent to ${recipient}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${recipient}:`, error);
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: { status: 'failed' },
    });
    throw error;
  }
};