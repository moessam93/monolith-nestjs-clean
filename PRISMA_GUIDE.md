# Prisma Development Workflow Guide

A comprehensive guide for working with Prisma migrations and database management across different environments.

## 📋 Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run prisma:generate` | Generate Prisma Client | After schema changes (client/generator only) |
| `npm run migrate:dev` | Create + apply migration (dev) | Normal development workflow |
| `npm run migrate:testing` | Apply migrations (testing) | Testing environment |
| `npm run migrate:staging` | Deploy migrations (staging) | Staging deployment |
| `npm run migrate:prod` | Deploy migrations (production) | Production deployment |
| `npm run studio:dev` | Open Prisma Studio | Visual database management |

## 🔄 Development Workflow

### 1. Create → Apply → Deploy (dev → prod)

#### A. Change the Schema
- Edit `prisma/schema.prisma`

#### B. Local Development

**Normal case (you changed models/tables):**
```bash
npm run migrate:dev
# Creates migration, applies to dev DB, auto-runs prisma generate
```

**Just want SQL files without touching the DB:**
```bash
npx prisma migrate dev --name <meaningful-name> --create-only
# Writes migration files only. No DB change.
```

**You only changed generator/client settings (not the DB schema):**
```bash
npm run prisma:generate
# Updates Prisma Client only. No DB change.
```

#### C. Commit
- Commit `schema.prisma` **and** the new `prisma/migrations/<timestamp>_<name>/` folder

#### D. Deploy to Staging/Production
```bash
npm run migrate:staging  # or migrate:prod
# Applies committed migrations to target DB
```

Optional seeding:
```bash
npx prisma db seed
```

## ⏪ Reverting Changes - All Cases

> **Important**: Prisma has no built-in "down" migrations in production. You usually create a **forward migration** to undo changes, or restore from backup.

### A) You only ran `prisma generate`
- **DB unaffected**. Revert `schema.prisma` (git) if needed, then:
```bash
npm run prisma:generate
```

### B) You ran `migrate dev --create-only` (files exist, not applied)
- **DB unaffected**. Remove the unwanted migration folder:
```bash
rm -rf prisma/migrations/<timestamp>_<name>
```
- Revert `schema.prisma` if needed, then optionally:
```bash
npm run prisma:generate
```

### C) You ran `migrate:dev` and it changed your **dev** DB
- Quickest undo (drops dev DB and reapplies remaining migrations):
```bash
npx prisma migrate reset
```
Then recreate the correct migration.

- If you want to remove the last migration from history too:
```bash
rm -rf prisma/migrations/<timestamp>_<bad_name>
npx prisma migrate reset
```

### D) You deployed to **staging/prod** with `migrate deploy`

**Option 1: Forward fix (recommended)**
- Update `schema.prisma` back to the desired state
- Locally:
```bash
npm run migrate:dev
# Name it something like: revert_<whatever>
```
- Commit & deploy:
```bash
npm run migrate:staging  # or migrate:prod
```

**Option 2: Restore from backup**
- Restore a DB snapshot taken before the deploy (especially if data was impacted)

> **Note**: There is no `npx prisma migrate down` for production.

### E) History mismatch (mark as applied/rolled back without running SQL)
- Adjust only the migrations history (not schema) with `resolve`:
```bash
npx prisma migrate resolve --applied <timestamp>_<name>
npx prisma migrate resolve --rolled-back <timestamp>_<name>
```
- Use carefully—this edits `_prisma_migrations` bookkeeping only.

### F) Rename/tweak a migration that hasn't been applied anywhere
- Delete it and recreate:
```bash
rm -rf prisma/migrations/<timestamp>_<bad_name>
npx prisma migrate dev --name <better_name> --create-only
```

## 🛠️ Available Package Scripts

### Migration Commands
```bash
npm run migrate:dev      # dotenv -e .env.development -- prisma migrate dev
npm run migrate:testing  # dotenv -e .env.testing -- prisma migrate dev  
npm run migrate:staging  # dotenv -e .env.staging -- prisma migrate deploy
npm run migrate:prod     # dotenv -e .env.production -- prisma migrate deploy
```

### Database Studio
```bash
npm run studio:dev       # dotenv -e .env.development -- prisma studio
npm run studio:testing   # dotenv -e .env.testing -- prisma studio
npm run studio:staging   # dotenv -e .env.staging -- prisma studio
npm run studio:prod      # dotenv -e .env.production -- prisma studio
```

### Other Prisma Commands
```bash
npm run prisma:generate  # prisma generate
```

## 🏗️ Database Schema Overview

### Entity Relationships
- **Beat** belongs to one **Influencer** (many-to-one)
- **Beat** belongs to one **Brand** (many-to-one)  
- **Influencer** has many **Beats** (one-to-many)
- **Brand** has many **Beats** (one-to-many)

### Tables
- `influencers` - Influencer information
- `brands` - Brand information  
- `beats` - Campaign beats with foreign keys

## 🔒 Environment Safety

Each environment uses its own database:
- **Development**: `.env.development` → `crowdads_dev`
- **Testing**: `.env.testing` → `crowdads_test`
- **Staging**: `.env.staging` → `crowdads_staging`
- **Production**: `.env.production` → `crowdads_prod`

**Always test migrations in lower environments before production!**

---

## 📝 TL;DR Cheat Sheet

- **Change models?** → `npm run migrate:dev` (auto-runs `generate`)
- **Only client/generator tweaks?** → `npm run prisma:generate`
- **Create files only?** → `npx prisma migrate dev --create-only`
- **Deploy to staging/prod?** → `npm run migrate:staging` / `npm run migrate:prod`
- **Undo in dev?** → `npx prisma migrate reset`
- **Undo in prod?** → Forward migration (or backup restore)
