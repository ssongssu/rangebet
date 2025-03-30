// Stats and History Module
import { db } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// DOM Elements
let historyContainer = null;
let statsContainer = null;

// Initialize stats and history
export function initStats() {
    console.log('Initializing stats module');
    
    // Get DOM elements - ensure they exist
    historyContainer = document.getElementById('history-container');
    
    // Validate containers
    if (!historyContainer) {
        console.error('History container not found');
        return;
    }
    
    // Load user history and stats
    loadUserHistory();
    loadLeaderboard();
    loadRecentBets();
    loadOnlinePlayers();
}

// Load user betting history
export async function loadUserHistory() {
    console.log('Loading user history');
    
    const { currentUser } = getCurrentUser();
    
    if (!currentUser) {
        console.error('No user logged in');
        displayNoHistoryMessage();
        return;
    }
    
    try {
        // Query for user's betting history, ordered by timestamp
        const historyQuery = query(
            collection(db, "bets"),
            where("userId", "==", currentUser.uid),
            orderBy("timestamp", "desc"),
            limit(20)  // Limit to last 20 bets
        );
        
        const historySnapshot = await getDocs(historyQuery);
        
        if (historySnapshot.empty) {
            displayNoHistoryMessage();
            return;
        }
        
        // Process and display history
        const historyHTML = historySnapshot.docs.map(doc => {
            const bet = doc.data();
            return `
                <div class="history-item">
                    <span class="bet-date">${formatDate(bet.timestamp.toDate())}</span>
                    <span class="bet-amount">Bet: ${bet.amount}</span>
                    <span class="bet-result ${bet.result}">${bet.result.toUpperCase()}</span>
                    <span class="bet-payout">Payout: ${bet.payout || 0}</span>
                </div>
            `;
        }).join('');
        
        historyContainer.innerHTML = `
            <h3>Betting History</h3>
            ${historyHTML}
        `;
    } catch (error) {
        console.error('Error loading betting history:', error);
        displayErrorMessage('Failed to load betting history');
    }
}

// Load leaderboard
async function loadLeaderboard() {
    console.log('Loading leaderboard');
    // Implementation will go here
}

// Load recent bets
async function loadRecentBets() {
    console.log('Loading recent bets');
    // Implementation will go here
}

// Load online players
async function loadOnlinePlayers() {
    console.log('Loading online players');
    // Implementation will go here
}

// Utility Functions
function formatDate(date) {
    return date.toLocaleString('en-US', {
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

function displayNoHistoryMessage() {
    if (historyContainer) {
        historyContainer.innerHTML = `
            <h3>Betting History</h3>
            <p>No betting history found. Place some bets to see your history!</p>
        `;
    }
}

function displayErrorMessage(message) {
    if (historyContainer) {
        historyContainer.innerHTML = `
            <h3>Error</h3>
            <p>${message}</p>
        `;
    }
}

// Initialize stats when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth to be fully initialized
    setTimeout(initStats, 2000);
    
    // Add event listener for Load History button
    const loadHistoryBtn = document.getElementById('load-history-btn');
    if (loadHistoryBtn) {
        loadHistoryBtn.addEventListener('click', () => {
            console.log('Load History button clicked');
            loadUserHistory();
        });
    }
});

export {};
