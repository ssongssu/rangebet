// UI Module
// This module handles UI-related functionality

// Handles the chat minimize/maximize functionality
document.addEventListener('DOMContentLoaded', function() {
    // Chat minimizing/maximizing
    const minimizeBtn = document.getElementById('minimize-chat');
    const chatPanel = document.getElementById('chat-panel');
    
    if (minimizeBtn && chatPanel) {
        minimizeBtn.addEventListener('click', function() {
            console.log('Minimize button clicked');
            chatPanel.classList.toggle('minimized');
            
            // Force display styles - this ensures it works
            if (chatPanel.classList.contains('minimized')) {
                const chatMessages = document.getElementById('chat-messages');
                const chatInputContainer = document.querySelector('.chat-input-container');
                
                if (chatMessages) {
                    chatMessages.style.display = 'none';
                }
                
                if (chatInputContainer) {
                    chatInputContainer.style.display = 'none';
                }
            } else {
                const chatMessages = document.getElementById('chat-messages');
                const chatInputContainer = document.querySelector('.chat-input-container');
                
                if (chatMessages) {
                    chatMessages.style.display = 'flex';
                }
                
                if (chatInputContainer) {
                    chatInputContainer.style.display = 'flex';
                }
            }
        });
    }
});

export {};
