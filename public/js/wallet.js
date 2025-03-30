// Wallet Integration Module for Phantom
import { db } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { 
    doc, 
    setDoc, 
    updateDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// DOM Elements
let connectWalletBtn = null;
let walletAddressDisplay = null;

// Wallet State
let walletAddress = null;
let isConnected = false;

// Initialize wallet module
export function initWallet() {
    console.log("Initializing wallet module");
    
    // Get DOM elements
    connectWalletBtn = document.getElementById('chat-toggle');
    
    // Add wallet address display element to the UI
    setupWalletDisplay();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check if wallet is already connected
    checkWalletConnection();
}

// Set up wallet address display
function setupWalletDisplay() {
    // Only set up if it doesn't exist yet
    if (!document.getElementById('wallet-info')) {
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            const walletInfo = document.createElement('div');
            walletInfo.id = 'wallet-info';
            walletInfo.className = 'wallet-info';
            walletInfo.style.marginTop = '5px';
            walletInfo.style.display = 'none';
            walletInfo.innerHTML = `
                <div class="wallet-address">
                    Wallet: <span id="wallet-address-display">Not connected</span>
                </div>
            `;
            userInfo.appendChild(walletInfo);
            
            // Get reference to the wallet address display
            walletAddressDisplay = document.getElementById('wallet-address-display');
        }
    } else {
        walletAddressDisplay = document.getElementById('wallet-address-display');
    }
}

// Set up event listeners
function setupEventListeners() {
    if (connectWalletBtn) {
        // Remove any existing click listeners
        const newButton = connectWalletBtn.cloneNode(true);
        connectWalletBtn.parentNode.replaceChild(newButton, connectWalletBtn);
        connectWalletBtn = newButton;
        
        // Add wallet connection click handler
        connectWalletBtn.addEventListener('click', () => {
            connectWallet();
        });
    }
}

// Check if Phantom wallet is installed
function isPhantomInstalled() {
    return window.phantom && window.phantom.solana && window.phantom.solana.isPhantom;
}

// Check if wallet is already connected
async function checkWalletConnection() {
    if (!isPhantomInstalled()) {
        updateButtonText('INSTALL PHANTOM');
        return;
    }
    
    try {
        // Try to retrieve the connected wallet address
        const { currentUser } = getCurrentUser();
        
        if (currentUser && currentUser.uid) {
            // Check if there's a connected wallet in Firebase
            const userProfile = await doc(db, "users", currentUser.uid);
            if (userProfile && userProfile.walletAddress) {
                walletAddress = userProfile.walletAddress;
                isConnected = true;
                updateWalletDisplay();
                updateButtonText('WALLET CONNECTED');
            }
        }
    } catch (error) {
        console.error("Error checking wallet connection:", error);
    }
}

// Connect to Phantom wallet
async function connectWallet() {
    console.log("Connect wallet button clicked");
    
    // Check if Phantom is installed
    if (!isPhantomInstalled()) {
        // Phantom wallet is not installed, redirect to install page
        window.open('https://phantom.app/', '_blank');
        return;
    }
    
    // If already connected, do nothing or show disconnection option
    if (isConnected && walletAddress) {
        // Could add a menu here to show balance or disconnect
        alert('Wallet already connected: ' + walletAddress);
        return;
    }
    
    try {
        // Request connection to the wallet
        updateButtonText('CONNECTING...');
        const provider = window.phantom.solana;
        
        // Connect to wallet
        const { publicKey } = await provider.connect();
        
        // Successfully connected
        walletAddress = publicKey.toString();
        isConnected = true;
        
        // Update UI
        updateWalletDisplay();
        updateButtonText('WALLET CONNECTED');
        
        // Store wallet address in Firebase if user is logged in
        const { currentUser } = getCurrentUser();
        if (currentUser && currentUser.uid) {
            await updateDoc(doc(db, "users", currentUser.uid), {
                walletAddress: walletAddress,
                walletConnectedAt: serverTimestamp()
            });
        }
        
        console.log("Wallet connected:", walletAddress);
    } catch (error) {
        console.error("Error connecting to wallet:", error);
        updateButtonText('CONNECT WALLET');
        
        // Handle specific error cases
        if (error.code === 4001) {
            // User rejected the connection request
            console.log("User rejected the connection request");
        }
    }
}

// Update wallet address display
function updateWalletDisplay() {
    const walletInfo = document.getElementById('wallet-info');
    
    if (walletInfo && walletAddressDisplay) {
        if (isConnected && walletAddress) {
            // Show wallet info with truncated address for privacy
            walletInfo.style.display = 'block';
            const truncatedAddress = truncateAddress(walletAddress);
            walletAddressDisplay.textContent = truncatedAddress;
        } else {
            // Hide wallet info if not connected
            walletInfo.style.display = 'none';
            walletAddressDisplay.textContent = 'Not connected';
        }
    }
}

// Update connect button text
function updateButtonText(text) {
    if (connectWalletBtn) {
        connectWalletBtn.textContent = text;
    }
}

// Helper function to truncate wallet address for display
function truncateAddress(address) {
    if (!address) return 'Not connected';
    const start = address.substring(0, 4);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
}

// Initialize wallet when the script is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with a delay to ensure auth is loaded
    setTimeout(initWallet, 2500);
});

// Export functions for potential use in other modules
export { connectWallet, isConnected, walletAddress };
