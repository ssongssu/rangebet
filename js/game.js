// Game Module
import { db } from './firebase-config.js';
import { getCurrentUser, updateUserBalance } from './auth.js';
import { 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// These variables will be properly initialized in initGame
let minHandle;
let maxHandle;
let selectedRange;
let minValueEl;
let maxValueEl;
let rangeWidthEl;
let winProbabilityEl;
let payoutMultiplierEl;
let potentialWinEl;
let betAmountInput;
let betButton;
let sliderContainer;
let resultMarker;
let resultValue;
let resultAmount;
let resultDisplay;

// Constants
const MIN = 0;
const MAX = 100;
const DECIMAL_PLACES = 1;
const PRECISION_FACTOR = Math.pow(10, DECIMAL_PLACES);

// Game state
let minValue = 25.0;
let maxValue = 75.0;
let betAmount = 100;
let isDraggingMin = false;
let isDraggingMax = false;
let userBalance = 1000; // Default, will be updated from user profile

// Initialize game module
export function initGame(balance) {
    console.log("Initializing game module...");
    
    // Make sure balance is a valid number
    userBalance = (typeof balance === 'number' && !isNaN(balance)) ? balance : 1000;
    console.log("Game initialized with balance:", userBalance);
    
    // Initialize DOM elements
    minHandle = document.getElementById('min-handle');
    maxHandle = document.getElementById('max-handle');
    selectedRange = document.getElementById('selected-range');
    minValueEl = document.getElementById('min-value');
    maxValueEl = document.getElementById('max-value');
    rangeWidthEl = document.getElementById('range-width');
    winProbabilityEl = document.getElementById('win-probability');
    payoutMultiplierEl = document.getElementById('payout-multiplier');
    potentialWinEl = document.getElementById('potential-win');
    betAmountInput = document.getElementById('bet-amount');
    betButton = document.getElementById('bet-button');
    sliderContainer = document.querySelector('.slider-container');
    resultMarker = document.getElementById('result-marker');
    resultValue = document.getElementById('result-value');
    resultAmount = document.getElementById('result-amount');
    resultDisplay = document.getElementById('result-display');
    
    console.log("DOM elements initialized, minHandle:", minHandle ? "found" : "not found");
    console.log("maxHandle:", maxHandle ? "found" : "not found");
    
    // Set initial values
    minValue = 25.0;
    maxValue = 75.0;
    
    // Function to initialize UI when elements are ready
    const initializeUI = () => {
        console.log("Checking DOM elements...");
        
        if (minHandle && maxHandle && selectedRange) {
            console.log("DOM elements found, updating UI");
            // Update UI
            updateHandlePositions();
            updateUI();
            
            // Set up event listeners
            setupEventListeners();
            
            console.log("Game initialization complete");
        } else {
            console.error("Required DOM elements not found, retrying in 500ms");
            
            // Re-initialize DOM elements
            minHandle = document.getElementById('min-handle');
            maxHandle = document.getElementById('max-handle');
            selectedRange = document.getElementById('selected-range');
            sliderContainer = document.querySelector('.slider-container');
            
            setTimeout(initializeUI, 500);
        }
    };
    
    // Start initialization process
    initializeUI();
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Check if elements exist before adding event listeners
    if (!minHandle) console.error('minHandle is null or undefined');
    if (!maxHandle) console.error('maxHandle is null or undefined');
    if (!sliderContainer) console.error('sliderContainer is null or undefined');
    if (!betAmountInput) console.error('betAmountInput is null or undefined');
    if (!betButton) console.error('betButton is null or undefined');
    
    if (!minHandle || !maxHandle || !sliderContainer || !betAmountInput || !betButton) {
        console.error("Required DOM elements for event listeners not found");
        // Try again in 500ms
        setTimeout(setupEventListeners, 500);
        return;
    }
    
    console.log('All elements found, attaching event listeners');
    
    // Handle dragging for min handle
    minHandle.addEventListener('mousedown', function(e) {
        console.log('Min handle mousedown');
        isDraggingMin = true;
        e.preventDefault();
    });
    
    // Handle dragging for max handle
    maxHandle.addEventListener('mousedown', function(e) {
        console.log('Max handle mousedown');
        isDraggingMax = true;
        e.preventDefault();
    });
    
    // Handle drag movement
    document.addEventListener('mousemove', handleDrag);
    
    // Handle drag end
    document.addEventListener('mouseup', function() {
        if (isDraggingMin || isDraggingMax) {
            console.log('Drag end');
        }
        isDraggingMin = false;
        isDraggingMax = false;
    });
    
    // Touch events for mobile
    minHandle.addEventListener('touchstart', function(e) {
        console.log('Min handle touchstart');
        isDraggingMin = true;
        e.preventDefault();
    });
    
    maxHandle.addEventListener('touchstart', function(e) {
        console.log('Max handle touchstart');
        isDraggingMax = true;
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 0) {
            handleDrag(e);
        }
    });
    
    document.addEventListener('touchend', function() {
        isDraggingMin = false;
        isDraggingMax = false;
    });
    
    // Also add direct click handlers for the slider container
    sliderContainer.addEventListener('click', function(e) {
        console.log('Slider container clicked');
        // Determine if we should move min or max handle based on where the click is
        const rect = sliderContainer.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const clickValue = Math.round(clickPosition * MAX * PRECISION_FACTOR) / PRECISION_FACTOR;
        
        // Move the handle that's closest to the click
        const distToMin = Math.abs(clickValue - minValue);
        const distToMax = Math.abs(clickValue - maxValue);
        
        if (distToMin <= distToMax) {
            minValue = Math.min(clickValue, maxValue - 5.0);
        } else {
            maxValue = Math.max(clickValue, minValue + 5.0);
        }
        
        updateHandlePositions();
        updateUI();
    });
    
    // Bet amount input change
    betAmountInput.addEventListener('input', function() {
        console.log('Bet amount changed:', this.value);
        betAmount = parseInt(this.value) || 0;
        updateUI();
    });
    
    // Multiplier buttons
    const multiplierButtons = document.querySelectorAll('.multiplier-btn');
    console.log('Found multiplier buttons:', multiplierButtons.length);
    
    multiplierButtons.forEach(btn => {
        const multiplier = parseFloat(btn.getAttribute('data-multiplier'));
        console.log('Setting up multiplier button:', multiplier);
        
        btn.addEventListener('click', function(e) {
            console.log('Multiplier button clicked:', multiplier);
            const currentBet = parseInt(betAmountInput.value) || 0;
            
            // Apply multiplier and round to whole number
            let newBet = Math.floor(currentBet * multiplier);
            
            // Ensure minimum bet of 1
            newBet = Math.max(1, newBet);
            
            console.log('New bet amount:', newBet);
            
            // Update input and trigger update
            betAmountInput.value = newBet;
            betAmount = newBet;
            updateUI();
            
            // Stop event propagation
            e.stopPropagation();
        });
    });
    
    // Bet button
    betButton.addEventListener('click', placeBet);
    
    console.log('All event listeners attached successfully');
}

