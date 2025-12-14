// ===================================
// ALPHABET GAME TYPES AND STRUCTURES
// ===================================

export type AlphabetGameType = 
  | 'mixed' 
  | 'phonics' 
  | 'cards' 
  | 'image' 
  | 'sound' 
  | 'catching';

// Alphabet Stage Data (game-type specific fields)
export interface AlphabetStageData {
  // For phonics, image, catching games
  correctLetter?: string;
  correctLetters?: string[]; // For games with multiple correct answers
  choices?: string[];

  // For tracing games
  letter?: string;
  strokeOrder?: string[];

  // For card matching games
  pairs?: string[];
  cardPairs?: Array<{
    letter: string;
    imageName?: string;
  }>;

  // For sound matching games
  soundPairs?: Array<{
    letter: string;
    soundId: string;
  }>;

  // Image-based games
  image?: string; // URL or path
  audio?: string; // URL or path
}

// Alphabet Level
export interface AlphabetLevel {
  levelIndex: number; // Auto-incremented
  name: string;
  title: string;
  icon: {
    set: string;
    name: string;
  };
  gameType: AlphabetGameType;
  stages: AlphabetStageData[];
  createdAt: string;
  updatedAt: string;
}

// ===================================
// SECTION STRUCTURE (for all subjects)
// ===================================

export interface Section {
  id: string; // section1, section2, etc.
  name: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  createdAt: string;
  updatedAt: string;
}

// ===================================
// NUMBERS GAME TYPES AND STRUCTURES
// ===================================

export type NumberGameType = 
  | 'mixed' 
  | 'dragndrop' 
  | 'tracing' 
  | 'cards' 
  | 'matching' 
  | 'image' 
  | 'sound' 
  | 'counting' 
  | 'catching';

export interface NumberStageData {
  question?: string;
  correctAnswer?: string;
  choices?: string[];
  imageCount?: number;
  imageSource?: string;
  audio?: string;
  number?: number;
  strokeOrder?: string[];
  
  dragAndDrop?: Array<{
    correctCount: number;
    itemIcon?: string;
  }>;
  
  correctCount?: number;
  itemIcon?: string;
  pairs?: number[];
  
  cardPairs?: Array<{
    number: number;
    image: string;
  }>;
  
  correctNumber?: string;
}

export interface NumberLevel {
  levelIndex: number;
  name: string;
  title: string;
  icon: {
    set: string;
    name: string;
  };
  gameType: NumberGameType;
  stages: NumberStageData[];
  createdAt: string;
  updatedAt: string;
}

// ===================================
// COLORS GAME TYPES AND STRUCTURES
// ===================================

export type ColorGameType = 
  | 'mixed' 
  | 'phonics' 
  | 'tracing' 
  | 'cards' 
  | 'matching' 
  | 'image' 
  | 'sound' 
  | 'colorRecognition' 
  | 'rocket' 
  | 'colorMultipleChoice' 
  | 'catching';

export interface ColorStageData {
  correctColor?: string;
  choices?: string[];
  correctChoice?: string;
  color?: string;
  strokeOrder?: string[];
  pairs?: string[];
  
  cardPairs?: Array<{
    color: string;
    image: string;
  }>;
  
  soundPairs?: Array<{
    color: string;
    soundId: string;
    audioFile: string;
  }>;
  
  colorItems?: Array<{
    item: string;
    color: string;
    image: string;
  }>;
  
  questions?: Array<{
    word: string;
    correctAnswer: string;
    wrongAnswer: string;
  }>;
}

export interface ColorLevel {
  levelIndex: number;
  name: string;
  title: string;
  icon: {
    set: string;
    name: string;
  };
  gameType: ColorGameType;
  stages: ColorStageData[];
  createdAt: string;
  updatedAt: string;
}

// ===================================
// SHAPES GAME TYPES AND STRUCTURES
// ===================================

export type ShapeGameType = 
  | 'mixed' 
  | 'tracing' 
  | 'cards' 
  | 'matching' 
  | 'image' 
  | 'sound' 
  | 'shapesMultipleChoice' 
  | 'shapeRecognition' 
  | 'fallingObjects' 
  | 'rocket' 
  | 'rocketShapes' 
  | 'catching' 
  | 'racing';

export interface ShapeStageData {
  correctShape?: string;
  correctShapes?: string[];
  choices?: string[];
  
  questions?: Array<{
    word: string;
    correctAnswer: string;
    wrongAnswer: string;
  }>;
  
  correctChoice?: string;
}

export interface ShapeLevel {
  levelIndex: number;
  name: string;
  title: string;
  icon: {
    set: string;
    name: string;
  };
  gameType: ShapeGameType;
  stages: ShapeStageData[];
  createdAt: string;
  updatedAt: string;
}

// ===================================
// UNION TYPE FOR ALL LEVELS
// ===================================

export type Level = AlphabetLevel | NumberLevel | ColorLevel | ShapeLevel;
export type GameType = AlphabetGameType | NumberGameType | ColorGameType | ShapeGameType;
export type StageData = AlphabetStageData | NumberStageData | ColorStageData | ShapeStageData;

// ===================================
// SUBJECT TYPES
// ===================================

export type SubjectType = 'alphabet' | 'numbers' | 'colors' | 'shapes';

// Firestore document structure
export interface SubjectDocument {
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
