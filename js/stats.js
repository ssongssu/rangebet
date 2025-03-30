// Stats and History Module
import { db } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs,
    doc,
    updateDoc,
    onSnapshot,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// DOM Elements
let historyContainer = null;
let onlinePlayersElement = null;
let liveBetsElement = null;
let leaderboardElement = null;

// Initialize stats and history
export function initStats() {
    console.log('Initializing stats module');
    
    // Get DOM elements - ensure they exist
    historyContainer = document.getElementById('history-container');
    onlinePlayersElement = document.getElementById('online-players');
    liveBetsElement = document.getElementById('live-bets');
    leaderboardElement = document.getElementById('leaderboard');
    
    // Validate containers
    if (!historyContainer) {
        console.error('History container not found');
    }
    
    // Load user history and stats
    loadUserHistory();
    loadOnlinePlayers();
    loadRecentBets();
    loadLeaderboard();
}

// Load user betting history
export async function loadUserHistory() {
    console.log('Loading user history');
    
    // Make sure history container exists
    historyContainer = document.getElementById('history-container');
    if (!historyContainer) {
        console.error('History container not found');
        return;
    }
    
    const { currentUser } = getCurrentUser();
    
    if (!currentUser) {
        console.error('No user logged in');
        displayNoHistoryMessage();
        return;
    }
    
    try {
        // Show loading message
        historyContainer.innerHTML = '<h2>Your Betting History</h2><p>Loading your betting history...</p>';
        
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
        
        // Create table structure
        let tableHTML = `
            <h2>Your Betting History</h2>
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Bet Range</th>
                        <th>Bet Amount</th>
                        <th>Result</th>
                        <th>Outcome</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Process history items
        historySnapshot.docs.forEach(doc => {
            const bet = doc.data();
            const resultClass = bet.win ? 'win' : 'loss';
            const resultText = bet.win ? 'WIN' : 'LOSS';
            const outcomePrefix = bet.win ? '+' : '-';
            const outcomeAmount = bet.win ? bet.winAmount : bet.betAmount;
            
            tableHTML += `
                <tr>
                    <td>${formatDate(bet.timestamp.toDate())}</td>
                    <td>${bet.minValue}-${bet.maxValue}</td>
                    <td>${bet.betAmount}</td>
                    <td>${bet.resultNumber} <span class="${resultClass}">(${resultText})</span></td>
                    <td class="${resultClass}">${outcomePrefix}${outcomeAmount}</td>
                </tr>
            `;
        });
        
        // Close table
        tableHTML += `
                </tbody>
            </table>
        `;
        
        // Set content
        historyContainer.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('Error loading betting history:', error);
        displayErrorMessage('Failed to load betting history: ' + error.message);
    }
}

// Load online players
async function loadOnlinePlayers() {
    console.log('Loading online players');
    
    if (!onlinePlayersElement) {
        onlinePlayersElement = document.getElementById('online-players');
        if (!onlinePlayersElement) {
            console.error('Online players element not found');
            return;
        }
    }
    
    try {
        // Query for online users
        const presenceQuery = query(
            collection(db, "presence"),
            where("online", "==", true)
        );
        
        onSnapshot(presenceQuery, (snapshot) => {
            // Count online users
            const onlineCount = snapshot.size;
            
            // Update display
            onlinePlayersElement.textContent = onlineCount;
        });
        
    } catch (error) {
        console.error('Error loading online players:', error);
        onlinePlayersElement.textContent = 'N/A';
    }
}

// Load recent bets
async function loadRecentBets() {
    console.log('Loading recent bets');
    
    if (!liveBetsElement) {
        liveBetsElement = document.getElementById('live-bets');
        if (!liveBetsElement) {
            console.error('Live bets element not found');
            return;
        }
    }
    
    try {
        // Query for recent bets
        const recentBetsQuery = query(
            collection(db, "bets"),
            orderBy("timestamp", "desc"),
            limit(5)  // Limit to 5 most recent bets
        );
        
        onSnapshot(recentBetsQuery, (snapshot) => {
            // Create HTML for recent bets
            let betsHTML = `<h3>Recent Bets</h3><ul class="recent-bets-list">`;
            
            snapshot.forEach(doc => {
                const bet = doc.data();
                const resultClass = bet.win ? 'win' : 'loss';
                const resultText = bet.win ? 'WIN' : 'LOSS';
                
                betsHTML += `
                    <li>
                        <span class="bet-username">${bet.username || 'Player'}</span>
                        <span class="bet-amount">${bet.betAmount}</span>
                        <span class="bet-result ${resultClass}">${resultText}</span>
                    </li>
                `;
            });
            
            betsHTML += `</ul>`;
            
            // Update element
            liveBetsElement.innerHTML = betsHTML;
        });
        
    } catch (error) {
        console.error('Error loading recent bets:', error);
        liveBetsElement.innerHTML = '<h3>Recent Bets</h3><p>Unable to load recent bets.</p>';
    }
}

// Load leaderboard
async function loadLeaderboard() {
    console.log('Loading leaderboard');
    
    if (!leaderboardElement) {
        leaderboardElement = document.getElementById('leaderboard');
        if (!leaderboardElement) {
            console.error('Leaderboard element not found');
            return;
        }
    }
    
    try {
        // Simple placeholder for now
        leaderboardElement.innerHTML = `
            <h3>Top Players</h3>
            <p>Leaderboard coming soon!</p>
        `;
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardElement.innerHTML = '<h3>Top Players</h3><p>Unable to load leaderboard.</p>';
    }
}

// Update user stats in Firestore
export async function updateUserStats(stats) {
    console.log('Updating user stats:', stats);
    
    const { currentUser } = getCurrentUser();
    
    if (!currentUser) {
        console.error('Cannot update stats: No user logged in');
        return false;
    }
    
    try {
        // Update stats in Firestore
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { stats: stats });
        
        return true;
    } catch (error) {
        console.error('Error updating user stats:', error);
        return false;
    }
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
            <h2>Your Betting History</h2>
            <p>No betting history found. Place some bets to see your history!</p>
        `;
    }
}

function displayErrorMessage(message) {
    if (historyContainer) {
        historyContainer.innerHTML = `
            <h2>Error</h2>
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

// Make functions available globally for the tab-fix.js script
window.loadUserHistory = loadUserHistory;
window.initStats = initStats;
window.updateUserStats = updateUserStats;

export {};
