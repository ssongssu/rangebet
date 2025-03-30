// Main Application Initialization Module
import { initAuth } from './auth.js';
import { initChat } from './chat.js';
import { initStats } from './stats.js';
import { initGame } from './game.js';

// Centralized initialization function
function initializeApp() {
    console.log('Initializing Manga Betting Game...');
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        try {
            // Initialize authentication first
            initAuth();
            
            // Initialize other modules with slight delays to prevent race conditions
            setTimeout(initChat, 500);
            setTimeout(initStats, 1000);
            setTimeout(initGame, 1500);
            
            // Optional: Add global error handler
            window.addEventListener('error', (event) => {
                console.error('Unhandled error:', event.error);
                // Optional: Display user-friendly error message
                const errorDisplay = document.getElementById('global-error');
                if (errorDisplay) {
                    errorDisplay.textContent = 'An unexpected error occurred. Please refresh the page.';
                    errorDisplay.style.display = 'block';
                }
            });
            
        } catch (error) {
            console.error('App initialization failed:', error);
        }
    });
}

// Run initialization
initializeApp();