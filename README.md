# Personal Gemini Journal

A thoughtful, multi-turn AI journaling companion built with **React**, **TypeScript**, **Tailwind CSS**, **Cloud Firestore**, **Firebase Authentication**, and the **Gemini API** (`@google/genai`). Designed with a soothing, distraction-free **Natural Tones** aesthetic.

---

## Features

- **Google Sign-In & Auth Guard**: Seamless authentication with Firebase Authentication; isolates each user's reflections.
- **Guided Multi-Turn AI Reflections**: Engage in conversational journaling powered by Gemini with framework prompts (Stoic Reflection, Daily Gratitude, CBT Cognitive Reframe, Weekly Retrospective, Future Self Visioning, Creative Brainstorm).
- **AI-Powered Synthesis & Auto-Distillation**: Automatically derives titles, executive summaries, actionable next steps, key breakthroughs, thematic tags, and emotional tone.
- **Strict Firestore Isolation**: Subcollection hierarchy (`/users/{userId}/journals/{journalId}`) enforced with owner-bound Firestore security rules.
- **Growth & Habit Analytics**: Visual metrics tracking streak consistency, dominant emotional states, and recurring themes.
- **Rich Export Capabilities**: One-click export to Markdown (`.md`) and raw JSON.
- **Resilient AI Model Ladder**: Automatic fallback chain across Gemini models (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`).

---

## Security Architecture & Threat Model

### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile metadata
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Owner-bound journal entries isolation
    match /users/{userId}/journals/{journalId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Default deny for all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Deployment to Google Cloud Run

### 1. Prerequisites & GCP Setup
```bash
# Set your active GCP project
gcloud config set project YOUR_PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

### 2. Secret Management Setup
Store your Gemini API key in Google Cloud Secret Manager:
```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant Cloud Run service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy to Cloud Run
```bash
# Build and deploy containerized service
gcloud run deploy personal-gemini-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest

# Apply challenge verification label
gcloud run services update personal-gemini-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run unified full-stack dev server
npm run dev
```
Open `http://localhost:3000` to interact with the application.
