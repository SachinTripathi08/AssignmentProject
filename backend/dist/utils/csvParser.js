"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCSV = parseCSV;
exports.validateEmail = validateEmail;
exports.stringifyCSV = stringifyCSV;

function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter((line) => line.trim());
    if (lines.length === 0) {
        return [];
    }
    const firstLine = lines[0];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    const isHeader = /email|e-mail|recipient|address/i.test(firstLine);
    const startIdx = isHeader ? 1 : 0;
    const emails = [];
    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        
        const parts = line.split(',');
        for (const part of parts) {
            const email = part.trim().toLowerCase();
           
            if (emailRegex.test(email)) {
                emails.push(email);
            }
        }
    }
    return [...new Set(emails)]; 
}
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
}
function stringifyCSV(data) {
    return data.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}
