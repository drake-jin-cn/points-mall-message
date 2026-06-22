# points-mall-message

> Lightweight Node.js service handling two IO-intensive concerns: local file storage and internal system notifications, both driven by asynchronous event consumption.

## Responsibilities

- **Local File Storage** — multipart upload endpoint; stores product images and attendance proof files on local disk; serves static files with access control
- **RabbitMQ Consumer** — consumes domain events published by BFF: `order_completed`, `points_issued`, `attendance_anomaly`; persists each event as a notification record
- **Internal Notification API** — CRUD for notifications: create, list (paginated), mark-as-read, mark-all-read, unread count
- **File Metadata** — tracks uploaded file records (filename, size, uploader, timestamp) in PostgreSQL

## Why This Tech Stack

This service does two things: consume a message queue and serve file metadata. Both are pure IO — no CPU-intensive computation, no complex business rules. A lightweight Express + TypeScript setup is the right tool: minimal overhead, async IO by default, and nothing in the framework fighting the service's actual purpose.

NestJS would be over-engineering here. The deliberate choice of a minimal framework is itself a signal: knowing *when not* to use a structured framework is as important as knowing how to use one.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Node.js 22, Express 5, TypeScript 5.8 |
| ORM | Prisma (PostgreSQL) |
| File Handling | Multer (multipart), `fs/promises` |
| Message Queue | amqplib (RabbitMQ consumer) |
| Auth | JWT middleware (validates BFF-issued tokens) |

## Local Development

```bash
pnpm install
pnpm run dev
# API: http://localhost:8082
```

## Key Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/points_message
RABBITMQ_URL=amqp://localhost:5672
UPLOAD_DIR=./uploads
JWT_SECRET=your-secret
```

## Design Note

This service intentionally stays minimal — no heavy frameworks, no complex business logic. Its purpose is to be a reliable IO hub. High-level MQ features (dead-letter queues, clustering, retry strategies) are understood at the architecture level but deliberately excluded to keep the service lean and the codebase focused.
