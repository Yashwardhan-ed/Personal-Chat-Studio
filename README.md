# Persona Chat Studio

A responsive starter app for the Scaler Academy prompt-engineering assignment. It includes three persona-specific prompt definitions, a clean chat UI, persona switching, quick suggestion chips, a typing state, and an Express backend that sends the correct system prompt with each request.

## Features

- Three personas: Anshuman Singh, Abhimanyu Saxena, and Kshitij Mishra
- Persona switcher that resets the conversation
- Quick-start suggestion chips per persona
- Typing indicator while the API request is in progress
- Environment-based API key handling
- Simple error handling for failed model calls

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Add your API key to `.env`.

4. Start the app:

```bash
npm start
```

5. Open `http://localhost:3000`.

## Deployment

Deploy the app to a Node-friendly host such as Render, Railway, or Fly.io. Make sure the deployment environment includes:

- `GROQ_API_KEY`
- The Groq model is configured in `server.js`
- `PORT` if your host requires it

Once deployed, replace the placeholder in the Live Demo section with the public URL.

## Prompt Files

- [src/prompts.js](src/prompts.js) contains the active system prompts used by the backend.
- [prompts.md](prompts.md) is the annotated documentation version required by the assignment.
- [reflection.md](reflection.md) contains the 300-500 word reflection.

