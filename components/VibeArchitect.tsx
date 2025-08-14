import React, { useState } from 'react';

interface VibeArchitectProps {
    onGenerate: (prompt: string) => void;
    isGenerating: boolean;
    error: string | null;
    notes: string | null;
    disabled: boolean;
}

const VibeArchitect: React.FC<VibeArchitectProps> = ({ onGenerate, isGenerating, error, notes, disabled }) => {
    const [prompt, setPrompt] = useState('A calm, rainy evening, listening from inside a cozy room.');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-2">
                Vibe Architect
            </h3>
            <p className="text-sm text-coffee-light/70 mb-4">
                {disabled ? "Set your API_KEY to enable this feature." : "Describe a scene and let AI configure the sound."}
            </p>

            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Sitting by a crackling fireplace in a log cabin."
                    className="w-full flex-grow p-3 bg-coffee-dark/50 text-coffee-accent rounded-md resize-none border border-coffee-mid focus:ring-2 focus:ring-amber-500 focus:outline-none transition-shadow"
                    rows={4}
                    disabled={isGenerating || disabled}
                />
                <button
                    type="submit"
                    disabled={isGenerating || disabled || !prompt.trim()}
                    className="mt-4 w-full px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500 transition-colors duration-200 shadow-md disabled:bg-coffee-mid disabled:cursor-not-allowed disabled:text-coffee-light/50"
                >
                    {isGenerating ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </div>
                    ) : (
                        'Generate Vibe'
                    )}
                </button>
            </form>
            <div className="mt-4 min-h-[60px]">
                {error && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}
                {notes && !error && (
                     <div className="text-sm text-amber-400/90 bg-amber-900/20 p-3 rounded-md italic">
                        <span className="font-bold not-italic">AI Notes:</span> "{notes}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default VibeArchitect;