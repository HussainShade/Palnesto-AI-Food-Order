import { getAIClient } from './config';
import { logger } from '@/lib/services/logger';

const getAIModel = async () => {
  const client = getAIClient();
  if (!client) {
    return null;
  }
  // Client is ready to use - no need to get model separately
  // We'll use client.models.generateContent() directly
  return { client };
};

/**
 * Check if error is a quota/rate limit error (429)
 */
const isQuotaError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  
  // Check for ApiError with status 429
  if ('status' in error && error.status === 429) return true;
  
  // Check for error object with code 429
  if ('error' in error && typeof error.error === 'object' && error.error !== null) {
    if ('code' in error.error && error.error.code === 429) return true;
    if ('status' in error.error && error.error.status === 'RESOURCE_EXHAUSTED') return true;
  }
  
  return false;
};

export async function analyzeFoodInsights(foodItems: unknown[]) {
  try {
    const aiModel = await getAIModel();
    if (!aiModel) {
      return {
        insight: '• Menu is well-balanced\n• Consider seasonal promotions\n• Monitor popular items',
        type: 'info',
      };
    }

    const prompt = `You are a restaurant owner analyzing your menu. Give 2-4 quick bullet points for the owner, NOT for customers.

Menu:
${JSON.stringify(foodItems, null, 2).slice(0, 2000)}

Give bullet points like:
- Promote [item name] to boost sales
- Increase [item] price to ₹[amount] for better profit
- Fix [item] - not profitable
- Reduce costs by [action]

IMPORTANT: Write for the restaurant owner, NOT for customers. Use bullet points. Each point: 5-10 words max. No sentences or paragraphs.

Return JSON only:
{
  "insight": "• Point 1 (5-10 words)\\n• Point 2 (5-10 words)\\n• Point 3 (5-10 words)",
  "type": "success" | "warning" | "info" | "error"
}`;

    // Use the official @google/genai SDK format
    const response = await aiModel.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text;

    // Extract JSON from response (AI might wrap it in markdown)
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    try {
      const parsed = JSON.parse(jsonText);
      return {
        insight: parsed.insight || 'Menu analysis complete.',
        type: parsed.type || 'info',
      };
    } catch {
      // Try to extract JSON object from text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            insight: parsed.insight || text.slice(0, 200),
            type: parsed.type || 'info',
          };
        } catch {
          // Fall through to return raw text
        }
      }
      return {
        insight: text.slice(0, 200),
        type: 'info',
      };
    }
  } catch (error) {
    // Handle quota errors gracefully - use fallback instead
    if (isQuotaError(error)) {
      logger.debug('AI quota exceeded, using fallback for food insights');
      return {
        insight: '• All items configured\n• Menu is balanced\n• No action needed',
        type: 'info',
      };
    }
    
    // Log other errors but still return fallback
    logger.error('AI food analysis error', {
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      insight: '• All items configured\n• Menu is balanced\n• No action needed',
      type: 'info',
    };
  }
}

export async function analyzeInventoryInsights(ingredients: unknown[]) {
  try {
    const aiModel = await getAIModel();
    if (!aiModel) {
      return {
        insight: '• Monitor ingredient levels\n• Avoid stockouts\n• Check expiry dates',
        type: 'info',
      };
    }

    const prompt = `You are a restaurant owner checking inventory. Give 2-4 quick bullet points, NOT customer advice.

Inventory:
${JSON.stringify(ingredients, null, 2).slice(0, 2000)}

Give bullet points like:
- Order [ingredient] - [amount] needed now
- [Ingredient] expires [date] - use immediately
- [Ingredient] low stock - [current] remaining
- Reduce waste by [action]

IMPORTANT: Write for the restaurant owner managing inventory, NOT for customers. Use bullet points. Each point: 5-10 words max. No sentences or paragraphs.

Return JSON only:
{
  "insight": "• Point 1 (5-10 words)\\n• Point 2 (5-10 words)\\n• Point 3 (5-10 words)",
  "type": "success" | "warning" | "info" | "error"
}`;

    // Use the official @google/genai SDK format
    const response = await aiModel.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text;

    // Extract JSON from response (AI might wrap it in markdown)
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    try {
      const parsed = JSON.parse(jsonText);
      return {
        insight: parsed.insight || 'Inventory is well managed.',
        type: parsed.type || 'info',
      };
    } catch {
      // Try to extract JSON object from text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            insight: parsed.insight || text.slice(0, 200),
            type: parsed.type || 'warning',
          };
        } catch {
          // Fall through to return raw text
        }
      }
      return {
        insight: text.slice(0, 200),
        type: 'warning',
      };
    }
  } catch (error) {
    // Handle quota errors gracefully - use fallback instead
    if (isQuotaError(error)) {
      logger.debug('AI quota exceeded, using fallback for inventory insights');
      return {
        insight: '• Monitor inventory levels\n• Maintain optimal stock\n• Check regularly',
        type: 'info',
      };
    }
    
    // Log other errors but still return fallback
    logger.error('AI inventory analysis error', {
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      insight: '• Monitor inventory levels\n• Maintain optimal stock\n• Check regularly',
      type: 'info',
    };
  }
}

export async function analyzeOrderInsights(orders: unknown[]) {
  try {
    const aiModel = await getAIModel();
    if (!aiModel) {
      return {
        insight: '• Track order patterns\n• Optimize menu items\n• Monitor inventory needs',
        type: 'info',
      };
    }

    const prompt = `You are a restaurant owner analyzing sales. Give 2-4 quick bullet points, NOT customer recommendations.

Orders:
${JSON.stringify(orders, null, 2).slice(0, 2000)}

Give bullet points like:
- Promote [item name] - top seller
- Focus marketing on [time/day] for best results
- Push [item] today to boost revenue
- Increase order value by [action]

IMPORTANT: Write for the restaurant owner managing sales, NOT for customers. Use bullet points. Each point: 5-10 words max. No sentences or paragraphs.

Return JSON only:
{
  "insight": "• Point 1 (5-10 words)\\n• Point 2 (5-10 words)\\n• Point 3 (5-10 words)",
  "type": "success" | "warning" | "info" | "error"
}`;

    // Use the official @google/genai SDK format
    const response = await aiModel.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text;

    // Extract JSON from response (AI might wrap it in markdown)
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    try {
      const parsed = JSON.parse(jsonText);
      return {
        insight: parsed.insight || 'Orders are being processed efficiently.',
        type: parsed.type || 'info',
      };
    } catch {
      // Try to extract JSON object from text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            insight: parsed.insight || text.slice(0, 200),
            type: parsed.type || 'info',
          };
        } catch {
          // Fall through to return raw text
        }
      }
      return {
        insight: text.slice(0, 200),
        type: 'info',
      };
    }
  } catch (error) {
    // Handle quota errors gracefully - use fallback instead
    if (isQuotaError(error)) {
      logger.debug('AI quota exceeded, using fallback for order insights');
      return {
        insight: '• Monitor order trends\n• Focus on growth\n• Track patterns',
        type: 'info',
      };
    }
    
    // Log other errors but still return fallback
    logger.error('AI order analysis error', {
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      insight: '• Monitor order trends\n• Focus on growth\n• Track patterns',
      type: 'info',
    };
  }
}

