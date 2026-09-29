# Project Assistance AI — HTML Web Version

This version replaces the Flutter mobile UI with a responsive HTML/CSS/JavaScript web application.

## Structure

- `web/index.html` — application UI
- `web/styles.css` — responsive professional styling
- `web/app.js` — Firebase Authentication + callable Cloud Function integration
- `functions/` — existing server-side Gemini/Firestore backend

## Setup

1. Create a Firebase Web App in your Firebase project.
2. Copy its web configuration into `web/app.js` and replace the `YOUR_*` placeholders.
3. Enable Google Authentication.
4. Deploy the existing Cloud Functions.
5. Host the `web/` folder with Firebase Hosting or another static web host.

For local testing, serve the folder through a local HTTP server rather than opening `index.html` directly.

Example:

```bash
cd web
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Security

Gemini API keys and Google OAuth secrets must remain server-side. The browser only calls Firebase Authentication and the `chat` callable function.

## Backend note

The supplied backend still contains TODOs for Drive synchronization, OAuth folder selection, indexing/deletion handling, notifications and scheduled sync. This HTML conversion changes the client technology; it does not claim those backend TODOs are complete.
