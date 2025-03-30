// UI Module
// Handles UI interactions that aren't specific to game logic or auth

// DOM Elements - Tabs
const loginTab = document.querySelector('[data-tab="login"]');
const signupTab = document.querySelector('[data-tab="signup"]');
const gameTab = document.querySelector('[data-tab="game"]');
const historyTab = document.querySelector('[data-tab="history"]');
const statsTab = document.querySelector('[data-tab="stats"]');

// DOM Elements - Tab Content
const loginTabContent = document.getElementById('login-tab');
const signupTabContent = document.getElementById('signup-tab');
const gameTabContent = document.getElementById('game-tab');
const historyTabContent = document.getElementById('history-tab');
const statsTabContent = document.getElementById('stats-tab');

// DOM Elements - Tab Toggle buttons
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');

// DOM Elements - Theme
const themeToggle = document.getElementById('theme-toggle');
const themePanel = document.getElementById('theme-panel');

// Theme definitions
const themes = {
    pink: {
        primary: '#FF3D57',
        secondary: '#3B9EFC',
        accent: '#FFE600',
        bg: '#FFC6E2',
        cardBg: '#FFF8FB',
        highlight: '#7958FF',
        text: '#000000',
        textInverse: '#FFFFFF'
    },
    blue: {
        primary: '#3B9EFC',
        secondary: '#FF6B6B',
        accent: '#FFD166',
        bg: '#B5DEFF',
        cardBg: '#F0F8FF',
        highlight: '#5271FF',
        text: '#000000',
        textInverse: '#FFFFFF'
    },
    yellow: {
        primary: '#FF9A3D',
        secondary: '#5C8AFF',
        accent: '#FFDC5C',
        bg: '#FFF6B0',
        cardBg: '#FFFEF2',
        highlight: '#FF9F1C',
        text: '#000000',
        textInverse: '#FFFFFF'
    },
    green: {
        primary: '#4BE779',
        secondary: '#4ECDC4',
        accent: '#FFD166',
        bg: '#C7FFD8',
        cardBg: '#F2FFF5',
        highlight: '#00A878',
        text: '#000000',
        textInverse: '#FFFFFF'
    },
    purple: {
        primary: '#FF6188',
        secondary: '#78DCE8',
        accent: '#FFD866',
        bg: '#D8C2FF',
        cardBg: '#F5F0FF',
        highlight: '#AB9DF2',
        text: '#000000',
        textInverse: '#FFFFFF'
    },
    cyber: {
        primary: '#FF00FF',
        secondary: '#00FFFF',
        accent: '#FFFF00',
        bg: '#000000',
        cardBg: '#1A1A1A',
        highlight: '#00FF00',
        text: '#FFFFFF',
        textInverse: '#000000'
    }
};

// Initialize UI
function initUI() {
    setupTabs();
    setupThemeToggle();
    
    // Set default theme
    applyTheme('pink');
    
    // Theme buttons
    setupThemeButtons();
}

// Set up tab switching
function setupTabs() {
    // Auth Tabs (Login/Register)
    if (loginTab && signupTab) {
        loginTab.addEventListener('click', () => {
            switchTab('login');
        });
        
        signupTab.addEventListener('click', () => {
            switchTab('signup');
        });
        
        // Toggle buttons
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => {
                switchTab('login');
            });
        }
        
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => {
                switchTab('signup');
            });
        }
    }
    
    // Game Tabs (Game/History/Stats)
    if (gameTab && historyTab && statsTab) {
        gameTab.addEventListener('click', () => {
            switchGameTab('game');
        });
        
        historyTab.addEventListener('click', () => {
            switchGameTab('history');
            
            // Load history when tab is shown
            import('./stats.js').then(module => {
                if (module.loadUserHistory) {
                    module.loadUserHistory();
                }
            });
        });
        
        statsTab.addEventListener('click', () => {
            switchGameTab('stats');
            
            // Initialize stats when tab is shown
            import('./stats.js').then(module => {
                if (module.initStats) {
                    module.initStats();
                }
            });
        });
    }
}

