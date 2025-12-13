# Think n' Tinker - Data Manager Web App

A React-based web application for managing educational game content stored in Firestore.

## Features

- **Subject Management**: Create, view, and delete subjects (alphabet, numbers, shapes, colors)
- **Stage Organization**: Organize content into stages/levels
- **Game CRUD**: Full create, read, update, delete operations for game content
- **GameType Support**: Handle different game types (image, audio, match, trace, quiz, sequence)
- **Dynamic Forms**: GameType-specific form fields with choice management
- **Firestore Integration**: Real-time data synchronization with Firebase

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Update `src/config/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**To get your Firebase config:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (⚙️ icon)
4. Scroll down to "Your apps" section
5. Click on the web app or create one
6. Copy the configuration object

### 3. Firestore Database Structure

The app uses the following Firestore structure:

```
subjects/
  {subjectId}/           # e.g., "alphabet", "numbers"
    name: string
    description: string
    updatedAt: timestamp
    
    stages/              # subcollection
      {stageId}/         # e.g., "stage_1"
        name: string
        level: number
        games: [         # array of game objects
          {
            id: string
            gameType: "image" | "audio" | "match" | "trace" | "quiz" | "sequence"
            question: string
            correctAnswer: string | string[]
            choices: [
              {
                id: string
                value: string
                image?: string
                audio?: string
                color?: string
              }
            ]
            image?: string
            audio?: string
            hint?: string
            difficulty?: number
          }
        ]
        updatedAt: timestamp
```

### 4. Firestore Security Rules

Add these basic rules to your Firestore (adjust based on your authentication needs):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to subjects for mobile app
    match /subjects/{subject} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
      
      match /stages/{stage} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Creating a Subject
1. Click "Add New Subject"
2. Enter subject ID (e.g., `alphabet`), name, and description
3. Click "Create Subject"

### Adding Stages
1. Click "Manage Stages" on a subject card
2. Click "Add New Stage"
3. Enter stage details (ID, name, level)
4. Click "Create Stage"

### Creating Games
1. Navigate to a stage
2. Click "Add New Game"
3. Fill in game details:
   - **Game ID**: Unique identifier
   - **Game Type**: Select the type of game
   - **Question**: Optional question text
   - **Correct Answer**: The answer(s) - comma-separated for multiple
   - **Image/Audio**: Paths to media assets
   - **Choices**: Add multiple choice options with their own media paths
4. Click "Create Game"

### GameType Guidelines

- **image**: Shows an image, player selects correct option
- **audio**: Plays audio, player identifies what they hear
- **match**: Match items together
- **trace**: Tracing activity (shapes, letters)
- **quiz**: Question with multiple choice answers
- **sequence**: Order items in sequence

## Mobile App Integration

To fetch data in your React Native app:

```typescript
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function loadSubjectData(subjectId: string) {
  try {
    // Try to fetch from Firestore
    const subjectRef = doc(db, 'subjects', subjectId);
    const subjectSnap = await getDoc(subjectRef);
    
    const stagesRef = collection(db, 'subjects', subjectId, 'stages');
    const stagesSnap = await getDocs(stagesRef);
    
    const data = {
      subject: subjectSnap.data(),
      stages: stagesSnap.docs.map(doc => doc.data())
    };
    
    // Cache locally
    await AsyncStorage.setItem(\`subject_\${subjectId}\`, JSON.stringify(data));
    
    return data;
  } catch (error) {
    // Fallback to cached data
    const cached = await AsyncStorage.getItem(\`subject_\${subjectId}\`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

## Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Firebase/Firestore** - Backend database
- **CSS** - Styling

## Project Structure

```
src/
  components/
    SubjectList.tsx      # List all subjects
    SubjectEditor.tsx    # Manage stages for a subject
    StageEditor.tsx      # Manage games in a stage
    GameEditor.tsx       # Create/edit individual games
  services/
    firestore.ts         # Firestore CRUD operations
  config/
    firebase.ts          # Firebase configuration
  types/
    index.ts            # TypeScript type definitions
  App.tsx               # Main app with routing
  App.css               # Global styles
```

## Notes

- Media files (images/audio) are referenced by path, not uploaded through this app
- Ensure media assets exist in your mobile app's assets folder
- The web app only manages JSON data structure, not media files
- Consider adding authentication if deploying to production

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
