"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRateLimitStatus = exports.checkAndUpdateRateLimit = void 0;
const redis_1 = require("../queues/redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MAX_EMAILS_PER_HOUR = parseInt(process.env.MAX_EMAILS_PER_HOUR_PER_SENDER || '200');

const checkAndUpdateRateLimit = async (sender) => {
   
    const now = new Date();
    const hourKey = `rate:${sender}:${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}-${String(now.getUTCHours()).padStart(2, '0')}`;
    try {
        const current = await redis_1.redisConnection.incr(hourKey);
      
        await redis_1.redisConnection.expire(hourKey, 3661);
        console.log(`📊 Rate limit: ${current}/${MAX_EMAILS_PER_HOUR} for ${sender}`);
        return current <= MAX_EMAILS_PER_HOUR;
    }
    catch (error) {
        console.error('Rate limit check error:', error);
       
        return true;
    }
};
exports.checkAndUpdateRateLimit = checkAndUpdateRateLimit;

const getRateLimitStatus = async (sender) => {
    const now = new Date();
    const hourKey = `rate:${sender}:${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}-${String(now.getUTCHours()).padStart(2, '0')}`;
    try {
        const value = await redis_1.redisConnection.get(hourKey);
        const current = value ? parseInt(value) : 0;
        return {
            current,
            limit: MAX_EMAILS_PER_HOUR,
            remaining: Math.max(0, MAX_EMAILS_PER_HOUR - current),
        };
    }
    catch (error) {
        console.error('Error getting rate limit status:', error);
        return {
            current: 0,
            limit: MAX_EMAILS_PER_HOUR,
            remaining: MAX_EMAILS_PER_HOUR,
        };
    }
};
exports.getRateLimitStatus = getRateLimitStatus;
