// Import types for TypeScript
import { VibeParams } from "../types";

// The local Ollama server URL (default for Ollama is port 11434)
const OLLAMA_URL = "http://localhost:11434/api/generate";

/**
 * Converts a scene or mood description into audio effect parameters
 * using a local AI model running via Ollama.
 * 
 * Model recommendation: "mistral" or "gemma"
 * Download first by running in terminal: `ollama pull mistral`
 */
export const getVibeSettingsFromPrompt = async (sceneDescription: string): Promise<VibeParams> => {
    try {
        // The AI instruction
        const prompt = `
        You are an assistant that turns mood descriptions into audio effect settings.
        Based on this scene: "${sceneDescription}"
        
        Return ONLY a JSON object with:
        - intensity (0–100)
        - spatialWidth (0–100)
        - distance (0–100)
        - ambienceNotes (a short creative description)
        `;

        // Make request to local AI
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral",   // change to any locally downloaded model
                prompt: prompt,
                stream: false
            })
        });

        // Parse the AI's reply
        const data = await response.json();
        const rawText = data.response.trim();

        let settings: VibeParams;
        try {
            settings = JSON.parse(rawText);
        } catch {
            throw new Error("AI did not return valid JSON.");
        }

        // Sanity check
        if (
            typeof settings.intensity !== "number" ||
            typeof settings.spatialWidth !== "number" ||
            typeof settings.distance !== "number"
        ) {
            throw new Error("Missing numeric fields in AI output.");
        }

        return settings;

    } catch (error) {
        console.error("💥 Local AI error:", error);
        throw new Error("Could not generate audio settings locally.");
    }
};
