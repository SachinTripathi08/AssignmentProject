"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const scheduleEmail_1 = require("./controllers/scheduleEmail");
const app = (0, express_1.default)();

app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.post('/api/schedule-emails', scheduleEmail_1.scheduleEmails);
app.get('/api/scheduled-emails', scheduleEmail_1.getScheduledEmails);
app.get('/api/sent-emails', scheduleEmail_1.getSentEmails);
app.get('/api/rate-limit-status', scheduleEmail_1.getRateLimitInfo);

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
exports.default = app;
