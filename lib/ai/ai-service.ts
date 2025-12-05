import { prisma } from '@/lib/prisma';
import type { AISuggestion } from '@/lib/types';
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

export async function suggestPairing(foodId: string): Promise<AISuggestion | null> {
  try {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodId },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!foodItem) return null;

    const allFoods = await prisma.foodItem.findMany({
      where: { id: { not: foodId } },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      take: 10,
    });

    const prompt = `You are a food pairing expert. A customer just selected "${foodItem.name}" (${foodItem.description}). 

Available food items:
${allFoods.map((f) => `- ${f.name}: ${f.description}`).join('\n')}

Suggest ONE food item that pairs exceptionally well with "${foodItem.name}". Consider:
- Flavor complementarity
- Cultural pairing traditions
- Nutritional balance
- Popular combinations

Respond in JSON format:
{
  "foodName": "exact name from available items",
  "reason": "brief explanation why it pairs well (max 50 words)"
}`;

    const aiModel = await getAIModel();
    if (!aiModel) {
      // Fallback: return first available food
      const allFoods = await prisma.foodItem.findMany({
        where: { id: { not: foodId } },
        take: 1,
      });
      if (allFoods.length === 0) return null;
      return {
        foodId: allFoods[0].id,
        name: allFoods[0].name,
        reason: 'This pairs perfectly with your selection!',
        image: allFoods[0].image,
        price: allFoods[0].price,
      };
    }

    // Use the official @google/genai SDK format
    const response = await aiModel.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text;

    // Try to extract JSON from response (AI might wrap it in markdown)
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      // Try to extract JSON object from text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response');
      }
    }

    const suggestedFood = allFoods.find((f) => 
      f.name.toLowerCase() === parsed.foodName?.toLowerCase() ||
      f.name.toLowerCase().includes(parsed.foodName?.toLowerCase() || '')
    );

    if (!suggestedFood) {
      // Fallback: return first available food
      if (allFoods.length > 0) {
        return {
          foodId: allFoods[0].id,
          name: allFoods[0].name,
          reason: parsed.reason || 'This pairs well with your selection!',
          image: allFoods[0].image,
          price: allFoods[0].price,
        };
      }
      return null;
    }

    return {
      foodId: suggestedFood.id,
      name: suggestedFood.name,
      reason: parsed.reason || 'This pairs perfectly with your selection!',
      image: suggestedFood.image,
      price: suggestedFood.price,
    };
  } catch (error) {
    console.error('AI pairing suggestion error:', error);
    // Fallback to first available food
    try {
      const allFoods = await prisma.foodItem.findMany({
        where: { id: { not: foodId } },
        take: 1,
      });
      if (allFoods.length > 0) {
        return {
          foodId: allFoods[0].id,
          name: allFoods[0].name,
          reason: 'This pairs perfectly with your selection!',
          image: allFoods[0].image,
          price: allFoods[0].price,
        };
      }
    } catch {
      // Ignore fallback errors
    }
    return null;
  }
}

export async function analyzeInventoryIntelligence() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        foodItems: {
          include: {
            foodItem: true,
          },
        },
      },
    });

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
        status: 'COMPLETED',
      },
      include: {
        items: {
          include: {
            foodItem: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const prompt = `Analyze this restaurant inventory data and identify critical issues:

Ingredients:
${ingredients.map((ing) => 
  `- ${ing.name}: ${ing.quantity}${ing.unit} (threshold: ${ing.threshold}${ing.unit}, expiry: ${ing.expiryDate ? new Date(ing.expiryDate).toLocaleDateString() : 'N/A'})`
).join('\n')}

Recent orders (last 7 days): ${orders.length} orders

Identify and return JSON array of alerts:
[
  {
    "type": "LOW_STOCK" | "NEAR_EXPIRY" | "RAPID_DEPLETION" | "CONSUMPTION_ANOMALY" | "PREDICTIVE_SHORTAGE",
    "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "title": "Alert title",
    "message": "Detailed message",
    "ingredientName": "ingredient name if applicable"
  }
]`;

    const aiModel = await getAIModel();
    if (!aiModel) {
      // Fallback: basic rule-based alerts
      const alerts = [];
      for (const ing of ingredients) {
        if (ing.quantity < ing.threshold) {
          alerts.push({
            type: 'LOW_STOCK',
            severity: ing.quantity <= 0 ? 'CRITICAL' : 'HIGH',
            title: `Low Stock: ${ing.name}`,
            message: `${ing.name} is below threshold`,
            ingredientName: ing.name,
          });
        }
        if (ing.expiryDate) {
          const daysUntilExpiry = Math.ceil(
            (new Date(ing.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          if (daysUntilExpiry <= 3 && daysUntilExpiry >= 0) {
            alerts.push({
              type: 'NEAR_EXPIRY',
              severity: daysUntilExpiry <= 1 ? 'HIGH' : 'MEDIUM',
              title: `Near Expiry: ${ing.name}`,
              message: `${ing.name} expires in ${daysUntilExpiry} days`,
              ingredientName: ing.name,
            });
          }
        }
      }
      return alerts;
    }

    // Use the official @google/genai SDK format
    const response = await aiModel.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text;
    const alerts = JSON.parse(text);
    return alerts;
  } catch (error) {
    console.error('AI inventory analysis error:', error);
    return [];
  }
}

export async function postOrderScreening(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            foodItem: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) return;

    const prompt = `After this order was placed, analyze ingredient impact:

Order items:
${order.items.map((item) => 
  `${item.quantity}x ${item.foodItem.name}`
).join('\n')}

Ingredient usage per item:
${order.items.flatMap((item) =>
  item.foodItem.ingredients.map((fi) =>
    `- ${item.foodItem.name} uses ${fi.qtyRequired}${fi.ingredient.unit} of ${fi.ingredient.name} (current stock: ${fi.ingredient.quantity}${fi.ingredient.unit}, threshold: ${fi.ingredient.threshold}${fi.ingredient.unit})`
  )
).join('\n')}

Generate alerts if any thresholds are breached or anomalies detected. Return JSON array:
[
  {
    "type": "LOW_STOCK" | "NEAR_EXPIRY" | "RAPID_DEPLETION" | "CONSUMPTION_ANOMALY",
    "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "title": "Alert title",
    "message": "Detailed message",
    "ingredientName": "ingredient name"
  }
]`;

    const aiModel = await getAIModel();
    let alerts = [];
    
    if (!aiModel) {
      // Fallback: rule-based alerts
      const allIngredients = await prisma.ingredient.findMany();
      for (const ing of allIngredients) {
        if (ing.quantity < ing.threshold) {
          alerts.push({
            type: 'LOW_STOCK',
            severity: ing.quantity <= 0 ? 'CRITICAL' : 'HIGH',
            title: `Low Stock: ${ing.name}`,
            message: `${ing.name} is below threshold after this order`,
            ingredientName: ing.name,
          });
        }
      }
    } else {
      // Use the official @google/genai SDK format
      const response = await aiModel.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });
      const text = response.text;
      alerts = JSON.parse(text);
    }
    
    // Create alerts in database
    for (const alert of alerts) {
      const ingredient = alert.ingredientName
        ? await prisma.ingredient.findUnique({ where: { name: alert.ingredientName } })
        : null;

      await prisma.aIAlert.create({
        data: {
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          ingredientId: ingredient?.id,
        },
      });
    }
  } catch (error) {
    console.error('AI post-order screening error:', error);
  }
}

