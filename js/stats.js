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
    statsContainer = document.getElementById('stats-container');
    
    // Validate containers
    if (!historyContainer || !statsContainer) {
        console.error('History or stats containers not found');
        return;
    }
    
    // Clear previous content
    historyContainer.innerHTML = '';
    statsContainer.innerHTML = '';
    
    // Load user history and stats
    loadUserHistory();
    loadUserStats();
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
                    <span class="bet-amount">Bet: $${bet.amount}</span>
                    <span class="bet-result ${bet.result}">${bet.result.toUpperCase()}</span>
                    <span class="bet-payout">Payout: $${bet.payout || 0}</span>
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

// Load user stats
export async function loadUserStats() {
    console.log('Loading user stats');
    
    const { userProfile } = getCurrentUser();
    
    if (!userProfile || !userProfile.stats) {
        console.error('No user stats found');
        displayNoStatsMessage();
        return;
    }
    
    const { stats } = userProfile;
    
    // Calculate win percentage
    const totalBets = stats.totalBets || 0;
    const winPercentage = totalBets > 0 
        ? ((stats.wins || 0) / totalBets * 100).toFixed(2) 
        : '0.00';
    
    const statsHTML = `
        <h3>Your Stats</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">Total Bets</span>
                <span class="stat-value">${stats.totalBets || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Wins</span>
                <span class="stat-value">${stats.wins || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Losses</span>
                <span class="stat-value">${stats.losses || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Win %</span>
                <span class="stat-value">${winPercentage}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Streak</span>
                <span class="stat-value">${stats.bestStreak || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Current Streak</span>
                <span class="stat-value">${stats.currentStreak || 0}</span>
            </div>
        </div>
    `;
    
    statsContainer.innerHTML = statsHTML;
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

function displayNoStatsMessage() {
    if (statsContainer) {
        statsContainer.innerHTML = `
            <h3>Your Stats</h3>
            <p>No stats available. Start playing to track your performance!</p>
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

// Ensure these are exported at the top of the file
export { 
    initStats, 
    loadUserHistory 
};
