// Chat Module
import { db } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    onSnapshot,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// DOM Elements
let chatToggleBtn = document.getElementById('chat-toggle');
let chatPanel = document.getElementById('chat-panel');
let closeChatBtn = document.getElementById('close-chat');
let minimizeChatBtn = document.getElementById('minimize-chat');
let chatMessages = document.getElementById('chat-messages');
let chatInput = document.getElementById('chat-input');
let sendMessageBtn = document.getElementById('send-message');

// Chat state
let messagesListener = null;
let isFirstLoad = true;
let isMinimized = false;

// Initialize chat module
export function initChat() {
    console.log("Initializing chat module");
    
    // Clear any previous state
    isFirstLoad = true;
    if (messagesListener) {
        messagesListener();
        messagesListener = null;
    }
    
    // Re-get DOM elements
    chatToggleBtn = document.getElementById('chat-toggle');
    chatPanel = document.getElementById('chat-panel');
    closeChatBtn = document.getElementById('close-chat');
    minimizeChatBtn = document.getElementById('minimize-chat');
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    sendMessageBtn = document.getElementById('send-message');
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up chat messages listener
    setupChatListener();
}

// Set up event listeners
function setupEventListeners() {
    // Toggle chat visibility
    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            toggleChat();
        });
    }
    
    // Close chat
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            hideChat();
        });
    }
    
    // Minimize chat - direct DOM manipulation on click
    if (minimizeChatBtn) {
        minimizeChatBtn.addEventListener('click', () => {
            console.log("Minimize button clicked");
            
            // Toggle minimized class manually
            if (chatPanel.classList.contains('minimized')) {
                console.log("Restoring chat");
                chatPanel.classList.remove('minimized');
                isMinimized = false;
                
                // Make sure contents are visible
                if (chatMessages) chatMessages.style.display = 'flex';
                const inputContainer = document.querySelector('.chat-input-container');
                if (inputContainer) inputContainer.style.display = 'flex';
            } else {
                console.log("Minimizing chat");
                chatPanel.classList.add('minimized');
                isMinimized = true;
                
                // Hide contents explicitly
                if (chatMessages) chatMessages.style.display = 'none';
                const inputContainer = document.querySelector('.chat-input-container');
                if (inputContainer) inputContainer.style.display = 'none';
            }
        });
    }
    
    // Send message
    if (sendMessageBtn && chatInput) {
        sendMessageBtn.addEventListener('click', () => {
            sendMessage();
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// Toggle chat visibility
function toggleChat() {
    // If minimized, restore it
    if (isMinimized) {
        restoreChat();
        return;
    }
    
    // If closed, show the chat panel
    if (chatPanel.style.display === 'none') {
        showChat();
    } else {
        // Otherwise minimize it
        minimizeChat();
    }
}

// Show chat panel
function showChat() {
    chatPanel.style.display = 'flex';
    chatInput.focus();
    isMinimized = false;
    chatPanel.classList.remove('minimized');
    
    // Ensure components are visible
    if (chatMessages) chatMessages.style.display = 'flex';
    const inputContainer = document.querySelector('.chat-input-container');
    if (inputContainer) inputContainer.style.display = 'flex';
    
    // Scroll to bottom of chat
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Hide chat panel
function hideChat() {
    chatPanel.style.display = 'none';
}

// Minimize chat
function minimizeChat() {
    console.log("minimizeChat function called");
    isMinimized = true;
    chatPanel.classList.add('minimized');
    
    // Explicitly hide parts that should be hidden
    if (chatMessages) chatMessages.style.display = 'none';
    const inputContainer = document.querySelector('.chat-input-container');
    if (inputContainer) inputContainer.style.display = 'none';
    
    // Ensure the chat panel itself remains visible
    chatPanel.style.display = 'block';
}

// Restore chat from minimized state
function restoreChat() {
    console.log("restoreChat function called");
    isMinimized = false;
    chatPanel.classList.remove('minimized');
    
    // Make sure contents are visible
    if (chatMessages) chatMessages.style.display = 'flex';
    const inputContainer = document.querySelector('.chat-input-container');
    if (inputContainer) inputContainer.style.display = 'flex';
    
    // Scroll to bottom of chat
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Setup chat messages listener
function setupChatListener() {
    const { currentUser, userProfile } = getCurrentUser();
    
    console.log("Setting up chat listener, currentUser:", currentUser ? currentUser.uid : 'none');
    console.log("userProfile:", userProfile);
    
    if (!currentUser) {
        console.error("Cannot load chat: No user logged in");
        return;
    }
    
    if (!chatMessages) {
        console.error("Cannot load chat: Chat container not found");
        return;
    }
    
    // Clear any existing listener
    if (messagesListener) {
        messagesListener();
    }
    
    try {
        // Query for chat messages, ordered by timestamp
        const messagesQuery = query(
            collection(db, "chat"),
            orderBy("timestamp", "desc"),
            limit(50)
        );
        
        // Listen for real-time updates
        messagesListener = onSnapshot(messagesQuery, (snapshot) => {
            if (isFirstLoad && !snapshot.empty) {
                // Clear existing messages on first load
                chatMessages.innerHTML = '';
                
                // Process all existing messages
                const allMessages = [];
                snapshot.forEach((doc) => {
                    allMessages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                // Sort messages chronologically (oldest first)
                allMessages.sort((a, b) => {
                    return a.timestamp?.toMillis() - b.timestamp?.toMillis();
                });
                
                // Add all messages to chat
                allMessages.forEach((message) => {
                    addMessageToChat(message);
                });
                
                isFirstLoad = false;
            } else {
                // Process only new messages
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        // Check if this is a completely new message (not part of the initial load)
                        const alreadyExists = Array.from(chatMessages.children).some(
                            el => el.dataset.messageId === change.doc.id
                        );
                        
                        if (!alreadyExists) {
                            const message = {
                                id: change.doc.id,
                                ...change.doc.data()
                            };
                            addMessageToChat(message);
                            scrollToBottom();
                        }
                    }
                });
            }
        }, (error) => {
            console.error("Error setting up chat listener:", error);
            addSystemMessage("Error loading chat messages. Please try again later.");
        });
        
    } catch (error) {
        console.error("Error in setupChatListener:", error);
        addSystemMessage("Error loading chat messages. Please try again later.");
    }
}

// Send a chat message
async function sendMessage() {
    const { currentUser, userProfile } = getCurrentUser();
    
    if (!currentUser || !userProfile) {
        console.error("Cannot send message: User not logged in");
        return;
    }
    
    const messageText = chatInput.value.trim();
    
    if (!messageText) {
        return;
    }
    
    try {
        // Add message to Firestore
        await addDoc(collection(db, "chat"), {
            userId: currentUser.uid,
            username: userProfile.username || "Player",
            text: messageText,
            timestamp: serverTimestamp()
        });
        
        // Clear input
        chatInput.value = '';
        
        // Focus back on input
        chatInput.focus();
        
    } catch (error) {
        console.error("Error sending message:", error);
        addSystemMessage("Error sending message. Please try again.");
    }
}

// Add a message to the chat window
function addMessageToChat(message) {
    if (!chatMessages) return;
    
    const { currentUser, userProfile } = getCurrentUser();
    
    if (!currentUser) {
        console.error("Cannot add message: No user logged in");
        return;
    }
    
    // Make sure the message has a unique ID
    if (!message.id) {
        message.id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    // Check if message already exists to prevent duplicates
    const existingMessage = Array.from(chatMessages.children).find(
        el => el.dataset.messageId === message.id
    );
    
    if (existingMessage) {
        console.log("Message already exists, skipping", message.id);
        return; // Message already exists
    }
    
    const isCurrentUser = message.userId === currentUser.uid;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${isCurrentUser ? 'message-self' : 'message-other'}`;
    messageElement.dataset.messageId = message.id;
    
    // Format timestamp
    let formattedTime = 'Just now';
    if (message.timestamp) {
        try {
            formattedTime = new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            console.warn("Error formatting timestamp:", e);
        }
    }
    
    const username = isCurrentUser ? userProfile.username || 'You' : (message.username || 'Player');

    // Create message HTML
    messageElement.innerHTML = `
        <span class="message-username">${username}</span>
        <div class="message-text">${escapeHTML(message.text)}</div>
        <span class="message-time">${formattedTime}</span>
    `;
    
    // Add message to chat
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    scrollToBottom();
}

// Add a system message
function addSystemMessage(text) {
    if (!chatMessages) return;
    
    // Create notification element
    const notificationElement = document.createElement('div');
    notificationElement.className = 'chat-notification';
    notificationElement.textContent = text;
    
    // Add to chat
    chatMessages.appendChild(notificationElement);
    
    // Scroll to bottom
    scrollToBottom();
}

// Scroll chat to bottom
function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Helper to escape HTML in messages for security
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize chat when the script is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with a delay to ensure auth is loaded
    setTimeout(initChat, 2000);
});