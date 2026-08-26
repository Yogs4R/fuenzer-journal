# Fuenzer Journal

> **Your Private Sanctuary for Mindful Multi-Turn Reflection, Socratic Clarity, and Personal Growth.**  
> Built with **React**, **TypeScript**, **Tailwind CSS**, **Cloud Firestore**, **Firebase Authentication**, and the **Gemini API** (`@google/genai`).

[![GitHub](https://img.shields.io/badge/GitHub-Yogs4R%2Ffuenzer--journal-181717?style=flat&logo=github)](https://github.com/Yogs4R/fuenzer-journal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ridwan%20Suryantara-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/ridwansuryantara)
[![Email](https://img.shields.io/badge/Email-fuenzerofficial%40gmail.com-D14836?style=flat&logo=gmail)](mailto:fuenzerofficial@gmail.com)

---

## 🌿 Overview for Everyone (What is Fuenzer Journal?)

**Fuenzer Journal** is an intelligent, privacy-first personal journal designed to feel like a calm sounding board rather than a blank page. 

If you've ever wanted to journal regularly but found yourself staring at an empty prompt not knowing where to begin, Fuenzer Journal is built for you:

- 🧘 **Talk It Out Naturally**: Instead of forcing you to write in isolation, the app pairs you with a supportive Socratic AI companion that asks clarifying questions, helps you separate what is within your control from what isn't, and validates your feelings.
- 🎙️ **Speech-to-Text & Image Attachments**: Dictate your thoughts hands-free using real-time speech recognition or attach up to 5 photos and sketches (<5 MB each) to enrich your reflections.
- ⚡ **Auto-Distillation**: When you are ready to wrap up, the AI creates an executive summary, extracts key personal breakthroughs, creates action items for tomorrow, and tags core themes.
- 🔒 **Absolute Privacy & Zero Data Monetization**: Your reflections are private to your Google account, protected by owner-bound Firestore security rules. Your journals are never sold or used to train public AI models.
- 🛡️ **100% Client-Side Data Export (Best Privacy)**: All export mechanisms (bulk archive or single-entry export to PDF, formatted Markdown, or raw JSON) execute strictly inside your local web browser. No journal text or files are ever sent to external export conversion servers.
- 📈 **See Your Emotional Trends**: Interactive 30-day graphs show your mood trajectory over time, helping you recognize patterns in your emotional well-being and growth.
- 👓 **Accessibility First**: Adjust reading font sizes (Compact, Standard, Large) to suit your comfort, and enjoy a daily reminder nudge if you haven't taken time for yourself today.

---

## 🌟 Key Features

### 1. Socratic Journaling Frameworks
Choose from curated reflection modes designed around proven psychological and philosophical frameworks:
- **Stoic Reflection** — Dichotomy of control and equanimity.
- **Daily Gratitude** — Mindful appreciation for small victories and people.
- **CBT Cognitive Reframe** — Challenge cognitive distortions and negative self-talk.
- **Weekly Retrospective** — Evaluate wins, bottlenecks, and priorities.
- **Future Self Visioning** — Align today's actions with long-term aspirations.
- **Creative Free-Flow** — Unstructured stream of consciousness for brainstorms.

### 2. Multimodal Reflection: Voice & Images
- **Speech-to-Text**: Dictate your stream-of-consciousness thoughts naturally into your microphone.
- **Image Upload**: Attach up to 5 photos or sketches (under 5 MB per image) with drag-and-drop support, thumbnail previews, and instant full-view lightbox zoom.

### 3. Client-Side Export Engine (Privacy Preserved)
- **Zero-Server Processing**: All PDF rendering, Markdown structuring, and JSON file generation are performed on the client side using `jspdf` and Blob URL downloads.
- **Bulk & Single Export**: Export all journal archives at once from the Insights dashboard or export individual reflections from detail views.

### 4. Search & Filtering
- Instant full-text search across journal titles, executive summaries, takeaways, and tags.
- Filter past reflections by emotional mood chips (Calm, Grateful, Energized, Reflective, etc.).

### 5. Dynamic Font Sizing & Readability
- Switch font sizes (`A-`, `A`, `A+`) at any time in the reflection studio to enhance comfort during long introspective sessions. Settings persist locally.

### 6. Interactive 30-Day Emotional Trend Chart
- Powered by `recharts`, visualizing emotional equanimity and mood distribution over 14 or 30-day windows.

---

## 🛡️ Agentic Threat Modeling & Security Architecture

In compliance with OWASP Top 10 for Web Applications and OWASP Top 10 for LLM Applications:

| Threat Zone | Identified Risk | Countermeasure Implemented |
|---|---|---|
| **Input Surfaces** | Malicious injection, oversized payloads, prompt hijacking | Defensive schema parsing, client-side & server-side length clamping, HTML encoding. |
| **Planning & Reasoning** | Prompt injection attempting to alter system role or leak other users' data | Regex-based injection detection in backend routes, context-bounded prompt templates, plain text ingestion. |
| **Tool Execution & Billing** | DDoS, API exhaustion, billing spikes | Sliding-window per-IP rate limiter on backend API endpoints (40 requests/min). |
| **Memory & State** | Cross-user journal data exposure | Strict owner-bound Firestore Security Rules matching `request.auth.uid == userId`. |
| **Inter-System / API** | API key leakage to browser client | Gemini API key strictly confined to server-side routes; fallback model ladder catches API quotas cleanly. |

---

## 🔐 Database Security Configuration (`firestore.rules`)

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

## 🚀 Deployment to Google Cloud Run

### 1. Prerequisites & GCP Setup
```bash
# Set active GCP project
gcloud config set project YOUR_PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

### 2. Secret Manager Configuration
Store your Gemini API key securely in Google Cloud Secret Manager:
```bash
# Create and populate secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant Cloud Run runtime service account access
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy to Cloud Run
```bash
# Build and deploy containerized service
gcloud run deploy fuenzer-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest

# Apply challenge verification label
gcloud run services update fuenzer-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 💻 Local Development

```bash
# 1. Clone repository
git clone https://github.com/Yogs4R/fuenzer-journal.git
cd fuenzer-journal

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Add your VITE_FIREBASE_* and GEMINI_API_KEY variables

# 4. Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📬 Contact & Socials

- **Author**: Ridwan Suryantara
- **GitHub**: [https://github.com/Yogs4R/fuenzer-journal](https://github.com/Yogs4R/fuenzer-journal)
- **LinkedIn**: [https://linkedin.com/in/ridwansuryantara](https://linkedin.com/in/ridwansuryantara)
- **Email**: [fuenzerofficial@gmail.com](mailto:fuenzerofficial@gmail.com)
- **License**: Apache-2.0
