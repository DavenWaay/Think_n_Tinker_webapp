# Firebase Configuration Instructions

## Step 1: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project (the one used for Think n' Tinker)
3. Click the ⚙️ (Settings) icon next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app yet:
   - Click the `</>` icon to add a web app
   - Give it a name (e.g., "Think n Tinker Admin")
   - Click "Register app"
7. Copy the `firebaseConfig` object

## Step 2: Update the Config File

Open `src/config/firebase.ts` and replace the placeholder values with your actual config:

```typescript
const firebaseConfig = {
  apiKey: "AIza...",                    // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 3: Set Up Firestore Security Rules (Important!)

Since you already have Firestore set up, add these rules to allow the web app to write data:

1. In Firebase Console, go to **Firestore Database**
2. Click the **Rules** tab
3. Add/update your rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Your existing user data rules
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // NEW: Add these rules for the subjects collection
    match /subjects/{subject} {
      // Anyone can read (for mobile app)
      allow read: if true;
      
      // For now, anyone can write (you can add auth later)
      // CHANGE THIS BEFORE PRODUCTION!
      allow write: if true;
      
      match /stages/{stage} {
        allow read: if true;
        allow write: if true;
      }
    }
  }
}
```

**⚠️ Security Note:** The above rules allow anyone to write. For production, you should:
- Add Firebase Authentication to the web app
- Change `allow write: if true;` to `allow write: if request.auth != null;`
- Optionally restrict to specific admin users

## Step 4: Test the Connection

1. Make sure the dev server is running (`npm run dev`)
2. Open http://localhost:5173
3. Try creating a subject
4. If you see errors:
   - Check the browser console (F12)
   - Verify your Firebase config is correct
   - Check Firestore rules allow write access

## Optional: Add Authentication (Recommended for Production)

If you want to secure the admin panel:

1. Enable Authentication in Firebase Console
2. Install auth library (already included with firebase package)
3. Add login/logout functionality
4. Update Firestore rules to require authentication

Need help with authentication? Let me know!
