# Manga Betting Game

A manga-themed betting game with Firebase integration for user accounts, real-time statistics, and leaderboards.

## Features

- User authentication with Firebase
- Real-time betting game with slider controls
- History and statistics tracking
- Online player counter
- Chat functionality

## Deployment

To deploy the application to Firebase Hosting:

1. Make sure you have the Firebase CLI installed and you're logged in
2. Run the deployment script: `deploy.bat` (on Windows) or `firebase deploy`
3. Your application will be deployed from the root directory (not from a public directory)
4. Visit https://manga-bet.web.app to see the deployed application

**Important**: Always deploy from the root directory. Do not create or use a separate public directory, as this can cause confusion and sync issues.

## Features

- **Manga-styled UI**: Colorful, dynamic interface with comic-style design elements
- **User Authentication**: Login and registration with Firebase
- **Range Betting**: Select a min-max range and bet on whether a random number falls within it
- **Dynamic Payouts**: Narrower ranges have higher payouts due to lower probability
- **Betting History**: Track all your past bets with detailed statistics
- **Real-time Stats**: See online players, recent bets, and top players
- **Theme Customization**: Choose from 6 different manga-inspired color themes

## Setup Instructions

1. Create a Firebase project:
   - Go to [firebase.google.com](https://firebase.google.com/) and create a new project
   - Add a web app to your project
   - Enable Authentication with Email/Password
   - Create a Firestore database

2. Configure Firebase in the app:
   - Open `js/firebase-config.js`
   - Replace the placeholder config with your actual Firebase project details

3. Run the app:
   - Open `index.html` in your browser
   - For full functionality, deploy to a web server or use Firebase Hosting

## Technology Stack

- HTML5, CSS3, JavaScript
- Firebase Authentication
- Cloud Firestore Database
- Firebase Hosting (optional)

## Project Structure

```
MangaBettingGame/
│
├── css/
│   └── styles.css         # Main stylesheet
│
├── js/
│   ├── firebase-config.js # Firebase configuration
│   ├── auth.js            # Authentication logic
│   ├── game.js            # Game mechanics
│   ├── stats.js           # History and statistics
│   └── ui.js              # UI interactions
│
├── img/                   # Image assets (optional)
│
└── index.html             # Main HTML file
```

## How to Play

1. **Create an account** or log in
2. **Set your bet range** using the sliders
3. **Enter your bet amount**
4. **Place your bet** and see if the random number falls within your range
5. **Win or lose** based on the result
6. Check your **betting history** and compare yourself with other players

## Game Logic

- The game generates a random number between 0 and 100 (with one decimal place)
- You win if the number falls within your selected range
- Your payout is calculated based on the probability:
  - Payout Multiplier = 100 / Win Probability
  - E.g., A range of 25-75 has a 50% probability and a 2x multiplier

## Future Development Ideas

- Mobile app version
- Additional betting modes
- Achievements and levels
- Social features
- Daily rewards and bonuses

## Credits

- Fonts: Google Fonts (Bangers, Comic Neue, Russo One)
- Icons: Emoji characters
- Firebase: For authentication and database

---

Created with ❤️ and 💥 manga style!