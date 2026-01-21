# Email Scheduler - Server Setup Guide

## Project Overview
This is a full-stack email scheduling application built with:
- **Frontend**: Next.js 14 (React) running on `http://localhost:3000`
- **Backend**: Express.js with TypeScript running on `http://localhost:3001`
- **Database**: SQLite (Prisma ORM)
- **Job Queue**: BullMQ with Redis (optional - falls back to sync sending)
- **Email Service**: Ethereal Email (test SMTP)

---

## Prerequisites

Before starting the servers, ensure you have:
- Node.js (v16 or higher)
- npm (comes with Node.js)
- Git (optional, for cloning)

---

## Installation Steps

### 1. Install Dependencies

**Backend:**
```bash
cd c:\Users\sachi\Desktop\cproject\backend
npm install
```

**Frontend:**
```bash
cd c:\Users\sachi\Desktop\cproject\frontend
npm install
```

### 2. Environment Setup

Ensure the `.env` files are configured (already provided in the project):

**Backend** (`backend/.env`):
- `PORT=3001`
- `DATABASE_URL=file:./dev.db`
- `SMTP_HOST=smtp.ethereal.email`
- `SMTP_PORT=587`
- `SMTP_USER=alyson.beahan@ethereal.email`
- `SMTP_PASSWORD=MKFNAkMHEq7qC3pUnK`
- `REDIS_HOST=localhost`
- `REDIS_PORT=6379`

**Frontend** (`frontend/.env.local`):
- `NEXTAUTH_SECRET=your-secret-key`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://localhost:3001`

---

## Starting the Servers

### Option 1: Start Both Servers (Recommended)

Open two terminal windows/tabs:

**Terminal 1 - Backend:**
```bash
cd c:\Users\sachi\Desktop\cproject\backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\sachi\Desktop\cproject\frontend
npm run dev
```

You should see:
```
- Local: http://localhost:3000
```

### Option 2: Quick Start (One Command per Terminal)

**Backend Terminal:**
```bash
cd c:\Users\sachi\Desktop\cproject\backend && npm run dev
```

**Frontend Terminal:**
```bash
cd c:\Users\sachi\Desktop\cproject\frontend && npm run dev
```

---

## Accessing the Application

Once both servers are running:

1. **Open your browser** and navigate to: `http://localhost:3000`
2. **Login** using any credentials (demo mode accepts any email/password):
   - Email: `test@example.com`
   - Password: `any-password`
3. **Dashboard** will display with two main buttons:
   - **Schedule Email** - Schedule emails for a specific time
   - **Send Now** - Send emails immediately

---

## API Endpoints

The backend provides these endpoints at `http://localhost:3001`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API documentation |
| GET | `/health` | Health check |
| POST | `/api/schedule-emails` | Schedule emails |
| POST | `/api/send-now` | Send emails immediately |
| GET | `/api/scheduled-emails` | Get scheduled emails |
| GET | `/api/sent-emails` | Get sent emails |
| GET | `/api/rate-limit-status` | Check rate limits |

---

## Features

### Schedule Email
- Upload CSV file with recipient emails
- Set subject and body
- Choose start time and delay between emails
- Emails are queued for processing

### Send Now
- Enter recipients directly (comma or newline separated)
- Optional delay between emails
- Emails are sent immediately
- Database tracks sent emails

### Email Tracking
- View all scheduled emails
- View all sent emails
- Rate limiting to prevent spam (200 emails/hour per sender)

---

## Troubleshooting

### Port Already in Use
If port 3000 or 3001 is already in use:

**Kill existing processes:**
```bash
taskkill /F /IM node.exe
```

Then restart the servers.

### Redis Connection Error
This is **normal in development**. The system automatically falls back to synchronous email sending when Redis is unavailable.

### Database Issues
Reset the database:
```bash
cd backend
npx prisma migrate reset
```

### CORS Errors
Ensure both servers are running and the `NEXT_PUBLIC_API_URL` is correctly set to `http://localhost:3001`.

---

## Development Notes

- **Hot Reload**: Both servers support hot reloading - changes are reflected immediately
- **Email Testing**: Emails are sent to Ethereal (test SMTP service)
- **View Sent Emails**: Log in to Ethereal at `https://ethereal.email/messages` using:
  - Email: `alyson.beahan@ethereal.email`
  - Password: `MKFNAkMHEq7qC3pUnK`

---

## Database Schema

The application uses Prisma ORM with SQLite. Key tables:
- `EmailJob` - Tracks all email send operations (scheduled, sent, failed)

---

## Next Steps

After starting the servers:
1. Navigate to `http://localhost:3000`
2. Login with any credentials
3. Test the email scheduling or direct send features
4. Check `http://localhost:3001` for API documentation

---

## Additional Commands

**Backend:**
```bash
npm run build      # Build TypeScript
npm run dev        # Development mode with watch
npm run start      # Production mode
```

**Frontend:**
```bash
npm run build      # Build Next.js
npm run dev        # Development mode
npm start          # Production mode
```

---

For more information about the codebase, check individual README files or comments in the source code.
