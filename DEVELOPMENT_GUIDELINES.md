# RangeBet Development Guidelines

This document contains important rules, processes, and guidelines for developing and maintaining the RangeBet project. **Please read this document first when working on this project to avoid wasting time repeating instructions.**

## Version Numbering

- **Version Format**: Use format "v0.XX" where XX is an incrementing number (e.g., v0.12, v0.13, v0.14)
- **Version Display**: 
  - The version number must be displayed in the page title: `<title>Manga Betting Game v0.XX</title>`
  - The version number must appear in the title badge: `<div class="title-badge">MANGA EDITION <span class="version-tag">v0.XX</span></div>`
- **CSS Version**: Increment the CSS version query parameter when updating styles: `?v=1.X`
- **Commit Messages**: Include the version number in commit messages for major changes: "Feature X implemented - v0.XX"

## Deployment Process

- **Deployment Source**: Firebase is configured to deploy from the root directory, NOT from the public folder
- **Do NOT Update Public Folder**: Do not waste time updating files in the public directory as they are not used for deployment
- **Deploy Command**: Use `firebase deploy` from the project root directory to deploy changes
- **Git Push**: Always push changes to the remote repository with `git push` before or after deployment

## Development Workflow

- **Branch Management**:
  - Use main branch for stable releases
  - Create feature branches for major changes
  - Use descriptive branch names prefixed with feature type (e.g., `fix/chat-styling`, `feature/new-wallet`)
- **Merge Resolution**:
  - When merging branches, carefully resolve all conflicts
  - Make sure version numbering is consistent after merges
  - Check all JS files for merge conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>> branch-name`)

## Project Structure

- **CSS Organization**:
  - Primary styles in `css/styles.css`
  - Override styles in `css/overrides.css`
  - Use the version-tagged CSS imports
- **JavaScript Organization**:
  - Each functionality has its own JS file (auth.js, chat.js, wallet.js, etc.)
  - Import all JS files in index.html
  - Use type="module" for all script imports

## Component Styling

### Chat Box
- Chat box should have a clean, white background
- No speech bubble icon or decorative elements
- Styles are defined in overrides.css
- Chat toggle button is now used for wallet connection (green color)

### Wallet Connection
- Wallet button is styled green (#00CC00)
- Wallet address should be displayed in a small container below username
- Wallet.js handles all wallet-related functionality

## Firebase Configuration

- Firebase config is already set up in js/firebase-config.js
- Firestore is used for:
  - User accounts and profiles
  - Chat messages
  - Game history
- Firebase hosting is configured in firebase.json
- Deployment does NOT use the public folder

## Common Issues & Solutions

### Chat Box Styling Issues
- If chat box collapses or loses styling, check for conflicts in overrides.css
- Make sure all !important flags are applied to chat styling
- Check for proper DOM structure in index.html

### Wallet Connection Issues
- If wallet connection fails, check wallet.js for proper Phantom wallet integration
- The chat-toggle button is now used for wallet connection
- Ensure proper error handling for wallet connection failures

---

**Note**: Always refer to this document when starting work on the project to avoid repeating instructions and wasting time. The guidelines here take precedence over any conflicting information unless explicitly discussed and updated.
