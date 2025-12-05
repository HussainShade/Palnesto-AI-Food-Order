'use server';

import { prisma } from '@/lib/prisma';
import { analyzeInventoryIntelligence } from '@/lib/ai/ai-service';
import { requireAdmin } from '@/lib/auth';

export async function getIngredients() {
  await requireAdmin();

  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return ingredients;
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    throw new Error('Failed to fetch ingredients');
  }
}

export async function getAIAlerts() {
  await requireAdmin();

  try {
    const alerts = await prisma.aIAlert.findMany({
      where: {
        isRead: false,
      },
      include: {
        ingredient: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return alerts;
  } catch (error) {
    console.error('Error fetching AI alerts:', error);
    throw new Error('Failed to fetch alerts');
  }
}

export async function markAlertAsRead(alertId: string) {
  await requireAdmin();

  try {
    await prisma.aIAlert.update({
      where: { id: alertId },
      data: { isRead: true },
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw new Error('Failed to update alert');
  }
}

export async function triggerInventoryAnalysis() {
  await requireAdmin();

  try {
    const alerts = await analyzeInventoryIntelligence();

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

    return { success: true, alertsCreated: alerts.length };
  } catch (error) {
    console.error('Error in inventory analysis:', error);
    throw new Error('Failed to analyze inventory');
  }
}

