// Authentication Module
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// DOM Elements
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

const signupForm = document.getElementById('signup-form');
const signupUsername = document.getElementById('signup-username');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupError = document.getElementById('signup-error');

const logoutButton = document.getElementById('logout-button');

const loginContainer = document.getElementById('login-container');
const gameContainer = document.getElementById('game-container');

const usernameDisplay = document.getElementById('username-display');
const balanceDisplay = document.getElementById('balance-display');

// Global user data
let currentUser = null;
let userProfile = null;

// Initialize auth state
export function initAuth() {
    // Make sure DOM elements are available
    const usernameDisplay = document.getElementById('username-display');
    const balanceDisplay = document.getElementById('balance-display');
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            
            // Load user profile
            loadUserProfile(user.uid).then(profile => {
                userProfile = profile;
                
                // Show game container
                loginContainer.style.display = 'none';
                gameContainer.style.display = 'block';
                
                // Handle case where profile is null or missing fields
                if (!userProfile) {
                    console.log("Creating default profile for user");
                    // Create a default profile
                    userProfile = {
                        username: "Player",
                        balance: 1000,
                        stats: {
                            totalBets: 0,
                            wins: 0,
                            losses: 0,
                            bestStreak: 0,
                            currentStreak: 0
                        }
                    };
                    
                    // Attempt to save default profile to Firestore
                    createDefaultUserProfile(user.uid, userProfile);
                }
                
                // Update UI with user info - add null checks
                const displayUsername = (userProfile.username || "Player").trim();
                usernameDisplay.textContent = `Hello, ${displayUsername}!`;
                console.log("Setting username display to:", displayUsername);

                // Ensure profile has a username
                if (!userProfile.username) {
                    userProfile.username = displayUsername;
                    // Update Firestore document to save the username
                    const userRef = doc(db, "users", user.uid);
                    updateDoc(userRef, { username: displayUsername })
                        .catch(error => console.error("Error updating username:", error));
                }
                
                if (typeof userProfile.balance === 'number') {
                    balanceDisplay.textContent = userProfile.balance;
                } else {
                    console.log("Balance not found in profile or invalid type");
                    balanceDisplay.textContent = "1000";
                    // Update profile with default balance
                    userProfile.balance = 1000;
                }
                
                // Ensure stats object exists
                if (!userProfile.stats) {
                    userProfile.stats = {
                        totalBets: 0,
                        wins: 0,
                        losses: 0,
                        bestStreak: 0,
                        currentStreak: 0
                    };
                }
                
                // Update online status - with error handling
                updateOnlineStatus(true).catch(error => {
                    console.error("Error updating online status:", error);
                });
                
                // Initialize game and load history
                import('./game.js').then(module => {
                    if (module.initGame) {
                        module.initGame(userProfile.balance);
                    }
                }).catch(error => {
                    console.error("Error loading game module:", error);
                });
                
                // Load user betting history
                import('./stats.js').then(module => {
                    if (module.loadUserHistory) {
                        module.loadUserHistory();
                    }
                }).catch(error => {
                    console.error("Error loading stats module:", error);
                });
            }).catch(error => {
                console.error("Error in profile loading process:", error);
                // Handle critical error by showing login screen
                currentUser = null;
                userProfile = null;
                loginContainer.style.display = 'block';
                gameContainer.style.display = 'none';
                
                // Show error message
                loginError.textContent = "Error loading profile. Please try logging in again.";
                loginError.style.display = 'block';
            });
        } else {
            // User is signed out
            currentUser = null;
            userProfile = null;
            
            // Show login container
            loginContainer.style.display = 'block';
            gameContainer.style.display = 'none';
        }
    });
    
    // Set up event listeners
    setupEventListeners();
}

// Create a default user profile if none exists
async function createDefaultUserProfile(userId, defaultProfile) {
    try {
        await setDoc(doc(db, "users", userId), {
            ...defaultProfile,
            createdAt: serverTimestamp(),
            online: true
        });
        console.log("Created default user profile");
    } catch (error) {
        console.error("Error creating default profile:", error);
    }
}

