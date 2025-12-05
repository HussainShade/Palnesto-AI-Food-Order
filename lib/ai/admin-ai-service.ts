import { getAIClient } from './config';

const getAIModel = async () => {
  const client = getAIClient();
  if (!client) {
    return null;
  }
  // Client is ready to use - no need to get model separately
  // We'll use client.models.generateContent() directly
  return { client };
};

export async function analyzeFoodInsights(foodItems: unknown[]) {
  try {
    const aiModel = await getAIModel();
    if (!aiModel) {
      return {
        insight: 'Food menu is well-balanced. Consider seasonal promotions for popular items.',
        type: 'info',
      };
    }

    const prompt = `You are a restaurant owner analyzing your menu. Give ONE business tip for the owner, NOT for customers.

Menu:
${JSON.stringify(foodItems, null, 2).slice(0, 2000)}

Give a business tip like:
- Which item to promote to increase sales
- Price to increase/decrease for better profit (say item name and new price)
- Item that's not profitable and needs fixing
- Quick way to reduce costs or increase revenue

IMPORTANT: Write for the restaurant owner, NOT for customers. Don't say "grab this" or "enjoy that". Say "promote this" or "increase price of that".

Keep it short and simple. No fancy words.

Return JSON only:
{
  "insight": "Business tip for owner in plain English (max 60 words)",
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
    console.error('AI food analysis error:', error);
    return {
      insight: 'Menu analysis: All items are properly configured.',
      type: 'info',
    };
  }
}

export async function analyzeInventoryInsights(ingredients: unknown[]) {
  try {
    const aiModel = await getAIModel();
    if (!aiModel) {
      return {
        insight: 'Monitor ingredient levels regularly to avoid stockouts.',
        type: 'info',
      };
    }

    const prompt = `You are a restaurant owner checking inventory. Give ONE business action, NOT customer advice.

Inventory:
${JSON.stringify(ingredients, null, 2).slice(0, 2000)}

Give a business action like:
- What ingredient to order now (say the name and amount)
- What expires soon and needs to be used (say the name and date)
- What's running low and needs restocking (say the name and current amount)
- Quick way to reduce waste or save costs

IMPORTANT: Write for the restaurant owner managing inventory, NOT for customers. Focus on operations and costs.

Keep it short and simple. No fancy words.

Return JSON only:
{
  "insight": "Business action for owner in plain English (max 60 words)",
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
    console.error('AI inventory analysis error:', error);
    return {
      insight: 'Keep monitoring inventory levels for optimal stock management.',
      type: 'info',
    };
  }
}

export async function analyzeOrderInsights(orders: unknown[]) {
  try {
    const aiModel = await getAIModel();
    if (!aiModel) {
      return {
        insight: 'Track order patterns to optimize menu and inventory.',
        type: 'info',
      };
    }

    const prompt = `You are a restaurant owner analyzing sales. Give ONE business tip, NOT customer recommendations.

Orders:
${JSON.stringify(orders, null, 2).slice(0, 2000)}

Give a business tip like:
- Which item is top seller and should be promoted (say the item name)
- Best time to focus marketing efforts (say the time/day)
- Which item to push today to increase revenue (say the name)
- Quick way to increase average order value or profit

IMPORTANT: Write for the restaurant owner managing sales, NOT for customers. Don't say "grab this" or "try that". Say "promote this" or "focus on that".

Keep it short and simple. No fancy words.

Return JSON only:
{
  "insight": "Business tip for owner in plain English (max 60 words)",
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
    console.error('AI order analysis error:', error);
    return {
      insight: 'Continue monitoring order trends for business growth.',
      type: 'info',
    };
  }
}

