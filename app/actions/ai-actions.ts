'use server';

import { suggestPairing } from '@/lib/ai/ai-service';

export async function getPairingSuggestion(foodId: string) {
  try {
    return await suggestPairing(foodId);
  } catch (error) {
    console.error('Error getting pairing suggestion:', error);
    return null;
  }
}