// Update handle positions based on values
function updateHandlePositions() {
    if (!minHandle || !maxHandle || !selectedRange) {
        console.error("Required DOM elements for updateHandlePositions not found");
        return;
    }
    
    const minPercent = (minValue / MAX) * 100;
    const maxPercent = (maxValue / MAX) * 100;
    
    minHandle.style.left = `${minPercent}%`;
    maxHandle.style.left = `${maxPercent}%`;
    selectedRange.style.left = `${minPercent}%`;
    selectedRange.style.right = `${100 - maxPercent}%`;
}

// Handle drag movement
function handleDrag(e) {
    if (!isDraggingMin && !isDraggingMax) return;
    if (!sliderContainer) {
        console.error("Slider container element not found");
        return;
    }
    
    const rect = sliderContainer.getBoundingClientRect();
    // Handle both mouse and touch events
    let clientX;
    
    if (e.touches && e.touches.length > 0) {
        // Touch event
        clientX = e.touches[0].clientX;
    } else {
        // Mouse event
        clientX = e.clientX;
    }
    
    if (!clientX) {
        console.error("Could not determine clientX from event", e);
        return;
    }
    
    console.log('Drag event:', clientX - rect.left, 'container width:', rect.width);
    
    let position = (clientX - rect.left) / rect.width;
    position = Math.max(0, Math.min(1, position));
    
    // Calculate value with one decimal place
    const rawValue = position * MAX;
    const value = Math.round(rawValue * PRECISION_FACTOR) / PRECISION_FACTOR;
    console.log('Position:', position, 'Value:', value);
    
    if (isDraggingMin) {
        minValue = Math.min(value, maxValue - 5.0);
        console.log('Updated minValue:', minValue);
    } else {
        maxValue = Math.max(value, minValue + 5.0);
        console.log('Updated maxValue:', maxValue);
    }
    
    updateHandlePositions();
    updateUI();
}

// Update UI display
function updateUI() {
    // Check if all elements exist
    if (!minValueEl || !maxValueEl || !rangeWidthEl || !winProbabilityEl || 
        !payoutMultiplierEl || !potentialWinEl) {
        console.error("Required DOM elements for updateUI not found");
        return;
    }
    
    // Update display values with fixed decimal places
    minValueEl.textContent = minValue.toFixed(DECIMAL_PLACES);
    maxValueEl.textContent = maxValue.toFixed(DECIMAL_PLACES);
    
    // Calculate statistics
    const rangeWidth = (maxValue - minValue).toFixed(DECIMAL_PLACES);
    const winProbability = ((maxValue - minValue) / MAX * 100).toFixed(1);
    const payoutMultiplier = (100 / parseFloat(winProbability)).toFixed(2);
    
    // Make sure betAmount is a valid number
    const validBetAmount = typeof betAmount === 'number' && !isNaN(betAmount) ? betAmount : 0;
    const potentialWin = Math.floor(validBetAmount * parseFloat(payoutMultiplier));
    
    // Update statistics display
    rangeWidthEl.textContent = rangeWidth;
    winProbabilityEl.textContent = winProbability;
    payoutMultiplierEl.textContent = payoutMultiplier;
    potentialWinEl.textContent = potentialWin;
}

