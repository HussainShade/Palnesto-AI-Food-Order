'use server';

import { suggestPairing, getCartUpsellSuggestions, getMenuRecommendations, getNextOrderSuggestions } from '@/lib/ai/ai-service';

export async function getPairingSuggestion(foodId: string) {
  try {
    return await suggestPairing(foodId);
  } catch (error) {
    console.error('Error getting pairing suggestion:', error);
    return null;
  }
}

export async function getCartUpsells(cartItemIds: string[]) {
  try {
    return await getCartUpsellSuggestions(cartItemIds);
  } catch (error) {
    console.error('Error getting cart upsells:', error);
    return [];
  }
}

export async function getMenuRecs() {
  try {
    return await getMenuRecommendations();
  } catch (error) {
    console.error('Error getting menu recommendations:', error);
    return [];
  }
}

export async function getNextOrderRecs(orderId: string) {
  try {
    return await getNextOrderSuggestions(orderId);
  } catch (error) {
    console.error('Error getting next order suggestions:', error);
    return [];
  }
}

