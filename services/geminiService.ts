import { GoogleGenAI } from "@google/genai";

// Initialize lazily or check for key to prevent crash
const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'DUMMY_KEY_FOR_DEV';
  return new GoogleGenAI({ apiKey });
};

export const generateItemDescription = async (
  title: string,
  category: string,
  condition: string,
  keyFeatures: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Write a compelling, professional, and trustworthy rental listing description for an item with the following details:
      Title: ${title}
      Category: ${category}
      Condition: ${condition}
      Key Features: ${keyFeatures}

      The tone should be encouraging for potential renters but honest about condition. Keep it under 150 words.
    `;

    const response = await getAIClient().models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not generate description. Please try again.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error generating description. Please check your API key and connection.";
  }
};

export const getSmartSearchSuggestions = async (query: string): Promise<string[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
          Based on the search query "${query}", suggest 5 relevant search terms or categories for a peer-to-peer rental platform (renting tools, electronics, etc).
          Return ONLY a JSON array of strings. Example: ["Power Drills", "Home Improvement", "Cordless Tools"].
        `;

    const response = await getAIClient().models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

export const generateChatResponse = async (
  storeName: string,
  userMessage: string,
  history: { sender: string, text: string }[]
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
            You are an AI assistant managing customer service for a rental shop named "${storeName}" in Davao City on the HiramKo platform.
            Answer the user's message politely, professionally, and briefly (max 2 sentences).
            
            Context:
            - We rent out tools, gadgets, costumes, etc.
            - Delivery is available via riders.
            - Location: Davao City.
            
            User Message: "${userMessage}"
            
            Reply as ${storeName}:
        `;

    const response = await getAIClient().models.generateContent({
      model,
      contents: prompt
    });

    return response.text || "Thank you for your message. We will get back to you shortly.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "Thanks for your inquiry! We'll respond as soon as possible.";
  }
}