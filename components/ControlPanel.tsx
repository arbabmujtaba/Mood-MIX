import React from 'react';
import { MoodMixSettings } from '../types';
import SliderControl from './SliderControl';
import ToggleSwitch from './ToggleSwitch';

interface ControlPanelProps {
  settings: MoodMixSettings;
  onSettingsChange: <K extends keyof MoodMixSettings>(key: K, value: MoodMixSettings[K]) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ settings, onSettingsChange }) => {
  return (
    <div className="mt-8 space-y-8">
      <div className="flex justify-between items-center bg-coffee-mid/30 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-coffee-accent">Master Effect</h3>
        <ToggleSwitch
          enabled={settings.masterEnabled}
          onChange={(value) => onSettingsChange('masterEnabled', value)}
        />
      </div>
      <div className="space-y-6">
        <SliderControl
          label="Intensity"
          description="The overall strength of the atmospheric effect."
          value={settings.intensity}
          onChange={(value) => onSettingsChange('intensity', value)}
          disabled={!settings.masterEnabled}
        />
        <SliderControl
          label="Spatial Width"
          description="Controls the stereo width and sense of space."
          value={settings.spatialWidth}
          onChange={(value) => onSettingsChange('spatialWidth', value)}
          disabled={!settings.masterEnabled}
        />
        <SliderControl
          label="Distance"
          description="Simulates audio distance through creative filtering."
          value={settings.distance}
          onChange={(value) => onSettingsChange('distance', value)}
          disabled={!settings.masterEnabled}
        />
      </div>
    </div>
  );
};

export default ControlPanel;