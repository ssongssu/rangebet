// This script ensures the chat toggle button always shows "CONNECT WALLET"
console.log("Button fix script loaded");

// Function to set the button text
function setButtonText() {
    const chatToggleBtn = document.getElementById('chat-toggle');
    if (chatToggleBtn) {
        chatToggleBtn.textContent = 'CONNECT WALLET';
        chatToggleBtn.style.backgroundColor = '#00CC00';
        chatToggleBtn.style.color = 'white';
        console.log("Button text set to CONNECT WALLET");
    } else {
        console.log("Button not found");
    }
}

// Set initial text
document.addEventListener('DOMContentLoaded', () => {
    // Set text immediately
    setButtonText();
    
    // Set text again after a short delay
    setTimeout(setButtonText, 500);
    
    // Also set it periodically
    setInterval(setButtonText, 2000);
});

// Export a dummy function so this can be imported as a module
export function ensureButtonText() {
    setButtonText();
}
