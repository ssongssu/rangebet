// Stats Module
import { db } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { 
    doc, 
    updateDoc,
    setDoc,
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// DOM Elements
const historyContainer = document.getElementById('history-container');
const onlinePlayersElement = document.getElementById('online-players');
const liveBetsElement = document.getElementById('live-bets');
const leaderboardElement = document.getElementById('leaderboard');

// Initialize stats module
export function initStats() {
    setupOnlinePlayersCounter();
    setupLiveBets();
    setupLeaderboard();
}

// Update user stats in Firestore
export async function updateUserStats(stats) {
    const { currentUser, userProfile } = getCurrentUser();
    
    if (!currentUser) return;
    
    try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
            stats: stats
        });
        
        // Update local profile stats
        if (userProfile) {
            userProfile.stats = stats;
        }
    } catch (error) {
        console.error("Error updating user stats:", error);
        
        // If update fails, try to create/merge document
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await setDoc(userRef, {
                stats: stats
            }, { merge: true });
            console.log("Created/merged user stats");
            
            // Update local profile stats
            if (userProfile) {
                userProfile.stats = stats;
            }
        } catch (secondError) {
            console.error("Error creating user stats:", secondError);
        }
    }
}

// Load user betting history
export async function loadUserHistory() {
    console.log("Loading user betting history...");
    
    const { currentUser } = getCurrentUser();
    
    if (!currentUser) {
        console.error("Cannot load history: No user logged in");
        return;
    }
    
    if (!historyContainer) {
        console.error("Cannot load history: History container element not found");
        return;
    }
    
    try {
        // Show loading message
        historyContainer.innerHTML = '<h2>Your Betting History</h2><p style="text-align: center;">Loading history...</p>';
        
        console.log("Querying bets for user:", currentUser.uid);
        
        // Query user's bets, ordered by timestamp
        const betsQuery = query(
            collection(db, "bets"),
            where("userId", "==", currentUser.uid),
            orderBy("timestamp", "desc"),
            limit(10)
        );
        
        // Use try-catch for getDocs specifically
        try {
            const querySnapshot = await getDocs(betsQuery);
            
            // Clear loading message
            historyContainer.innerHTML = '<h2>Your Betting History</h2>';
            
            console.log("Query results:", querySnapshot.size, "bets found");
            
            // Check if there are any bets
            if (querySnapshot.empty) {
                const emptyMessage = document.createElement('p');
                emptyMessage.textContent = 'No betting history yet. Place your first bet!';
                emptyMessage.style.textAlign = 'center';
                emptyMessage.style.marginTop = '20px';
                emptyMessage.style.fontStyle = 'italic';
                historyContainer.appendChild(emptyMessage);
                return;
            }
            
            // Create table for history
            const table = document.createElement('table');
            table.className = 'history-table';
            
            // Create table header
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Date</th>
                    <th>Range</th>
                    <th>Result</th>
                    <th>Bet</th>
                    <th>Outcome</th>
                </tr>
            `;
            table.appendChild(thead);
            
            // Create table body
            const tbody = document.createElement('tbody');
            
            // Add each bet to the table
            querySnapshot.forEach((docSnapshot) => {
                try {
                    const bet = docSnapshot.data();
                    
                    // Skip if bet data is invalid
                    if (!bet) {
                        console.warn("Skipping invalid bet data");
                        return;
                    }
                    
                    let date = 'Just now';
                    try {
                        if (bet.timestamp && typeof bet.timestamp.toDate === 'function') {
                            date = new Date(bet.timestamp.toDate()).toLocaleString();
                        }
                    } catch (dateError) {
                        console.warn("Error formatting date:", dateError);
                    }
                    
                    const row = document.createElement('tr');
                    
                    // Add safety checks for values
                    const minValue = bet.minValue !== undefined ? Number(bet.minValue).toFixed(1) : '0.0';
                    const maxValue = bet.maxValue !== undefined ? Number(bet.maxValue).toFixed(1) : '0.0';
                    const resultNumber = bet.resultNumber !== undefined ? Number(bet.resultNumber).toFixed(1) : '0.0';
                    const betAmount = bet.betAmount !== undefined ? bet.betAmount : 0;
                    const win = !!bet.win; // Convert to boolean
                    const winAmount = bet.winAmount !== undefined ? bet.winAmount : 0;
                    
                    row.innerHTML = `
                        <td>${date}</td>
                        <td>${minValue} - ${maxValue}</td>
                        <td>${resultNumber}</td>
                        <td>${betAmount}</td>
                        <td class="${win ? 'win' : 'loss'}">
                            ${win ? '+' + winAmount : '-' + betAmount}
                        </td>
                    `;
                    
                    tbody.appendChild(row);
                } catch (rowError) {
                    console.error("Error processing bet row:", rowError);
                }
            });
            
            table.appendChild(tbody);
            historyContainer.appendChild(table);
            
        } catch (queryError) {
            console.error("Error executing query:", queryError);
            throw queryError; // Re-throw for the outer catch block
        }
        
    } catch (error) {
        console.error("Error loading betting history:", error);
        
        // Show error message to user
        historyContainer.innerHTML = '<h2>Your Betting History</h2>';
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error loading history. Please try again later.';
        errorMessage.style.color = 'var(--primary)';
        errorMessage.style.textAlign = 'center';
        errorMessage.style.margin = '20px 0';
        historyContainer.appendChild(errorMessage);
        
        // Add retry button
        const retryButton = document.createElement('button');
        retryButton.type = 'button';
        retryButton.textContent = 'Retry';
        retryButton.style.display = 'block';
        retryButton.style.margin = '10px auto';
        retryButton.style.padding = '8px 15px';
        retryButton.style.backgroundColor = 'var(--secondary)';
        retryButton.style.color = 'var(--text-inverse)';
        retryButton.style.border = '2px solid var(--text)';
        retryButton.style.borderRadius = '5px';
        retryButton.style.cursor = 'pointer';
        retryButton.onclick = loadUserHistory;
        historyContainer.appendChild(retryButton);
    }
}

// Set up online players counter
function setupOnlinePlayersCounter() {
    if (!onlinePlayersElement) return;
    
    // Query for online users
    const presenceQuery = query(
        collection(db, "presence"),
        where("online", "==", true)
    );
    
    // Listen for real-time updates
    onSnapshot(presenceQuery, (snapshot) => {
        onlinePlayersElement.textContent = snapshot.size;
    }, (error) => {
        console.error("Error setting up online players counter:", error);
        onlinePlayersElement.textContent = "N/A";
    });
}

// Set up live bets display
function setupLiveBets() {
    if (!liveBetsElement) return;
    
    // Clear current content and add title
    liveBetsElement.innerHTML = '<h3>Recent Bets</h3>';
    
    // Query for recent bets
    const liveBetsQuery = query(
        collection(db, "bets"),
        orderBy("timestamp", "desc"),
        limit(5)
    );
    
    // Listen for real-time updates
    onSnapshot(liveBetsQuery, (snapshot) => {
        // Clear current list but keep title
        const title = liveBetsElement.querySelector('h3');
        liveBetsElement.innerHTML = '';
        liveBetsElement.appendChild(title);
        
        // Check if there are any bets
        if (snapshot.empty) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No bets placed yet';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.marginTop = '20px';
            emptyMessage.style.fontStyle = 'italic';
            liveBetsElement.appendChild(emptyMessage);
            return;
        }
        
        // Create list for live bets
        const list = document.createElement('ul');
        list.style.listStyle = 'none';
        list.style.padding = '0';
        list.style.margin = '10px 0';
        
        // Add each bet to the list
        snapshot.forEach((doc) => {
            try {
                const bet = doc.data();
                let date = 'Just now';
                try {
                    if (bet.timestamp && typeof bet.timestamp.toDate === 'function') {
                        date = new Date(bet.timestamp.toDate()).toLocaleString();
                    }
                } catch (dateError) {
                    console.warn("Error formatting date:", dateError);
                }
                
                // Add safety checks for values
                const username = bet.username || 'Player';
                const minValue = bet.minValue !== undefined ? Number(bet.minValue).toFixed(1) : '0.0';
                const maxValue = bet.maxValue !== undefined ? Number(bet.maxValue).toFixed(1) : '0.0';
                const resultNumber = bet.resultNumber !== undefined ? Number(bet.resultNumber).toFixed(1) : '0.0';
                const betAmount = bet.betAmount !== undefined ? bet.betAmount : 0;
                const win = !!bet.win; // Convert to boolean
                const winAmount = bet.winAmount !== undefined ? bet.winAmount : 0;
                
                const item = document.createElement('li');
                item.style.padding = '8px';
                item.style.margin = '5px 0';
                item.style.borderRadius = '5px';
                item.style.backgroundColor = 'var(--text-inverse)';
                item.style.border = '2px solid var(--text)';
                
                item.innerHTML = `
                    <div style="font-weight: bold;">${username}</div>
                    <div>Range: ${minValue}-${maxValue}</div>
                    <div>Bet: ${betAmount} | Result: ${resultNumber}</div>
                    <div class="${win ? 'win' : 'loss'}" style="font-weight: bold;">
                        ${win ? 'WON +' + winAmount : 'LOST -' + betAmount}
                    </div>
                    <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">${date}</div>
                `;
                
                list.appendChild(item);
            } catch (err) {
                console.error("Error rendering bet item:", err);
            }
        });
        
        liveBetsElement.appendChild(list);
    }, (error) => {
        console.error("Error setting up live bets:", error);
        
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error loading live bets';
        errorMessage.style.color = 'var(--primary)';
        liveBetsElement.appendChild(errorMessage);
    });
}

// Set up leaderboard display
function setupLeaderboard() {
    if (!leaderboardElement) return;
    
    // Clear current content and add title
    leaderboardElement.innerHTML = '<h3>Top Players</h3>';
    
    // Query for top players by balance
    const leaderboardQuery = query(
        collection(db, "users"),
        orderBy("balance", "desc"),
        limit(5)
    );
    
    // Listen for real-time updates
    onSnapshot(leaderboardQuery, (snapshot) => {
        // Clear current list but keep title
        const title = leaderboardElement.querySelector('h3');
        leaderboardElement.innerHTML = '';
        leaderboardElement.appendChild(title);
        
        // Check if there are any users
        if (snapshot.empty) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No players yet';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.marginTop = '20px';
            emptyMessage.style.fontStyle = 'italic';
            leaderboardElement.appendChild(emptyMessage);
            return;
        }
        
        // Create list for leaderboard
        const list = document.createElement('ol');
        list.style.paddingLeft = '25px';
        list.style.margin = '10px 0';
        
        // Add each user to the list
        let rank = 1;
        snapshot.forEach((doc) => {
            try {
                const user = doc.data();
                const stats = user.stats || {};
                
                // Safely get values with defaults
                const username = user.username || 'Player';
                const balance = typeof user.balance === 'number' ? user.balance : 1000;
                const wins = typeof stats.wins === 'number' ? stats.wins : 0;
                const totalBets = typeof stats.totalBets === 'number' ? stats.totalBets : 0;
                
                // Calculate win rate
                const winRate = totalBets ? 
                    ((wins / totalBets) * 100).toFixed(1) + '%' : '0.0%';
                
                // Calculate winnings (balance - starting balance)
                const winnings = balance - 1000;
                
                const item = document.createElement('li');
                item.style.margin = '8px 0';
                item.style.paddingBottom = '8px';
                item.style.borderBottom = '1px dashed var(--text)';
                
                // Add special class for top 3
                if (rank <= 3) {
                    item.style.fontWeight = 'bold';
                    
                    if (rank === 1) {
                        item.style.color = 'gold';
                    } else if (rank === 2) {
                        item.style.color = 'silver';
                    } else if (rank === 3) {
                        item.style.color = '#CD7F32'; // bronze
                    }
                }
                
                item.innerHTML = `
                    <div style="font-weight: bold;">${username}</div>
                    <div>Balance: ${balance}</div>
                    <div>Winnings: ${winnings > 0 ? '+' + winnings : winnings}</div>
                    <div>Win Rate: ${winRate}</div>
                `;
                
                list.appendChild(item);
                rank++;
            } catch (err) {
                console.error("Error rendering leaderboard item:", err);
            }
        });
        
        leaderboardElement.appendChild(list);
    }, (error) => {
        console.error("Error setting up leaderboard:", error);
        
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error loading leaderboard';
        errorMessage.style.color = 'var(--primary)';
        leaderboardElement.appendChild(errorMessage);
    });
}

// Initialize the stats module
initStats();