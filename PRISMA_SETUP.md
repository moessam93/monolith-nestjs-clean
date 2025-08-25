# Prisma Setup Documentation

This document describes the Prisma ORM setup for the CrowdAds NestJS monolith application.

## Database Schema and Relationships

The application has three main entities with the following relationships:

### Entity Relationships
- **Beat** has one **Influencer** (many-to-one)
- **Beat** has one **Brand** (many-to-one)
- **Influencer** has many **Beats** (one-to-many)
- **Brand** has many **Beats** (one-to-many)

### Database Tables
- `influencers` - Contains influencer information
- `brands` - Contains brand information
- `beats` - Contains beat information with foreign keys to influencers and brands

## Setup Instructions

### 1. Environment Configuration
Create a `.env` file in the root directory with your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/crowdads?schema=public"
```

### 2. Database Migration
Run the following commands to set up your database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (for development)
npm run db:push

# OR create and run migrations (for production)
npm run prisma:migrate
```

### 3. Available Scripts
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and run migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:reset` - Reset database and run migrations
- `npm run db:push` - Push schema to database without migrations

## API Endpoints

### Beats
- `POST /beats` - Create a new beat (requires influencerId and brandId)
- `GET /beats` - Get all beats with relationships
- `GET /beats/:id` - Get beat by ID with relationships
- `PATCH /beats/:id` - Update beat
- `DELETE /beats/:id` - Delete beat

### Brands
- `POST /brands` - Create a new brand
- `GET /brands` - Get all brands with their beats
- `GET /brands/:id` - Get brand by ID with beats and influencers
- `PATCH /brands/:id` - Update brand
- `DELETE /brands/:id` - Delete brand

### Influencers
- `POST /influencers` - Create a new influencer
- `GET /influencers` - Get all influencers with their beats
- `GET /influencers/:id` - Get influencer by ID with beats and brands
- `PATCH /influencers/:id` - Update influencer
- `DELETE /influencers/:id` - Delete influencer

## Sample Data Creation

### 1. Create an Influencer
```bash
POST /influencers
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### 2. Create a Brand
```bash
POST /brands
{
  "name": "TechCorp",
  "email": "contact@techcorp.com"
}
```

### 3. Create a Beat
```bash
POST /beats
{
  "name": "Summer Campaign",
  "description": "Summer marketing campaign",
  "influencerId": 1,
  "brandId": 1
}
```

## Architecture Notes

- **PrismaService**: Global service that extends PrismaClient and handles database connections
- **Entities**: TypeScript classes that mirror the Prisma schema models
- **DTOs**: Data Transfer Objects with validation decorators
- **Services**: Business logic layer that uses PrismaService for database operations
- **Controllers**: HTTP request handlers that delegate to services

## Validation

All DTOs include proper validation using class-validator decorators:
- String validation for names
- Email validation for email fields
- Integer validation for foreign keys
- Optional validation for optional fields