// Place a bet
async function placeBet() {
    // Get current user
    const { currentUser, userProfile } = getCurrentUser();
    
    if (!currentUser) {
        alert('Please log in to place a bet');
        return;
    }
    
    if (!betButton || !resultMarker || !resultValue || !resultAmount) {
        console.error("Required DOM elements for placeBet not found");
        return;
    }
    
    if (betAmount <= 0) {
        alert('Please enter a valid bet amount');
        return;
    }
    
    if (betAmount > userBalance) {
        alert('Insufficient balance');
        return;
    }
    
    // Disable bet button to prevent double clicks
    betButton.disabled = true;
    
    try {
        // Generate random number with one decimal place
        const resultNumber = Math.round(Math.random() * MAX * PRECISION_FACTOR) / PRECISION_FACTOR;
        const win = resultNumber >= minValue && resultNumber <= maxValue;
        
        // Calculate payout based on range
        const winProbability = (maxValue - minValue) / MAX * 100;
        const payoutMultiplier = 100 / winProbability;
        const winningAmount = Math.floor(betAmount * payoutMultiplier);
        
        // Update balance based on result
        let newBalance = userBalance;
        if (win) {
            newBalance += winningAmount - betAmount; // Add winnings minus the bet amount
        } else {
            newBalance -= betAmount; // Subtract the bet amount
        }
        
        // Show result marker
        const resultPercent = (resultNumber / MAX) * 100;
        resultMarker.style.left = `${resultPercent}%`;
        resultValue.textContent = resultNumber.toFixed(DECIMAL_PLACES);
        resultMarker.style.display = 'block';
        
        // Make sure result display is visible
        if (resultDisplay) {
            resultDisplay.style.display = 'block';
        }
        
        // Update result display
        if (win) {
            resultValue.style.backgroundColor = '#00CC00';
            resultAmount.textContent = `+${winningAmount - betAmount}`; // Show net gain
            resultAmount.style.color = '#00CC00';
        } else {
            resultValue.style.backgroundColor = '#FF3D57';
            resultAmount.textContent = `-${betAmount}`;
            resultAmount.style.color = '#FF3D57';
        }
        
        // Update user stats in Firestore
        await updateStats(win);
        
        // Add bet to history
        await addBetToHistory(resultNumber, win, winningAmount - betAmount);
        
        // Update user balance in Firestore and local state
        await updateUserBalance(newBalance);
        userBalance = newBalance;
        
        // Re-enable bet button after a short delay
        setTimeout(() => {
            betButton.disabled = false;
        }, 1000);
        
    } catch (error) {
        console.error("Error placing bet:", error);
        alert('Error processing bet');
        betButton.disabled = false;
    }
}

// Update user stats
async function updateStats(win) {
    const { currentUser, userProfile } = getCurrentUser();
    
    if (!currentUser || !userProfile) return;
    
    try {
        // Get current stats with defaults if not present
        const stats = userProfile.stats || {
            totalBets: 0,
            wins: 0,
            losses: 0,
            bestStreak: 0,
            currentStreak: 0
        };
        
        // Update stats
        stats.totalBets = (stats.totalBets || 0) + 1;
        if (win) {
            stats.wins = (stats.wins || 0) + 1;
            stats.currentStreak = (stats.currentStreak || 0) + 1;
            stats.bestStreak = Math.max(stats.bestStreak || 0, stats.currentStreak);
        } else {
            stats.losses = (stats.losses || 0) + 1;
            stats.currentStreak = 0;
        }
        
        // Update in Firestore - handled by the stats module
        import('./stats.js').then(module => {
            if (module.updateUserStats) {
                module.updateUserStats(stats);
            }
        }).catch(error => {
            console.error("Error importing stats module:", error);
        });
        
    } catch (error) {
        console.error("Error updating stats:", error);
    }
}

// Add bet to history
async function addBetToHistory(resultNumber, win, winAmount) {
    const { currentUser, userProfile } = getCurrentUser();
    
    if (!currentUser || !userProfile) return;
    
    try {
        await addDoc(collection(db, "bets"), {
            userId: currentUser.uid,
            username: userProfile.username || "Player",
            minValue: minValue,
            maxValue: maxValue,
            betAmount: betAmount,
            resultNumber: resultNumber,
            win: win,
            winAmount: winAmount,
            timestamp: serverTimestamp()
        });
        
        // Refresh history display if available
        import('./stats.js').then(module => {
            if (module.loadUserHistory) {
                module.loadUserHistory();
            }
        }).catch(error => {
            console.error("Error importing stats module:", error);
        });
        
    } catch (error) {
        console.error("Error adding bet to history:", error);
    }
}