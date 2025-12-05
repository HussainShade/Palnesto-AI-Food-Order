# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_food_order?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
OPENAI_API_KEY="optional-for-ai-features"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

## Step 3: Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with food items
npm run db:seed
```

## Step 4: Run Development Server

```bash
npm run dev
```

## Step 5: Access the Application

- **Public Menu**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin
  - Email: `admin@example.com`
  - Password: `admin123`

## Troubleshooting

### Database Connection
- Ensure PostgreSQL is running
- Verify DATABASE_URL is correct
- Database must exist before running `db:push`

### NextAuth Issues
- Generate a secure secret: `openssl rand -base64 32`
- Ensure NEXTAUTH_URL matches your domain

### AI Features
- Works without OpenAI API key (uses fallback logic)
- Add OPENAI_API_KEY for full AI capabilities

