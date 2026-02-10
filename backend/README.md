# IBISTEK UTY Backend

Backend API untuk IBISTEK UTY dengan Elysia.js, Prisma, dan PostgreSQL.

## 🚀 Tech Stack

- **Runtime**: Bun
- **Framework**: Elysia.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Elysia Type System

## 📁 Struktur Folder (Feature-Based)

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Konfigurasi aplikasi
│   │   ├── database.ts        # Prisma client setup
│   │   └── env.ts             # Environment variables
│   ├── common/                # Shared utilities
│   │   ├── errors.ts          # Custom error classes
│   │   ├── pagination.ts      # Pagination helper
│   │   └── response.ts        # API response helper
│   ├── features/              # Feature modules
│   │   ├── events/
│   │   │   ├── event.service.ts
│   │   │   └── event.routes.ts
│   │   ├── programs/
│   │   │   ├── program.service.ts
│   │   │   └── program.routes.ts
│   │   ├── team/
│   │   │   ├── team.service.ts
│   │   │   └── team.routes.ts
│   │   └── updates/
│   │       ├── update.service.ts
│   │       └── update.routes.ts
│   ├── database/
│   │   └── seed.ts            # Database seeder
│   └── index.ts               # Main application entry
├── .env                       # Environment variables (create this!)
├── .env.example               # Example environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ibistek_db?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
API_PREFIX=/api/v1
```

### 3. Setup Database

**A. Jika menggunakan PostgreSQL lokal:**

```bash
# Buat database
createdb ibistek_db

# atau menggunakan psql
psql -U postgres
CREATE DATABASE ibistek_db;
```

**B. Jika menggunakan PostgreSQL di Docker:**

```bash
docker run --name postgres-ibistek \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=ibistek_db \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
bun db:generate

# Push schema ke database (development)
bun db:push
```

### 5. Seed Database (Optional)

```bash
bun db:seed
```

### 6. Start Development Server

```bash
bun dev
```

Server akan berjalan di `http://localhost:3001`

## 📚 API Documentation

Setelah server berjalan, akses Swagger documentation di:

```
http://localhost:3001/swagger
```

## 🔗 API Endpoints

### Events
- `GET /api/v1/events` - Get all events (with pagination & filters)
- `GET /api/v1/events/upcoming` - Get upcoming events
- `GET /api/v1/events/:slug` - Get event by slug
- `POST /api/v1/events` - Create new event
- `PUT /api/v1/events/:id` - Update event
- `DELETE /api/v1/events/:id` - Delete event

### Programs
- `GET /api/v1/programs` - Get all programs
- `GET /api/v1/programs/:slug` - Get program by slug
- `POST /api/v1/programs` - Create new program
- `PUT /api/v1/programs/:id` - Update program
- `DELETE /api/v1/programs/:id` - Delete program

### Team
- `GET /api/v1/team` - Get all team members
- `GET /api/v1/team/:id` - Get team member by ID
- `POST /api/v1/team` - Create new team member
- `PUT /api/v1/team/:id` - Update team member
- `DELETE /api/v1/team/:id` - Delete team member

### Updates
- `GET /api/v1/updates` - Get all updates (with pagination)
- `GET /api/v1/updates/recent` - Get recent updates
- `GET /api/v1/updates/:slug` - Get update by slug
- `POST /api/v1/updates` - Create new update
- `PUT /api/v1/updates/:id` - Update update
- `DELETE /api/v1/updates/:id` - Delete update

## 🗄️ Database Schema

Database menggunakan PostgreSQL dengan Prisma ORM:

- **Event** - Event management
- **Program** - Program information
- **TeamMember** - Team members
- **Update** - News and updates
- **Partner** - Partner organizations (ready for future)
- **FAQ** - FAQ content (ready for future)

## 🧪 Development

```bash
# Development dengan hot reload
bun dev

# Start production
bun start

# Open Prisma Studio (GUI untuk database)
bun db:studio
```

## 📝 Scripts

- `bun dev` - Start development server dengan hot reload
- `bun start` - Start production server
- `bun db:push` - Push Prisma schema ke database
- `bun db:generate` - Generate Prisma Client
- `bun db:studio` - Open Prisma Studio
- `bun db:seed` - Seed database dengan sample data

## 🏗️ Feature Pattern

Setiap feature module mengikuti pattern:

```
features/
└── feature-name/
    ├── feature.service.ts    # Business logic & database operations
    └── feature.routes.ts     # API routes & validation
```

## 🔒 Error Handling

API menggunakan custom error classes:
- `AppError` - Base error class
- `NotFoundError` - 404 errors
- `BadRequestError` - 400 errors
- `ValidationError` - 422 errors

## 📦 Response Format

Semua API response menggunakan format standard:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Optional detailed message"
}
```

## 🔮 Next Steps

1. Add authentication & authorization
2. Add file upload for images
3. Add Partners & FAQ features
4. Add email notifications
5. Add registration management
6. Add analytics & reporting

## 📞 Support

Untuk pertanyaan atau issues, silakan hubungi tim development.
