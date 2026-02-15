
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const optimizeProfileDescription = async (name: string, skill: string, experience: number, rawBio: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve this worker profile description for a local service app. 
      Name: ${name}
      Skill: ${skill}
      Experience: ${experience} years
      Draft: ${rawBio}
      
      Requirements: 
      - Keep it professional but simple.
      - Write in a mix of Hindi (transliterated) and English that common people in Bihar understand.
      - Focus on trust and skill.
      - Max 150 characters.`,
    });
    
    return response.text?.trim() || rawBio;
  } catch (error) {
    console.error("Gemini Error:", error);
    return rawBio;
  }
};

export const suggestMatchingSkill = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on the user search query: "${query}", which of these categories does it belong to? 
        Categories: Plumber, Electrician, Labour, Painter, Carpenter, Mason, Driver, Cleaner.
        Return only the category name.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    return "";
  }
};
