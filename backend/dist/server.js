"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 3001;

const server = app_1.default.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log('📧 Email worker ready (awaiting Redis connection)');
});

setTimeout(() => {
    console.log('🚀 Email worker started');
}, 1000);
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
exports.default = server;
