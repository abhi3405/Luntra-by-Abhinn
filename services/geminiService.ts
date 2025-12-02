import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Role } from "../types";

// Initialize Gemini Client
// Note: We are using the environment variable as strictly required by the system instructions.
// The user provided a Groq key in the prompt, but we are bound to use the Gemini API 
// and the environment's pre-configured API_KEY for this specific runtime environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash for a good balance of speed and intelligence suitable for a chatbot
const MODEL_NAME = 'gemini-2.5-flash';

let chatSession: Chat | null = null;

export const initChatSession = () => {
  chatSession = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: "You are Luntra, a professional, smart, and user-friendly AI assistant. You provide concise, helpful, and accurate answers. You format your responses with Markdown.",
    },
  });
};

export const sendMessageStream = async function* (message: string) {
  if (!chatSession) {
    initChatSession();
  }

  if (!chatSession) {
     throw new Error("Failed to initialize chat session");
  }

  try {
    const resultStream = await chatSession.sendMessageStream({ message });

    for await (const chunk of resultStream) {
      // Safe casting as per docs
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
