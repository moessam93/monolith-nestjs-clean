# CrowdAds NestJS Monolith

A NestJS application for managing influencer marketing campaigns with multi-environment support.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create environment files with your database configurations:

```bash
# .env.development
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://username:password@localhost:5432/crowdads_dev?schema=public"

# .env.testing  
NODE_ENV=testing
PORT=3002
DATABASE_URL="postgresql://username:password@localhost:5432/crowdads_test?schema=public"

# .env.staging
NODE_ENV=staging
PORT=3003
DATABASE_URL="postgresql://username:password@localhost:5432/crowdads_staging?schema=public"

# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/crowdads_prod?schema=public"
```

### 3. Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations for your environment
npm run migrate:dev      # Development
npm run migrate:testing  # Testing
npm run migrate:staging  # Staging
npm run migrate:prod     # Production
```

## 🔄 Environment Commands

### Start Application
```bash
npm run start:dev        # 🟢 Development (PORT=3001)
npm run start:testing    # 🟡 Testing (PORT=3002)  
npm run start:staging    # 🟠 Staging (PORT=3003)
npm run start:prod       # 🔴 Production (PORT=3000)
```

### Database Migrations
```bash
npm run migrate:dev      # 🟢 Migrate development DB
npm run migrate:testing  # 🟡 Migrate testing DB
npm run migrate:staging  # 🟠 Migrate staging DB
npm run migrate:prod     # 🔴 Migrate production DB
```

### Database Studio
```bash
npm run studio:dev       # 🟢 Open development DB
npm run studio:testing   # 🟡 Open testing DB
npm run studio:staging   # 🟠 Open staging DB
npm run studio:prod      # 🔴 Open production DB
```

### Other Commands
```bash
npm run build           # Build application
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run e2e tests
npm run lint            # Lint and fix code
```

## 📁 Project Structure

```
src/
├── app.module.ts           # Main application module with environment config
├── beats/                  # Beat management module
├── brands/                 # Brand management module
├── influencers/            # Influencer management module
├── prisma/                 # Prisma database service
└── common/                 # Shared utilities and middleware

prisma/
├── schema.prisma           # Database schema
└── migrations/             # Database migration files
```

## 🔧 How Environment Switching Works

The application uses:
- **@nestjs/config** with Joi validation for environment management
- **dotenv-cli** for loading environment-specific files
- **Environment file precedence**: `.env.{NODE_ENV}` → `.env`

Each command automatically:
1. Loads the correct `.env.{environment}` file
2. Sets the `NODE_ENV` variable
3. Runs the command with proper configuration

## 📊 API Endpoints

### Beats
- `POST /beats` - Create beat
- `GET /beats` - List all beats
- `GET /beats/:id` - Get beat by ID
- `PATCH /beats/:id` - Update beat
- `DELETE /beats/:id` - Delete beat

### Brands  
- `POST /brands` - Create brand
- `GET /brands` - List all brands
- `GET /brands/:id` - Get brand by ID
- `PATCH /brands/:id` - Update brand
- `DELETE /brands/:id` - Delete brand

### Influencers
- `POST /influencers` - Create influencer  
- `GET /influencers` - List all influencers
- `GET /influencers/:id` - Get influencer by ID
- `PATCH /influencers/:id` - Update influencer
- `DELETE /influencers/:id` - Delete influencer

## 📚 Additional Documentation

- [PRISMA_GUIDE.md](./PRISMA_GUIDE.md) - Comprehensive Prisma workflow and commands guide

**That's it! Simple environment switching with proper configuration management!** 🎯