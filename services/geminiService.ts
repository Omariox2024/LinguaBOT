
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Language, GeminiResponse } from '../types';

const getAi = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getLanguageName = (lang: Language): string => {
  switch (lang) {
    case 'en': return 'English';
    case 'fr': return 'French';
    case 'ar': return 'Arabic';
  }
};

export const getAiResponse = async (
  history: Message[],
  userMessage: string,
  language: Language
): Promise<GeminiResponse> => {
  const ai = getAi();
  const langName = getLanguageName(language);
  const model = "gemini-2.5-flash";

  const systemInstruction = `You are a friendly and encouraging trilingual language tutor. The user is learning ${langName}. Their native language is English.
  The user has sent a new message. Your task is to:
  1. Continue the conversation naturally in ${langName}. Your response should be helpful and engaging.
  2. Analyze the user's last message for grammar, spelling, or usage errors.
  3. If there are errors, provide a corrected version and a simple, brief explanation in English.
  4. Identify one or two new vocabulary words from the conversation (either from your response or the user's corrected response). For each word, provide the word, its English translation, and a simple example sentence in ${langName}.
  5. Generate 3 short, relevant reply suggestions for the user in ${langName} to continue the conversation.
  
  You MUST respond with a single, valid JSON object. Do not include any text, markdown formatting, or code fences outside of the JSON object.
  `;
  
  const conversationHistory = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  
  // Add current user message to be processed
  conversationHistory.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });


  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...conversationHistory
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING, description: `Your conversational reply in ${langName}.` },
            correction: {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                hasError: { type: Type.BOOLEAN },
                correctedText: { type: Type.STRING, description: "The user's corrected message." },
                explanation: { type: Type.STRING, description: "A simple explanation of the error." },
              },
            },
            newVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: `The new vocabulary word in ${langName}.` },
                  translation: { type: Type.STRING, description: "The English translation." },
                  example: { type: Type.STRING, description: "An example sentence using the word." },
                },
              },
            },
            replySuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse as GeminiResponse;

  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    // Fallback response in case of API error
    return {
      response: "I'm sorry, I'm having a little trouble right now. Please try again in a moment.",
      correction: null,
      newVocabulary: [],
      replySuggestions: [],
    };
  }
};
