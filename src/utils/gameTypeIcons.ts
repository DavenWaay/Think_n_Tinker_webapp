import type { AlphabetGameType, NumberGameType, ColorGameType, ShapeGameType } from '../types';

// Icon configuration for each game type
// Note: These must match the icon sets supported by the React Native app
interface IconConfig {
  set: 'MaterialIcons' | 'FontAwesome' | 'FontAwesome5';
  name: string;
}

// Alphabet game type icons
export const alphabetGameTypeIcons: Record<AlphabetGameType, IconConfig> = {
  phonics: { set: 'MaterialIcons', name: 'volume-up' },
  image: { set: 'MaterialIcons', name: 'image' },
  catching: { set: 'MaterialIcons', name: 'shopping-basket' },
  cards: { set: 'MaterialIcons', name: 'style' },
  sound: { set: 'MaterialIcons', name: 'volume-up' },
  mixed: { set: 'MaterialIcons', name: 'star' },
};

// Number game type icons
export const numberGameTypeIcons: Record<NumberGameType, IconConfig> = {
  counting: { set: 'MaterialIcons', name: 'filter-9-plus' },
  dragndrop: { set: 'MaterialIcons', name: 'touch-app' },
  tracing: { set: 'MaterialIcons', name: 'create' },
  cards: { set: 'MaterialIcons', name: 'style' },
  matching: { set: 'MaterialIcons', name: 'extension' },
  image: { set: 'MaterialIcons', name: 'image' },
  sound: { set: 'MaterialIcons', name: 'volume-up' },
  catching: { set: 'MaterialIcons', name: 'shopping-basket' },
  mixed: { set: 'MaterialIcons', name: 'star' },
};

// Color game type icons
export const colorGameTypeIcons: Record<ColorGameType, IconConfig> = {
  colorRecognition: { set: 'MaterialIcons', name: 'palette' },
  colorMultipleChoice: { set: 'MaterialIcons', name: 'palette' },
  rocket: { set: 'FontAwesome5', name: 'rocket' },
  matching: { set: 'MaterialIcons', name: 'extension' },
  catching: { set: 'MaterialIcons', name: 'shopping-basket' },
  phonics: { set: 'MaterialIcons', name: 'volume-up' },
  tracing: { set: 'MaterialIcons', name: 'create' },
  cards: { set: 'MaterialIcons', name: 'style' },
  image: { set: 'MaterialIcons', name: 'image' },
  sound: { set: 'MaterialIcons', name: 'volume-up' },
  mixed: { set: 'MaterialIcons', name: 'star' },
};

// Shape game type icons
export const shapeGameTypeIcons: Record<ShapeGameType, IconConfig> = {
  shapeRecognition: { set: 'MaterialIcons', name: 'category' },
  shapesMultipleChoice: { set: 'MaterialIcons', name: 'category' },
  rocketShapes: { set: 'FontAwesome5', name: 'rocket' },
  rocket: { set: 'FontAwesome5', name: 'rocket' },
  matching: { set: 'MaterialIcons', name: 'extension' },
  catching: { set: 'MaterialIcons', name: 'shopping-basket' },
  racing: { set: 'FontAwesome5', name: 'car' },
  fallingObjects: { set: 'MaterialIcons', name: 'arrow-downward' },
  tracing: { set: 'MaterialIcons', name: 'create' },
  cards: { set: 'MaterialIcons', name: 'style' },
  image: { set: 'MaterialIcons', name: 'image' },
  sound: { set: 'MaterialIcons', name: 'volume-up' },
  mixed: { set: 'MaterialIcons', name: 'star' },
};

// Helper function to get icon for any game type
export function getIconForGameType(
  gameType: AlphabetGameType | NumberGameType | ColorGameType | ShapeGameType,
  subjectType: 'alphabet' | 'numbers' | 'colors' | 'shapes'
): IconConfig {
  switch (subjectType) {
    case 'alphabet':
      return alphabetGameTypeIcons[gameType as AlphabetGameType];
    case 'numbers':
      return numberGameTypeIcons[gameType as NumberGameType];
    case 'colors':
      return colorGameTypeIcons[gameType as ColorGameType];
    case 'shapes':
      return shapeGameTypeIcons[gameType as ShapeGameType];
    default:
      return { set: 'MaterialCommunityIcons', name: 'star' };
  }
}
