"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisConnection = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    },
});
exports.redisConnection = redisConnection;
redisConnection.on('connect', () => {
    console.log('✅ Redis connected');
});
redisConnection.on('error', (err) => {
    const errorCode = err.code || 'UNKNOWN';
    console.warn('⚠️ Redis connection error (will retry automatically):', errorCode);
});
redisConnection.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});
