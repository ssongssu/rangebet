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
    
    // Update the chat button text if needed
    if (chatToggleBtn) {
        // Make sure button is green
        chatToggleBtn.style.backgroundColor = '#00CC00';
        chatToggleBtn.style.color = 'white';
    }
    
    // Remove the chat bubble icon from the chat header
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
        chatBox.style.setProperty('--before-content', 'none', 'important');
    }
    
    // Make sure chat messages area has no grey background
    if (chatMessages) {
        chatMessages.style.backgroundImage = 'none';
        chatMessages.style.backgroundColor = 'white';
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up chat messages listener
    setupChatListener();
}

// Set up event listeners
function setupEventListeners() {
    // We no longer use chat toggle button for chat - it's now for wallet connection
    // Chat is always visible
    
    // Make chat always visible by default
    if (chatPanel) {
        showChat();
    }
=======
    
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
                isFirstLoad = false;
            }
            
            // Process new messages
            const newMessages = [];
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    newMessages.push({
                        id: change.doc.id,
                        ...change.doc.data()
                    });
                }
            });
            
            // Sort messages chronologically (oldest first)
            newMessages.sort((a, b) => {
                return a.timestamp?.toMillis() - b.timestamp?.toMillis();
            });
            
            // Add new messages to chat
            newMessages.forEach((message) => {
                addMessageToChat(message);
            });
            
            // Scroll to bottom of chat if new messages were added
            if (newMessages.length > 0) {
                scrollToBottom();
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
    
    const { currentUser } = getCurrentUser();
    
    if (!currentUser) {
        console.error("Cannot add message: No user logged in");
        return;
    }
    
    // Check if message already exists to prevent duplicates
    const existingMessage = Array.from(chatMessages.children).find(
        el => {
            return el.dataset.messageId === message.id ||
                   (el.querySelector('.message-text').textContent === message.text && 
                    el.querySelector('.message-time').textContent === 'Just now')
        }
    );
    
    if (existingMessage) {
        return; // Message already exists
    }
    
    const isCurrentUser = message.userId === currentUser.uid;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message`; // Remove styling classes
    messageElement.dataset.messageId = message.id || Date.now().toString(); // Ensure unique ID
    
    // Apply direct styling to remove backgrounds
    messageElement.style.backgroundColor = 'transparent';
    messageElement.style.border = 'none';
    messageElement.style.boxShadow = 'none';
    
    // Format timestamp
    let formattedTime = 'Just now';
    if (message.timestamp) {
        try {
            formattedTime = new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            console.warn("Error formatting timestamp:", e);
        }
    }
    
    // Create message HTML with inline styles to force no background
    messageElement.innerHTML = `
        <span class="message-username" style="background: transparent; border: none; box-shadow: none;">${isCurrentUser ? 'You (Your username)' : (message.username || 'Player')}</span>
        <div class="message-text" style="background: transparent; border: none; box-shadow: none;">${escapeHTML(message.text)}</div>
        <span class="message-time" style="background: transparent; border: none; box-shadow: none;">${formattedTime}</span>
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
    notificationElement.style.backgroundColor = 'transparent';
    
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
    
    // Also apply a direct style check after 3 seconds to make sure styles are applied
    setTimeout(() => {
        const messages = document.querySelectorAll('.chat-message, .message-self, .message-other');
        messages.forEach(msg => {
            msg.style.backgroundColor = 'transparent';
            msg.style.border = 'none';
            msg.style.boxShadow = 'none';
        });
        
        const chatMessagesElem = document.getElementById('chat-messages');
        if (chatMessagesElem) {
            chatMessagesElem.style.backgroundImage = 'none';
            chatMessagesElem.style.backgroundColor = 'white';
        }
        
        // Make connect wallet button green
        const walletBtn = document.getElementById('chat-toggle');
        if (walletBtn) {
            walletBtn.style.backgroundColor = '#00CC00';
            walletBtn.style.color = 'white';
        }
    }, 3000);
});