# AI-Driven Food Order Placement System

A production-grade, AI-powered food ordering application built with Next.js 16, TypeScript, Prisma, and OpenAI integration.

## 🚀 Features

### Public Features
- **Menu Screen** - Browse 10+ food items with images, descriptions, and prices
- **Smart Cart** - Persistent cart with floating modal and quantity management
- **AI Pairing Suggestions** - Get intelligent food pairing recommendations
- **Payment Flow** - Complete order placement with QR code payment simulation
- **Order Success** - Confirmation page with order tracking

### Admin Features
- **Protected Admin Dashboard** - JWT-based authentication
- **Inventory Management** - Real-time ingredient tracking with expiry dates
- **AI-Powered Alerts** - Intelligent alerts for:
  - Low stock warnings
  - Near-expiry notifications
  - Rapid depletion trends
  - Consumption anomalies
  - Predictive shortages
- **Order Management** - Paginated order history with detailed views

### AI Capabilities
- **Food Pairing Suggestions** - AI suggests complementary items when customers select food
- **Inventory Intelligence** - AI analyzes ingredient patterns and predicts issues
- **Post-Order Screening** - Automatic analysis after each order to detect threshold breaches

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (JWT-based)
- **State Management**: Zustand with persistence
- **AI Integration**: Google Generative AI SDK (Gemini)
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- (Optional) Google AI API key for full AI features (Free tier available)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_food_order?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Google AI (optional - for AI features)
# Get free API key from: https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key-here"

# Admin Credentials (for initial setup)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with food items and ingredients
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ai-food-order-app/
├── app/
│   ├── actions/          # Server actions (thin layer)
│   │   ├── ai-actions.ts
│   │   ├── food-actions.ts
│   │   ├── inventory-actions.ts
│   │   └── order-actions.ts
│   ├── admin/           # Admin routes
│   │   ├── page.tsx     # Login
│   │   ├── inventory/   # Inventory management
│   │   └── orders/      # Order management
│   ├── api/
│   │   └── auth/        # NextAuth API routes
│   ├── cart/            # Cart page
│   ├── order/           # Order success page
│   ├── payment/         # Payment page
│   └── page.tsx         # Menu (home)
├── components/
│   ├── admin/           # Admin components
│   ├── cart-button.tsx
│   ├── cart-modal.tsx
│   ├── food-card.tsx
│   └── providers.tsx
├── lib/
│   ├── ai/              # AI service layer
│   ├── services/        # Business logic services
│   │   ├── cache-service.ts    # Caching layer
│   │   ├── food-service.ts     # Food business logic
│   │   ├── inventory-service.ts # Inventory business logic
│   │   ├── order-service.ts     # Order business logic
│   │   └── logger.ts            # Structured logging
│   ├── prisma.ts        # Prisma client (enhanced)
│   ├── store/           # Zustand stores
│   ├── types.ts         # TypeScript types
│   └── auth.ts          # Auth utilities
├── prisma/
│   ├── schema.prisma    # Database schema (optimized)
│   └── seed.ts          # Seed script
└── types/
    └── next-auth.d.ts   # NextAuth type definitions
