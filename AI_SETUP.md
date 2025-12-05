# AI Model Setup Guide

## Recommendation: Google AI Studio (Gemini) - **FREE TIER AVAILABLE**

### Why Google AI Studio?

✅ **Generous Free Tier**
- 15 requests per minute (RPM)
- 1,500 requests per day (RPD)
- 1 million tokens per day
- Perfect for development and small-scale production

✅ **Easy Setup**
- Get API key instantly at: https://aistudio.google.com/apikey
- No credit card required
- Free forever (with rate limits)

✅ **High Quality Models**
- Gemini 1.5 Flash - Fast, efficient, and free
- Excellent for food pairing and inventory analysis
- Good JSON response formatting

### Comparison

| Provider | Free Tier | Setup Difficulty | Best For |
|----------|-----------|-----------------|----------|
| **Google AI (Gemini)** | ✅ 1.5M tokens/day | ⭐ Easy | **Recommended** |
| OpenAI | ❌ Limited ($5 credit) | ⭐⭐ Medium | Paid plans |
| Anthropic | ❌ No free tier | ⭐⭐ Medium | Paid only |
| Vercel AI SDK | N/A (Framework) | N/A | Works with all providers |

**Note:** Vercel AI SDK is a framework that works with multiple providers. It's not an AI model provider itself.

## Setup Instructions

### 1. Get Google AI API Key

1. Visit: https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Add to Environment Variables

Add to your `.env` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
```

### 3. Install Dependencies

The package is already configured. Just run:

```bash
npm install
```

### 4. Restart Development Server

```bash
npm run dev
```

## Current Configuration

The application is configured to use:
- **Model**: `gemini-2.5-flash` (latest, free tier compatible)
- **SDK**: Official Google GenAI SDK (@google/genai)
- **Environment Variable**: `GEMINI_API_KEY` (automatically picked up by SDK)

## Fallback Behavior

If no API key is provided:
- Food pairing suggestions use simple rule-based logic
- Inventory alerts use threshold-based rules
- All features work, just without advanced AI analysis

## Cost Comparison

### Google AI (Gemini 1.5 Flash)
- **Free**: 1.5M tokens/day
- **Paid**: $0.075 per 1M input tokens, $0.30 per 1M output tokens

### OpenAI (GPT-4o-mini)
- **Free**: $5 credit (expires after 3 months)
- **Paid**: $0.15 per 1M input tokens, $0.60 per 1M output tokens

**Verdict**: Google AI is significantly cheaper and has a better free tier.

## Switching Providers

If you want to use a different provider, update `lib/ai/config.ts`:

### For OpenAI:
```typescript
const { openai } = require('@ai-sdk/openai');
return openai;
// Use: openai('gpt-4o-mini')
```

### For Anthropic:
```typescript
const { anthropic } = require('@ai-sdk/anthropic');
return anthropic;
// Use: anthropic('claude-3-5-sonnet-20241022')
```

The Vercel AI SDK makes it easy to switch between providers!

