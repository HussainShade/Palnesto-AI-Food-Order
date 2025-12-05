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
│   ├── actions/          # Server actions
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
│   ├── prisma.ts        # Prisma client
│   ├── store/           # Zustand stores
│   ├── types.ts         # TypeScript types
│   └── auth.ts          # Auth utilities
├── prisma/
│   ├── schema.prisma    # Database schema
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

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database
Use Vercel Postgres, Supabase, or any PostgreSQL provider.

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

---

**Built with ❤️ using Next.js, Prisma, and AI**
