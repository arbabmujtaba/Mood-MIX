import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { VibeParams } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getVibeSettingsFromPrompt = async (prompt: string): Promise<VibeParams> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following scene or mood description, generate appropriate parameters for an audio effect processor. The user wants to feel like their audio is playing within this scene.

Description: "${prompt}"

Return a JSON object with values between 0 and 100 for intensity, spatialWidth, and distance. Also include a brief "ambienceNotes" string describing the sonic environment you imagined.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        intensity: {
                            type: Type.NUMBER,
                            description: "Overall effect intensity. Lower for subtle moods, higher for more immersive ones. Range: 0-100."
                        },
                        spatialWidth: {
                            type: Type.NUMBER,
                            description: "Stereo width of the ambience. Lower for a narrow, focused sound, higher for a wide, open environment. Range: 0-100."
                        },
                        distance: {
                            type: Type.NUMBER,
                            description: "Perceived distance of the sound. Lower for close-up audio, higher for audio far away. Range: 0-100."
                        },
                        ambienceNotes: {
                            type: Type.STRING,
                            description: "A short, creative description of the soundscape imagined from the prompt."
                        }
                    },
                    required: ["intensity", "spatialWidth", "distance", "ambienceNotes"],
                },
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        // Basic validation
        if (typeof parsedJson.intensity !== 'number' || typeof parsedJson.spatialWidth !== 'number' || typeof parsedJson.distance !== 'number') {
            throw new Error("AI response is missing required numeric fields.");
        }

        return parsedJson as VibeParams;

    } catch (error) {
        console.error("Error generating mood settings from Gemini:", error);
        throw new Error("Failed to get mood settings from AI. Please check your prompt or API key.");
    }
};