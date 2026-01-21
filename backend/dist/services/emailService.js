"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const prismaClient_1 = require("../models/prismaClient");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});
const sendEmail = async ({ recipient, subject, body, sender, emailJobId, }) => {
    try {
        console.log(`📧 Sending email to ${recipient}...`);
        await transporter.sendMail({
            from: sender,
            to: recipient,
            subject,
            html: body,
        });
        await prismaClient_1.prisma.emailJob.update({
            where: { id: emailJobId },
            data: {
                status: 'sent',
                sentAt: new Date(),
            },
        });
        console.log(`✅ Email sent to ${recipient}`);
    }
    catch (error) {
        console.error(`❌ Failed to send email to ${recipient}:`, error);
        await prismaClient_1.prisma.emailJob.update({
            where: { id: emailJobId },
            data: { status: 'failed' },
        });
        throw error;
    }
};
exports.sendEmail = sendEmail;
