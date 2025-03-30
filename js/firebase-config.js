// Firebase Configuration

// Import the Firebase modules needed
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFHWBsPOKX8JvxCdnU0y0SQ38WXdF2SsI",
  authDomain: "manga-bet.firebaseapp.com",
  projectId: "manga-bet",
  storageBucket: "manga-bet.appspot.com",
  messagingSenderId: "239913815099",
  appId: "1:239913815099:web:dc05be9ca9535ac577e01e",
  measurementId: "G-CGXN6R11TG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export the Firebase services for use in other modules
export { app, auth, db, analytics };