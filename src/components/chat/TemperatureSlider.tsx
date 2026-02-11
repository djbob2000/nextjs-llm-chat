"use client";

import { Slider } from "@/components/ui/slider";

interface TemperatureSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function TemperatureSlider({
  value,
  onChange,
  disabled,
}: TemperatureSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Temperature
        </label>
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
          {value.toFixed(1)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={2}
        step={0.1}
        disabled={disabled}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
        <span>Precise</span>
        <span>Creative</span>
      </div>
    </div>
  );
}
