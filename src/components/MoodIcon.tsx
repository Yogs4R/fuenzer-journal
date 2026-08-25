import React from 'react';
import {
  Leaf,
  Sparkles,
  Sun,
  Sprout,
  Coffee,
  Wind,
  CloudRain,
  Moon,
  Smile,
} from 'lucide-react';

interface MoodIconProps {
  iconName?: string;
  className?: string;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ iconName, className = 'w-3.5 h-3.5' }) => {
  switch (iconName) {
    case 'Leaf':
      return <Leaf className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Sun':
      return <Sun className={className} />;
    case 'Sprout':
      return <Sprout className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'Moon':
      return <Moon className={className} />;
    default:
      return <Smile className={className} />;
  }
};
