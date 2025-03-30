======================================
MANGA BETTING GAME - DEPLOYMENT GUIDE
======================================

This file contains instructions on how to deploy your manga betting game to Firebase Hosting.

PREREQUISITES:
-------------
1. Node.js and npm installed
2. Firebase CLI installed (npm install -g firebase-tools)
3. Firebase account (create one at firebase.google.com)

DEPLOYMENT STEPS:
---------------
1. Open a terminal/command prompt
2. Navigate to your project folder:
   cd C:\Users\mingi\Desktop\MangaBettingGame

3. Log in to Firebase:
   firebase login

4. Deploy your site:
   firebase deploy

5. After successful deployment, you'll receive a URL where your site is hosted
   (typically https://manga-bet.web.app or https://manga-bet.firebaseapp.com)

FIREBASE CONFIGURATION:
---------------------
Before your app works correctly, make sure to:

1. Enable Email/Password Authentication:
   - Go to Firebase Console -> Authentication -> Sign-in methods
   - Enable Email/Password provider

2. Set up Firestore Database:
   - Go to Firebase Console -> Firestore Database
   - Create database (Start in test mode for development)

3. Set up Firestore Security Rules:
   - Go to Firestore Database -> Rules
   - For development, you can use:
   
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

TROUBLESHOOTING:
--------------
- If you encounter errors during deployment, check the Firebase CLI error messages
- For authentication issues, verify that Email/Password provider is enabled
- For database errors, check your Firestore security rules and indexes

UPDATING YOUR SITE:
----------------
After making changes to your code, redeploy using:
   firebase deploy

======================================
