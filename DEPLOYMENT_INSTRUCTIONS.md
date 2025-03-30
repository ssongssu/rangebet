# Manga Betting Game - Deployment Instructions

## Step 1: Install Required Tools
```
npm install -g firebase-tools
```

## Step 2: Initialize Firebase (One-time setup)
Navigate to your project folder:
```
cd C:\Users\mingi\Desktop\MangaBettingGame
```

Login to Firebase:
```
firebase login
```

Initialize Firebase for hosting:
```
firebase init hosting
```
Answer the prompts as follows:
- Select "Use an existing project" and choose "manga-bet"
- For public directory, enter: "public"
- Configure as single-page app: "No"
- Set up automatic builds and deploys: "No"

## Step 3: Deploy Your Website
```
firebase deploy
```

After deployment completes, you'll get a URL like:
- https://manga-bet.web.app
- https://manga-bet.firebaseapp.com

## Step 4: Firebase Console Configuration

Before your application works correctly, make sure to:

1. **Enable Email/Password Authentication**:
   - Go to Firebase Console → Authentication → Sign-in methods
   - Enable Email/Password provider

2. **Set up Firestore Database**:
   - Go to Firebase Console → Firestore Database
   - Create database (Start in test mode for development)

3. **Set up Firestore Security Rules**:
   - Go to Firestore Database → Rules
   - For development, use these basic rules:
   
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Troubleshooting

- If deployment fails, check that you're logged in: `firebase login --reauth`
- For authentication issues, verify that Email/Password provider is enabled in Firebase Console
- For database errors, check your Firestore security rules
- If you need to update the site, simply make your changes and run `firebase deploy` again
