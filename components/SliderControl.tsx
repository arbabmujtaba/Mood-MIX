
import React from 'react';

interface SliderControlProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const backgroundStyle = {
    background: `linear-gradient(to right, #f59e0b ${percentage}%, #3c2a21 ${percentage}%)`,
  };

  return (
    <div className={`transition-opacity duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex justify-between items-baseline">
        <label className="text-lg font-semibold text-coffee-accent">{label}</label>
        <span className="text-lg font-mono text-amber-400">{value.toString().padStart(3, ' ')}</span>
      </div>
      <p className="text-sm text-coffee-light/70 mb-3">{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={backgroundStyle}
      />
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #e5e0d8;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #3c2a21;
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #e5e0d8;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #3c2a21;
        }
      `}</style>
    </div>
  );
};

export default SliderControl;
