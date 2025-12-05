# Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database** - Use Vercel Postgres, Supabase, or any PostgreSQL provider

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 3. Configure Build Settings

Vercel will automatically detect:
- **Framework Preset**: Next.js
- **Build Command**: `prisma generate && next build` (already configured)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 4. Set Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

#### Required Variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google AI (Optional - for AI features)
GEMINI_API_KEY="your-google-ai-api-key"

# Admin Credentials (for initial setup)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

#### Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### 5. Database Setup

#### Option A: Vercel Postgres (Recommended)

1. In Vercel dashboard, go to **Storage** tab
2. Click **"Create Database"** → **"Postgres"**
3. Copy the `DATABASE_URL` connection string
4. Add it to Environment Variables

#### Option B: External PostgreSQL (Supabase, Railway, etc.)

1. Create a PostgreSQL database on your provider
2. Copy the connection string
3. Add `DATABASE_URL` to Vercel Environment Variables

### 6. Run Database Migrations

After deployment, you need to set up the database schema:

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Push Prisma schema
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

#### Option B: Using Vercel Postgres Dashboard

1. Go to Vercel dashboard → **Storage** → Your Postgres database
2. Use the **SQL Editor** to run migrations manually
3. Or use Prisma Studio: `npx prisma studio`

#### Option C: Add Post-Deploy Script

Add to `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma db push && next build"
  }
}
```

### 7. Deploy

1. Click **"Deploy"** in Vercel dashboard
2. Wait for build to complete
3. Your app will be live at `https://your-app.vercel.app`

## Post-Deployment Checklist

- [ ] Database schema is pushed (`prisma db push`)
- [ ] Database is seeded with initial data (`prisma db seed`)
- [ ] Environment variables are set correctly
- [ ] Admin login works at `/admin`
- [ ] AI features work (if `GEMINI_API_KEY` is set)
- [ ] Images load correctly (check `next.config.ts` for remote patterns)

## Troubleshooting

### Build Fails with Prisma Error

**Solution**: Ensure `prisma` is in `dependencies` (not `devDependencies`) in `package.json`

### Database Connection Error

**Solution**: 
- Check `DATABASE_URL` is correct
- Ensure database allows connections from Vercel IPs
- For Vercel Postgres, connection string is auto-provided

### Environment Variables Not Working

**Solution**:
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- Ensure no extra spaces or quotes

### Images Not Loading

**Solution**: 
- Check `next.config.ts` has correct `remotePatterns`
- Ensure image URLs are accessible
- Use Vercel's Image Optimization

## Vercel-Specific Features

### Automatic Deployments
- Every push to `main` branch = Production deployment
- Every push to other branches = Preview deployment

### Environment Variables by Environment
- **Production**: `https://your-app.vercel.app`
- **Preview**: `https://your-app-git-branch.vercel.app`
- **Development**: Local `.env` file

### Custom Domain
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update `NEXTAUTH_URL` to match your domain

## Database Seeding on Vercel

To seed the database after deployment:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma db seed
```

Or add a one-time script in Vercel dashboard → **Settings** → **Build & Development Settings**

## Monitoring

- **Logs**: Vercel dashboard → **Deployments** → Click deployment → **Functions** tab
- **Analytics**: Enable in Vercel dashboard → **Analytics**
- **Errors**: Check **Functions** tab for runtime errors

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

