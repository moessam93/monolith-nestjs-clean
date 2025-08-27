# CrowdAds Monolith - Clean Architecture

A NestJS application implementing Clean Architecture principles with complete CRUD operations for all business entities.

## 🏗️ Architecture

This project follows **Clean Architecture** with strict dependency boundaries:

- **Domain Layer**: Pure business logic and entities
- **Application Layer**: Use cases and application rules  
- **Infrastructure Layer**: External concerns (database, JWT, etc.)
- **Interface Layer**: HTTP controllers and presentation

## 🚀 Features

### Core Modules
- **Authentication**: JWT-based auth with role-based access control
- **Users**: Complete user management with role assignment
- **Beats**: Content management with influencer/brand associations
- **Brands**: Brand management with full CRUD operations
- **Influencers**: Influencer management with social platform integration

### Technical Features
- **ORM Agnostic**: Easy to swap Prisma for TypeORM/MikroORM
- **Testable**: Business logic isolated from external dependencies
- **Type Safe**: Full TypeScript implementation
- **Result Pattern**: Explicit error handling without exceptions
- **Domain Driven**: Rich domain entities with behavior

## 📚 API Documentation

### Authentication
- `POST /auth/login` - User authentication

### Users  
- `POST /users` - Create user or bootstrap first SuperAdmin
- `GET /users` - List users with pagination and search
- `PATCH /users/:id` - Update user information
- `POST /users/:id/roles` - Assign roles to user

### Beats
- `POST /beats` - Create new beat
- `GET /beats` - List beats with filtering
- `GET /beats/:id` - Get single beat
- `PATCH /beats/:id` - Update beat
- `DELETE /beats/:id` - Delete beat

### Brands
- `POST /brands` - Create new brand
- `GET /brands` - List brands with search
- `GET /brands/:id` - Get single brand  
- `PATCH /brands/:id` - Update brand
- `DELETE /brands/:id` - Delete brand

### Influencers
- `POST /influencers` - Create new influencer
- `GET /influencers` - List influencers with search
- `GET /influencers/:id` - Get single influencer
- `PATCH /influencers/:id` - Update influencer
- `DELETE /influencers/:id` - Delete influencer
- `POST /influencers/:id/social-platforms` - Add/update social platform
- `DELETE /influencers/:id/social-platforms/:key` - Remove social platform

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- JWT RS256 keys (for production)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create environment files following the pattern:
   ```bash
   cp .env.example .env.development
   cp .env.example .env.testing
   cp .env.example .env.production
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   npx prisma migrate dev
   
   # Seed roles (optional)
   npm run seed:roles
   ```

4. **Generate JWT Keys** (for production)
   ```bash
   npm run generate:jwt-keys
   ```

### Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/crowdads"

# JWT Configuration
JWT_ALG=RS256
EXPIRY_DURATION=1h
JWT_PRIVATE_KEY_BASE64=<base64-encoded-private-key>
JWT_PUBLIC_KEY_BASE64=<base64-encoded-public-key>

# Bcrypt Configuration  
BCRYPT_SALT_ROUNDS=12
```

## 🚀 Running the Application

### Development
```bash
# Start in development mode
npm run start:dev

# Run with specific environment
NODE_ENV=development npm run start:dev
```

### Production
```bash
# Build the application
npm run build

# Start production server
NODE_ENV=production npm start
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test login.usecase.spec.ts

# Test coverage
npm run test:cov
```

## 📋 Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run start:dev` - Start development server
- `npm test` - Run test suite
- `npm run test:cov` - Run tests with coverage
- `npm run generate:jwt-keys` - Generate JWT key pair
- `npm run seed:roles` - Seed default roles
- `npm run validate:setup` - Validate environment setup

## 🏛️ Project Structure

```
src/
├── domain/                 # Pure business logic
│   ├── entities/          # Domain entities (User, Beat, Brand, etc.)
│   ├── value-objects/     # Value objects (Email, PhoneNumber)
│   ├── repositories/      # Repository interfaces
│   ├── uow/              # Unit of Work pattern
│   └── errors/           # Domain-specific errors
├── application/           # Application business rules
│   ├── use-cases/        # Business use cases
│   ├── dto/              # Data transfer objects
│   ├── ports/            # Secondary port interfaces
│   └── common/           # Shared application utilities
├── infrastructure/       # External adapters
│   ├── orm/              # Database implementations
│   ├── crypto/           # Cryptography implementations
│   ├── tokens/           # JWT implementations
│   └── common/           # Infrastructure utilities
└── interface/            # Interface adapters
    ├── http/             # HTTP controllers and guards
    └── app.module.ts     # Application composition root
```

## 🧪 Testing Strategy

The application uses a comprehensive testing approach:

- **Unit Tests**: Use cases tested with mocked repositories
- **Integration Tests**: Full HTTP request cycle tests
- **Domain Tests**: Entity behavior and business rule validation
- **Contract Tests**: Repository interface compliance

Example test:
```typescript
// Unit test for LoginUseCase
const result = await loginUseCase.execute({
  email: 'user@example.com',
  password: 'password123'
});

expect(isOk(result)).toBe(true);
```

## 🔧 Architecture Benefits

### ✅ **Testability**
Business logic can be tested without databases or external services.

### ✅ **Maintainability** 
Clear separation of concerns with explicit dependencies.

### ✅ **Flexibility**
Easy to swap infrastructure components (database, authentication, etc.).

### ✅ **Scalability**
Well-defined boundaries support team development and feature growth.

### ✅ **Domain Focus**
Business rules are explicit and protected from external changes.

## 📖 Additional Documentation

- [Clean Architecture Migration Guide](COMPLETE_MIGRATION_SUMMARY.md)
- [Prisma Database Guide](PRISMA_GUIDE.md)
- [Simple Setup Guide](SIMPLE_SETUP.md)

## 🤝 Contributing

1. Follow the Clean Architecture principles
2. Write tests for new use cases
3. Maintain strict layer boundaries
4. Use the Result pattern for error handling
5. Keep domain entities free of framework dependencies

## 📄 License

This project is licensed under the MIT License.