```

## 🗄️ Database Schema

- **FoodItem** - Menu items with prices and descriptions
- **Ingredient** - Inventory ingredients with quantities and thresholds
- **FoodIngredient** - Many-to-many relationship with quantity required
- **Order** - Customer orders
- **OrderItem** - Items in each order
- **AIAlert** - AI-generated alerts
- **AdminUser** - Admin authentication

## 🔐 Admin Access

After seeding, login with:
- **Email**: `admin@example.com` (or your `ADMIN_EMAIL`)
- **Password**: `admin123` (or your `ADMIN_PASSWORD`)

## 🎨 Features in Detail

### AI Food Pairing
When a customer adds an item to cart, the AI analyzes:
- Flavor complementarity
- Cultural pairing traditions
- Nutritional balance
- Popular combinations

### Inventory Intelligence
AI monitors:
- Stock levels vs thresholds
- Expiry dates
- Consumption patterns
- Anomaly detection

### Transactional Order Processing
Orders are processed in Prisma transactions ensuring:
- Atomic ingredient deductions
- Automatic alert generation
- Data consistency
- Idempotency safeguards
- Optimized batch operations

## ⚡ Performance Optimizations

This application has been optimized for production-scale performance, scalability, and reliability. The following optimizations have been implemented:

### Database Performance

#### Indexing Strategy
The Prisma schema includes strategic indexes for optimal query performance:

- **Ingredient Model**:
  - `quantity` - For threshold checks and inventory queries
  - `threshold` - For filtering low stock items
  - `expiryDate` - For expiry date queries
  - Composite `(quantity, threshold)` - For efficient low stock detection

- **Order Model**:
  - `createdAt` - For chronological ordering
  - `status` - For status filtering
  - Composite `(status, createdAt)` - For filtered pagination

- **AIAlert Model**:
  - `isRead` - For unread alert queries
  - `type` - For alert type filtering
  - `createdAt` - For chronological ordering
  - Composite `(isRead, createdAt)` - For common admin queries
  - `ingredientId` - For ingredient-specific alerts

- **FoodIngredient Model**:
  - `foodItemId` and `ingredientId` - Already indexed for join performance

#### Query Optimizations
- **Select over Include**: All queries use `select` instead of `include` to fetch only required fields
- **Batch Operations**: Multiple ingredient updates are batched using `Promise.all()` instead of sequential queries
- **N+1 Query Elimination**: 
  - Food items fetched in batch before transactions
  - Ingredients fetched in batch for alert creation
  - All related data loaded in single queries with proper joins

#### Pagination
- Offset-based pagination for compatibility (can be upgraded to cursor-based for very large datasets)
- Efficient count queries using `Promise.all()` for parallel execution

### Caching Strategy

A Redis-compatible caching layer has been implemented with the following strategy:

#### Cache Keys
- `cache:food:items` - All food items (10 min TTL)
- `cache:food:item:{id}` - Individual food items (10 min TTL)
- `cache:ingredients:all` - All ingredients (5 min TTL)
- `cache:ingredient:{id}` - Individual ingredients (5 min TTL)
- `cache:inventory:dashboard` - Dashboard aggregates (2 min TTL)
- `cache:alerts:{read|unread}` - AI alerts (1 min TTL)
- `cache:orders:{page}:{pageSize}` - Paginated orders (5 min TTL)

#### Cache Invalidation
- **On Order Creation**: Invalidates order caches and inventory dashboard
- **On Inventory Update**: Invalidates ingredient caches and dashboard
- **On Alert Update**: Invalidates alert caches
- **Pattern-based Invalidation**: Supports wildcard invalidation for related caches

#### Implementation
- **Development**: In-memory cache (no Redis required)
- **Production**: Redis implementation ready (uncomment in `cache-service.ts`)
- **Interface-based**: Easy to swap implementations without code changes

### Transaction Guarantees

#### Order Creation Flow
1. **Pre-transaction Validation**: Inventory availability checked BEFORE transaction
2. **Minimal Transaction Scope**: Only database writes inside transaction (AI calls excluded)
3. **Batch Updates**: All ingredient updates executed in parallel within transaction
4. **Isolation Level**: `ReadCommitted` for optimal performance
5. **Timeout Protection**: 10-second timeout prevents hanging transactions
6. **Idempotency**: Framework for idempotency keys (ready for production enhancement)

#### Error Handling
- Transaction rollback on any failure
- Detailed error logging with context
- Graceful degradation for non-critical operations (e.g., AI screening)

### Service Layer Architecture

The application follows a clean separation of concerns:

- **Actions Layer** (`app/actions/`): Thin server action wrappers
- **Service Layer** (`lib/services/`): Business logic and data access
  - `OrderService`: Order creation, retrieval, pagination
  - `InventoryService`: Inventory management, alerts, dashboard
  - `FoodService`: Food item retrieval with caching
  - `CacheService`: Caching abstraction
- **Database Layer**: Prisma ORM with optimized queries

#### Benefits
- Single Responsibility Principle
- Testable business logic
- Reusable service methods
- Consistent error handling
- Centralized caching

### Observability & Logging

#### Structured Logging
- JSON-formatted logs for easy parsing
- Log levels: `info`, `warn`, `error`, `debug`
- Contextual information in all logs

#### Performance Monitoring
- **Slow Query Detection**: Queries > 1 second are logged with details
- **Request Timing**: All service methods log execution time
- **Transaction Monitoring**: Transaction start, commit, and rollback events logged
- **Error Tracking**: Comprehensive error logging with stack traces and context

#### Log Categories
- Database queries (slow queries highlighted)
- Transaction events
- Request timing
- Cache hits/misses
- Error conditions

### Inventory Optimization

#### Precomputed Aggregates
- Dashboard statistics calculated once and cached
- Batch ingredient updates instead of individual queries
- Efficient expiry date filtering using indexed queries

#### Alert Processing
- Batch alert creation (no N+1 queries)
- Alert cache with short TTL for freshness
- Optimized queries using composite indexes

### Scalability Considerations

#### Database
- Indexes support high-volume queries
- Composite indexes for common query patterns
- Efficient pagination ready for large datasets
- Connection pooling via Prisma

#### Caching
- Reduces database load for read-heavy operations
- TTL-based expiration prevents stale data
- Pattern-based invalidation ensures consistency

#### Transactions
- Minimal transaction scope reduces lock contention
- Batch operations reduce round trips
- Timeout protection prevents resource exhaustion

#### Code Architecture
- Service layer enables horizontal scaling
- Stateless design supports multiple instances
- Cache layer can be shared across instances (Redis)

### Production Recommendations

1. **Enable Redis**: Uncomment Redis implementation in `cache-service.ts` and configure `REDIS_URL`
2. **Add Idempotency Keys**: Add `idempotencyKey` field to Order model for duplicate prevention
3. **Monitoring**: Integrate structured logs with monitoring service (Datadog, CloudWatch, etc.)
4. **Connection Pooling**: Configure Prisma connection pool size based on load
5. **Cursor Pagination**: Consider cursor-based pagination for orders table if > 100k records
6. **Read Replicas**: Use read replicas for read-heavy operations (inventory dashboard, food items)
7. **Background Jobs**: Move AI analysis to background jobs for better response times

## 🚀 Deployment

### Vercel (Recommended)

See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for complete deployment guide.

**Quick Steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (see below)
4. Set up PostgreSQL database
5. Run `prisma db push` to create schema
6. Run `prisma db seed` to seed data
7. Deploy!

### Required Environment Variables on Vercel

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GEMINI_API_KEY="your-api-key" (optional)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

### Database
Use **Vercel Postgres** (recommended), Supabase, Railway, or any PostgreSQL provider.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push Prisma schema
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma Client

## 🔧 Configuration

### Without OpenAI API Key
The app works without an OpenAI API key using fallback rule-based logic:
- Simple pairing suggestions
- Basic threshold-based alerts
- No advanced AI analysis

### With OpenAI API Key
Full AI capabilities:
- Intelligent pairing suggestions
- Advanced inventory analysis
- Pattern-based anomaly detection
- Predictive alerts

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database exists

### NextAuth Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

### AI Features Not Working
- Check `GOOGLE_GENERATIVE_AI_API_KEY` is set (optional)
- Get free API key from: https://aistudio.google.com/apikey
- App works with fallback logic if not set

## 📄 License

This project is built for demonstration purposes.

## 👨‍💻 Development

Built with production-grade practices:
- Type-safe server actions
- React Server Components
- Proper error boundaries
- Transactional database operations
- Modular architecture
- Clean code principles
- Performance-optimized database queries
- Caching layer for scalability
- Structured logging and observability
- Service layer architecture

---

**Built with ❤️ using Next.js, Prisma, and AI**
