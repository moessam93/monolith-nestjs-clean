# Simple Environment Setup

## The Problem
You want to use different databases for development and testing, but Prisma always reads `.env` file.

## Simple Solution

### 1. Create Your Environment Files
You already have:
- `.env.testing` (for test database)
- `.env.staging` (for staging database)

### 2. For Development (Default)
Put your development database URL in the main `.env` file:

**`.env`**
```bash
DATABASE_URL="postgresql://postgres:admin@localhost:5432/crowdads-mono-dev?schema=public"
```

### 3. For Testing
When you want to test, temporarily copy your testing config:

**Windows:**
```bash
copy .env.testing .env
npm run prisma:migrate
npm run start:dev
# When done, restore development
copy .env.dev .env  # (if you have one)
```

**Or manually:**
- Copy content from `.env.testing` to `.env`
- Run your commands
- Copy back development content

## That's It!

**No complex scripts, no confusing configurations.**

Just copy the right environment file to `.env` when you need it.

### Quick Commands
```bash
# Development (default)
npm run start:dev
npm run prisma:migrate

# Testing
copy .env.testing .env
npm run prisma:migrate
npm run start:dev

# Back to development  
copy .env.dev .env  # or edit .env manually
```

### Your Environment Files
- `.env` - Currently active (development by default)
- `.env.testing` - Test database config  
- `.env.staging` - Staging database config

**Simple and works!** 🎯
