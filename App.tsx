import React, { useState, useEffect, useCallback } from 'react';
import { MoodMixSettings } from './types';
import { useAudioProcessor } from './hooks/useAudioProcessor';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';
import ControlPanel from './components/ControlPanel';
import VibeArchitect from './components/VibeArchitect';
import { getVibeSettingsFromPrompt } from './services/geminiService';

const App: React.FC = () => {
  const [settings, setSettings] = useState<MoodMixSettings>({
    masterEnabled: true,
    intensity: 30,
    spatialWidth: 50,
    distance: 40,
  });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<string | null>(null);

  const { isPlaying, fileName, loadAudio, togglePlayPause, updateParams, initializeAudioContext } = useAudioProcessor();

  useEffect(() => {
    updateParams(settings);
  }, [settings, updateParams]);
  
  // Eagerly init audio context on first user interaction to comply with browser policies
  useEffect(() => {
    const init = () => {
      initializeAudioContext();
      window.removeEventListener('click', init);
      window.removeEventListener('keydown', init);
    };
    window.addEventListener('click', init);
    window.addEventListener('keydown', init);
    return () => {
      window.removeEventListener('click', init);
      window.removeEventListener('keydown', init);
    }
  }, [initializeAudioContext]);

  const handleSettingsChange = useCallback(<K extends keyof MoodMixSettings>(key: K, value: MoodMixSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFileChange = (file: File | null) => {
    if (file) {
      loadAudio(file);
    }
  };
  
  const handleVibeGeneration = async (prompt: string) => {
    setIsAiGenerating(true);
    setAiError(null);
    setAiNotes(null);
    try {
      const vibeParams = await getVibeSettingsFromPrompt(prompt);
      setSettings(prev => ({
        ...prev,
        intensity: vibeParams.intensity,
        spatialWidth: vibeParams.spatialWidth,
        distance: vibeParams.distance,
      }));
      setAiNotes(vibeParams.ambienceNotes);
    } catch (error) {
      if(error instanceof Error) {
        setAiError(error.message);
      } else {
        setAiError("An unknown error occurred.");
      }
    } finally {
      setIsAiGenerating(false);
    }
  };

  const hasApiKey = !!process.env.API_KEY;

  return (
    <div className="min-h-screen bg-coffee-dark font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-coffee-mid/50 p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
            <AudioPlayer
              fileName={fileName}
              isPlaying={isPlaying}
              onFileChange={handleFileChange}
              onPlayPause={togglePlayPause}
            />
            <ControlPanel settings={settings} onSettingsChange={handleSettingsChange} />
          </div>
          <div className="lg:col-span-1 bg-coffee-mid/50 p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
            <VibeArchitect 
              onGenerate={handleVibeGeneration}
              isGenerating={isAiGenerating}
              error={aiError}
              notes={aiNotes}
              disabled={!hasApiKey}
            />
          </div>
        </main>
        <footer className="text-center mt-12 text-coffee-light/50 text-sm">
          <p>Crafted for an immersive audio experience. Requires a modern browser with Web Audio API support.</p>
          <p>&copy; {new Date().getFullYear()} MoodMix. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;