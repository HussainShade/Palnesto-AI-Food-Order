// Configure Google AI (Gemini) - Using official @google/genai SDK
// Get API key from: https://aistudio.google.com/apikey
// Environment variable: GEMINI_API_KEY
export const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Only log if API key is missing (silent when working)
    return null;
  }
  // Dynamic import to avoid errors when package is not installed
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleGenAI } = require('@google/genai');
    // Explicitly pass the API key to ensure it's loaded
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error('Failed to initialize Google AI client:', error);
    return null;
  }
};

// Mock AI responses for development when API key is not available
export const mockAISuggestion = async (foodId: string) => {
  // Return a simple pairing suggestion
  const allFoods = await import('@/lib/prisma').then((m) => 
    m.prisma.foodItem.findMany({ where: { id: { not: foodId } }, take: 1 })
  );
  
  if (allFoods.length === 0) return null;
  
  return {
    foodId: allFoods[0].id,
    name: allFoods[0].name,
    reason: 'This pairs perfectly with your selection!',
    image: allFoods[0].image,
    price: allFoods[0].price,
  };
};

