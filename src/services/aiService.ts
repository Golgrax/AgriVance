import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not defined in .env.local");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const getPlantingSuggestion = async (city: string, temperature: number, condition: string): Promise<string> => {
  const prompt = `You are an expert agricultural advisor. Based on the weather in ${city} (Temp: ${temperature}°C, Condition: ${condition}), provide a Markdown list of 3-5 suitable crops to plant, with a brief reason for each. If the weather is extreme, advise against planting.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error fetching planting suggestion:", error);
    return "Sorry, I was unable to generate planting suggestions.";
  }
};