// Switch auth tab
function switchTab(tabName) {
    // Reset all tabs
    loginTab.classList.remove('active');
    signupTab.classList.remove('active');
    loginTabContent.classList.remove('active');
    signupTabContent.classList.remove('active');
    
    // Activate selected tab
    if (tabName === 'login') {
        loginTab.classList.add('active');
        loginTabContent.classList.add('active');
    } else if (tabName === 'signup') {
        signupTab.classList.add('active');
        signupTabContent.classList.add('active');
    }
}

// Switch game tab
function switchGameTab(tabName) {
    // Reset all tabs
    gameTab.classList.remove('active');
    historyTab.classList.remove('active');
    statsTab.classList.remove('active');
    gameTabContent.classList.remove('active');
    historyTabContent.classList.remove('active');
    statsTabContent.classList.remove('active');
    
    // Activate selected tab
    if (tabName === 'game') {
        gameTab.classList.add('active');
        gameTabContent.classList.add('active');
    } else if (tabName === 'history') {
        historyTab.classList.add('active');
        historyTabContent.classList.add('active');
    } else if (tabName === 'stats') {
        statsTab.classList.add('active');
        statsTabContent.classList.add('active');
    }
}

// Set up theme toggle
function setupThemeToggle() {
    if (themeToggle && themePanel) {
        themeToggle.addEventListener('click', () => {
            if (themePanel.style.display === 'block') {
                themePanel.style.display = 'none';
            } else {
                themePanel.style.display = 'block';
            }
        });
        
        // Hide theme panel when clicking outside
        document.addEventListener('click', (event) => {
            if (themePanel.style.display === 'block' && 
                !themePanel.contains(event.target) && 
                event.target !== themeToggle) {
                themePanel.style.display = 'none';
            }
        });
    }
}

// Set up theme buttons
function setupThemeButtons() {
    // Get all theme buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    // Add click handler for each button
    themeButtons.forEach(button => {
        const themeClass = Array.from(button.classList)
            .find(className => className.startsWith('theme-'));
        
        if (themeClass) {
            const themeName = themeClass.replace('theme-', '');
            
            button.addEventListener('click', () => {
                applyTheme(themeName);
                
                // Hide theme panel after selection
                if (themePanel) {
                    themePanel.style.display = 'none';
                }
            });
        }
    });
}

// Apply theme
function applyTheme(themeName) {
    const theme = themes[themeName];
    
    if (!theme) {
        console.error("Theme not found:", themeName);
        return;
    }
    
    // Apply theme variables to root
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--secondary', theme.secondary);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--card-bg', theme.cardBg);
    document.documentElement.style.setProperty('--highlight', theme.highlight);
    document.documentElement.style.setProperty('--text', theme.text);
    document.documentElement.style.setProperty('--text-inverse', theme.textInverse);
    
    // Save selected theme to localStorage for persistence
    localStorage.setItem('selectedTheme', themeName);
}

// Load saved theme from localStorage
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    
    if (savedTheme && themes[savedTheme]) {
        applyTheme(savedTheme);
    }
}

// Add manga-style boom effect when betting
export function addBoomEffect(element) {
    // Create boom element
    const boom = document.createElement('div');
    boom.className = 'boom-effect';
    boom.innerHTML = '💥';
    boom.style.position = 'absolute';
    boom.style.fontSize = '80px';
    boom.style.top = '50%';
    boom.style.left = '50%';
    boom.style.transform = 'translate(-50%, -50%) scale(0)';
    boom.style.opacity = '0';
    boom.style.transition = 'all 0.3s ease-out';
    boom.style.zIndex = '100';
    
    // Add to element
    element.style.position = 'relative';
    element.appendChild(boom);
    
    // Trigger animation
    setTimeout(() => {
        boom.style.transform = 'translate(-50%, -50%) scale(1.5)';
        boom.style.opacity = '1';
        
        // Remove after animation
        setTimeout(() => {
            boom.style.transform = 'translate(-50%, -50%) scale(3)';
            boom.style.opacity = '0';
            
            setTimeout(() => {
                element.removeChild(boom);
            }, 300);
        }, 500);
    }, 10);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    loadSavedTheme();
});