export interface MoodMixSettings {
  masterEnabled: boolean;
  intensity: number; // 0-100
  spatialWidth: number; // 0-100
  distance: number; // 0-100
}

export interface VibeParams {
    intensity: number;
    spatialWidth: number;
    distance: number;
    ambienceNotes: string;
}