// Set up event listeners for auth forms
function setupEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        
        // Clear previous errors
        loginError.textContent = '';
        loginError.style.display = 'none';
        
        // Validate inputs
        if (!email || !password) {
            loginError.textContent = 'Please fill in all fields';
            loginError.style.display = 'block';
            return;
        }
        
        // Using the promise-based approach from the snippet
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // Clear form
                loginForm.reset();
            })
            .catch((error) => {
                loginError.textContent = error.message;
                loginError.style.display = 'block';
            });
    });
    
    // Sign up form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = signupUsername.value.trim();
        const email = signupEmail.value.trim();
        const password = signupPassword.value;
        
        // Clear previous errors
        signupError.textContent = '';
        signupError.style.display = 'none';
        
        // Validate inputs
        if (!username || !email || !password) {
            signupError.textContent = 'Please fill in all fields';
            signupError.style.display = 'block';
            return;
        }
        
        if (password.length < 6) {
            signupError.textContent = 'Password must be at least 6 characters';
            signupError.style.display = 'block';
            return;
        }
        
        // Using the promise-based approach
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                
                // Create user profile in Firestore
                setDoc(doc(db, "users", user.uid), {
                    username: username,
                    email: email,
                    balance: 1000, // Starting balance
                    createdAt: serverTimestamp(),
                    online: true,
                    stats: {
                        totalBets: 0,
                        wins: 0,
                        losses: 0,
                        bestStreak: 0,
                        currentStreak: 0
                    }
                })
                .then(() => {
                    // Clear form
                    signupForm.reset();
                })
                .catch((error) => {
                    signupError.textContent = "Error creating profile: " + error.message;
                    signupError.style.display = 'block';
                });
            })
            .catch((error) => {
                signupError.textContent = error.message;
                signupError.style.display = 'block';
            });
    });
    
    // Logout button
    logoutButton.addEventListener('click', () => {
        // Update online status first
        updateOnlineStatus(false)
            .then(() => {
                // Sign out
                signOut(auth)
                    .catch((error) => {
                        console.error("Error signing out:", error);
                    });
            })
            .catch((error) => {
                console.error("Error updating online status:", error);
                // Try to sign out anyway
                signOut(auth)
                    .catch((error) => {
                        console.error("Error signing out:", error);
                    });
            });
    });
}

// Load user profile from Firestore
function loadUserProfile(userId) {
    if (!userId) return Promise.resolve(null);
    
    return getDoc(doc(db, "users", userId))
        .then((docSnap) => {
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                console.error("No user profile found!");
                return null;
            }
        })
        .catch((error) => {
            console.error("Error loading user profile:", error);
            return null;
        });
}

// Update user's online status
function updateOnlineStatus(isOnline) {
    if (!currentUser) return Promise.resolve();
    
    // Prepare the promises
    const promises = [];
    
    // Update in users collection
    const userRef = doc(db, "users", currentUser.uid);
    promises.push(
        updateDoc(userRef, {
            online: isOnline,
            lastActive: serverTimestamp()
        }).catch(error => {
            // If the update fails (e.g., document doesn't exist),
            // try to create it with setDoc instead
            console.log("Error updating user status, attempting to create document");
            return setDoc(userRef, {
                online: isOnline,
                lastActive: serverTimestamp(),
                username: userProfile?.username || "Player",
                balance: userProfile?.balance || 1000,
                stats: userProfile?.stats || {
                    totalBets: 0,
                    wins: 0,
                    losses: 0,
                    bestStreak: 0,
                    currentStreak: 0
                }
            }, { merge: true });
        })
    );
    
    // Update in presence collection for real-time tracking
    const presenceRef = doc(db, "presence", currentUser.uid);
    promises.push(
        setDoc(presenceRef, {
            userId: currentUser.uid,
            username: userProfile?.username || "Player",
            online: isOnline,
            lastActive: serverTimestamp()
        }, { merge: true })
    );
    
    // Return a promise that resolves when both updates are complete
    return Promise.all(promises);
}

// Update user balance in Firestore
export function updateUserBalance(newBalance) {
    if (!currentUser) return Promise.resolve(false);
    
    // Make sure userProfile exists
    if (!userProfile) {
        userProfile = {
            username: "Player",
            balance: 1000
        };
    }
    
    // Update in Firestore
    return updateDoc(doc(db, "users", currentUser.uid), {
        balance: newBalance
    })
    .then(() => {
        // Update local profile
        userProfile.balance = newBalance;
        
        // Update UI
        balanceDisplay.textContent = newBalance;
        
        return true;
    })
    .catch((error) => {
        console.error("Error updating balance:", error);
        
        // Try creating the document if updating failed
        return setDoc(doc(db, "users", currentUser.uid), {
            balance: newBalance,
            username: userProfile.username || "Player",
            online: true,
            lastActive: serverTimestamp(),
            stats: userProfile.stats || {
                totalBets: 0,
                wins: 0,
                losses: 0,
                bestStreak: 0,
                currentStreak: 0
            }
        }, { merge: true })
        .then(() => {
            // Update local profile
            userProfile.balance = newBalance;
            
            // Update UI
            balanceDisplay.textContent = newBalance;
            
            return true;
        })
        .catch((secondError) => {
            console.error("Error creating user document:", secondError);
            return false;
        });
    });
}

// Get current user
export function getCurrentUser() {
    console.log('getCurrentUser called, userProfile:', userProfile);
    // Make sure we're returning valid objects even if they're empty
    return { 
        currentUser, 
        userProfile: userProfile || {
            username: "Player",
            balance: 1000,
            stats: {
                totalBets: 0,
                wins: 0,
                losses: 0,
                bestStreak: 0,
                currentStreak: 0
            }
        } 
    };
}

// Initialize auth when the script is loaded
initAuth();