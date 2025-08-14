import { useState, useRef, useCallback, useEffect } from 'react';
import { MoodMixSettings } from '../types';

// Helper to map a value from one range to another
const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const useAudioProcessor = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  
  // Effect nodes refs
  const inputGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const haasDelayRef = useRef<DelayNode | null>(null);
  const lpfRef = useRef<BiquadFilterNode | null>(null);
  const hpfRef = useRef<BiquadFilterNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const ambienceGainRef = useRef<GainNode | null>(null);

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        // Create the entire node graph once
        inputGainRef.current = context.createGain();
        masterGainRef.current = context.createGain();
        pannerRef.current = context.createStereoPanner();
        haasDelayRef.current = context.createDelay(0.1); // Max delay 100ms
        lpfRef.current = context.createBiquadFilter();
        hpfRef.current = context.createBiquadFilter();
        convolverRef.current = context.createConvolver();
        ambienceGainRef.current = context.createGain();

        // Create a synthetic impulse response for reverb
        const impulseLength = context.sampleRate * 1.5; // 1.5 seconds reverb
        const impulse = context.createBuffer(2, impulseLength, context.sampleRate);
        const impulseL = impulse.getChannelData(0);
        const impulseR = impulse.getChannelData(1);
        for (let i = 0; i < impulseLength; i++) {
          impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2.5);
          impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2.5);
        }
        convolverRef.current.buffer = impulse;

        lpfRef.current.type = 'lowpass';
        hpfRef.current.type = 'highpass';
        
        // Connect the graph:
        // Input -> HPF -> LPF -> Panner -> Haas Delay -> Master Gain -> Output
        //             -> Convolver -> Ambience Gain -> Master Gain
        inputGainRef.current.connect(hpfRef.current);
        hpfRef.current.connect(lpfRef.current);
        lpfRef.current.connect(pannerRef.current);
        pannerRef.current.connect(haasDelayRef.current);
        haasDelayRef.current.connect(masterGainRef.current);

        // Ambience path
        lpfRef.current.connect(convolverRef.current);
        convolverRef.current.connect(ambienceGainRef.current);
        ambienceGainRef.current.connect(masterGainRef.current);

        masterGainRef.current.connect(context.destination);
        setIsInitialized(true);

      } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
      }
    }
  }, []);

  const loadAudio = useCallback(async (file: File) => {
    if (!audioContextRef.current) {
      initializeAudioContext();
    }
    const context = audioContextRef.current;
    if (!context || !file) return;

    if (isPlaying) {
      await togglePlayPause(); // Stop current playback
    }

    setFileName(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const decodedBuffer = await context.decodeAudioData(arrayBuffer);
    setAudioBuffer(decodedBuffer);
  }, [initializeAudioContext, isPlaying]);

  const togglePlayPause = useCallback(async () => {
    const context = audioContextRef.current;
    if (!context || !audioBuffer) return;

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      sourceNodeRef.current?.disconnect();
      sourceNodeRef.current = null;
      setIsPlaying(false);
      // Suspend context to save power
      if (context.state === 'running') {
        await context.suspend();
      }
    } else {
      if (context.state === 'suspended') {
        await context.resume();
      }
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;
      source.connect(inputGainRef.current!);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
      
      source.onended = () => {
         if (isPlaying) {
            setIsPlaying(false);
         }
      };
    }
  }, [audioBuffer, isPlaying]);
  
  const updateParams = useCallback((settings: MoodMixSettings) => {
    if (!isInitialized || !audioContextRef.current) return;
    
    const { masterEnabled, intensity, spatialWidth, distance } = settings;
    const { currentTime } = audioContextRef.current;
    
    // Master toggle
    masterGainRef.current?.gain.setTargetAtTime(masterEnabled ? 1.0 : 0.0, currentTime, 0.02);
    
    // Intensity (controls dry/wet mix via ambience gain)
    const ambienceLevel = mapRange(intensity, 0, 100, 0.0, 0.4); // Subtle ambience
    ambienceGainRef.current?.gain.setTargetAtTime(ambienceLevel, currentTime, 0.05);

    // Spatial Width (StereoPanner & Haas delay)
    const panValue = mapRange(spatialWidth, 0, 100, 0, 1);
    const delayTime = mapRange(spatialWidth, 0, 100, 0.001, 0.025); // 1ms to 25ms for Haas effect
    pannerRef.current?.pan.setTargetAtTime(panValue * (Math.random() > 0.5 ? 1 : -1) * 0.3, currentTime, 0.1); // Random small pan
    haasDelayRef.current?.delayTime.setTargetAtTime(delayTime, currentTime, 0.1);

    // Distance (Air absorption via LPF and presence reduction via HPF)
    const lpfFreq = mapRange(distance, 0, 100, 12000, 4000);
    const hpfFreq = mapRange(distance, 0, 100, 50, 200);
    lpfRef.current?.frequency.setTargetAtTime(lpfFreq, currentTime, 0.1);
    hpfRef.current?.frequency.setTargetAtTime(hpfFreq, currentTime, 0.1);

  }, [isInitialized]);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  return { isPlaying, fileName, loadAudio, togglePlayPause, updateParams, initializeAudioContext };
};