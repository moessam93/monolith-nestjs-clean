# CrowdAds NestJS Monolith

A NestJS application for managing influencer marketing campaigns with multi-environment support.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create environment files with your database and JWT configurations:

**Recommended Approach**: Use Base64 encoded keys in environment files for better security and deployment compatibility.

```bash
# .env.development
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://username:password@localhost:5432/crowdads_dev?schema=public"

# JWT Configuration (generated via npm run generate:jwt-keys)
JWT_PRIVATE_KEY_BASE64="LS0tLS1CRUdJTi...base64-encoded-private-key"
JWT_PUBLIC_KEY_BASE64="LS0tLS1CRUdJTi...base64-encoded-public-key"
JWT_ALG=RS256
EXPIRY_DURATION=24h
BCRYPT_SALT_ROUNDS=12

# .env.testing  
NODE_ENV=testing
PORT=3002
DATABASE_URL="postgresql://username:password@localhost:5432/crowdads_test?schema=public"
# Different JWT keys and shorter expiry for testing
EXPIRY_DURATION=1h

# .env.staging
NODE_ENV=staging
PORT=3003
DATABASE_URL="postgresql://username:password@localhost:5432/crowdads_staging?schema=public"
# Different JWT keys for staging
EXPIRY_DURATION=2h

# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/crowdads_prod?schema=public"
# Different JWT keys for production
EXPIRY_DURATION=1h
```

**Alternative**: Use file paths if you prefer file-based key management:
```bash
JWT_PRIVATE_KEY_PATH=./keys/jwt-private-development.pem
JWT_PUBLIC_KEY_PATH=./keys/jwt-public-development.pem
```

### 3. JWT Keys Generation
```bash
# Generate RS256 key pairs for ALL environments
npm run generate:jwt-keys

# Or generate for specific environment only
npm run generate:jwt-keys:dev      # Development only
npm run generate:jwt-keys:test     # Testing only
npm run generate:jwt-keys:staging  # Staging only
npm run generate:jwt-keys:prod     # Production only
```

**Important**: Each environment gets unique key pairs for better security.

### 4. Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations and seed roles for your environment
npm run migrate:dev      # Development
npm run migrate:testing  # Testing
npm run migrate:staging  # Staging
npm run migrate:prod     # Production

# Seed default roles (SuperAdmin, Admin, Executive)
node prisma/seed-roles.js
```

### 5. Bootstrap First User
```bash
# After starting the application, create the first SuperAdmin user
# The first user automatically gets SuperAdmin role
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@crowdads.com",
    "password": "SecurePassword123!"
  }'

# Or create with specific roles using role keys
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Manager User",
    "email": "manager@crowdads.com",
    "password": "ManagerPass123!",
    "roleKeys": ["Admin", "Executive"]
  }'
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
npm run build                # Build application
npm run test                 # Run tests
npm run test:watch           # Run tests in watch mode
npm run test:e2e             # Run e2e tests
npm run lint                 # Lint and fix code
npm run generate:jwt-keys    # Generate JWT keys for authentication
```

## 📁 Project Structure

```
src/
├── app.module.ts           # Main application module with environment config
├── auth/                   # Authentication module (login, JWT)
├── users/                  # User management module (RBAC)
├── beats/                  # Beat management module
├── brands/                 # Brand management module
├── influencers/            # Influencer management module
├── prisma/                 # Prisma database service
└── common/                 # Shared utilities, guards, decorators, and middleware

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

### Authentication 🔐
- `POST /auth/login` - Login (public)

### Users & RBAC 👥
- `POST /users` - Create user (public for bootstrap, then SuperAdmin only)
  - Use `roleKeys: ["SuperAdmin", "Admin", "Executive"]` instead of IDs
- `GET /users` - List all users (SuperAdmin only)
- `GET /users/:id` - Get user by ID (SuperAdmin only)
- `PATCH /users/:id` - Update user (SuperAdmin only)
- `DELETE /users/:id` - Delete user (SuperAdmin only)
- `POST /users/:id/roles` - Assign roles using role keys (SuperAdmin only)

**Available Role Keys**: `SuperAdmin`, `Admin`, `Executive`

### Beats 🎵
- `POST /beats` - Create beat (requires authentication)
- `GET /beats` - List all beats (requires authentication)
- `GET /beats/:id` - Get beat by ID (requires authentication)
- `PATCH /beats/:id` - Update beat (requires authentication)
- `DELETE /beats/:id` - Delete beat (requires authentication)

### Brands 🏢
- `POST /brands` - Create brand (requires authentication)
- `GET /brands` - List all brands (requires authentication)
- `GET /brands/:id` - Get brand by ID (requires authentication)
- `PATCH /brands/:id` - Update brand (requires authentication)
- `DELETE /brands/:id` - Delete brand (requires authentication)

### Influencers 🌟
- `POST /influencers` - Create influencer (requires authentication)
- `GET /influencers` - List all influencers (requires authentication)
- `GET /influencers/:id` - Get influencer by ID (requires authentication)
- `PATCH /influencers/:id` - Update influencer (requires authentication)
- `DELETE /influencers/:id` - Delete influencer (requires authentication)

## 🔒 Authentication & Authorization

### JWT Token Usage
Include the JWT token in the Authorization header:
```bash
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access Control (RBAC)
- **SuperAdmin**: Full access to all endpoints, can manage users and assign roles
- **Admin**: Access to all business endpoints (beats, brands, influencers)
- **Executive**: Limited access based on business requirements

### Example Login Flow
```bash
# 1. Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@crowdads.com",
    "password": "SecurePassword123!"
  }'

# Response:
# {
#   "id": "uuid",
#   "email": "admin@crowdads.com",
#   "name": "Super Admin",
#   "roles": ["SuperAdmin"],
#   "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "expiredAt": "2024-01-01T12:00:00.000Z"
# }

# 2. Use token for authenticated requests
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Create users with role keys (SuperAdmin only)
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "New Admin",
    "email": "new-admin@crowdads.com",
    "password": "AdminPass123!",
    "roleKeys": ["Admin"]
  }'

# 4. Assign roles to existing user
curl -X POST http://localhost:3001/api/users/user-uuid/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "roleKeys": ["SuperAdmin", "Admin"]
  }'
```

## 🎭 Role Management

### Available Roles
- **SuperAdmin**: Full system access, can manage users and assign roles
- **Admin**: Access to all business endpoints (beats, brands, influencers)  
- **Executive**: Limited access based on business requirements

### Role Key Usage
- Use role **keys** (strings) instead of numeric IDs
- More readable and maintainable
- Type-safe with validation
- Examples: `["SuperAdmin"]`, `["Admin", "Executive"]`

### Bootstrap Process
1. First user created automatically gets **SuperAdmin** role
2. Only **SuperAdmin** can create additional users
3. **SuperAdmin** can assign any combination of roles
4. Users inherit permissions from all assigned roles
```

## 📚 Additional Documentation

- [PRISMA_GUIDE.md](./PRISMA_GUIDE.md) - Comprehensive Prisma workflow and commands guide

**That's it! Simple environment switching with proper configuration management!** 🎯