# Software Requirements Specification (SRS)  
**MadLib Financial Literacy – November 2025 Junction Submission**

## System Design
- Single Page Application (SPA) with serverless backend
- 100 % mobile-first vertical flow, portrait only
- Offline-first capable (progress saved locally + Firestore sync)
- All heavy processing (Gemini image generation + ElevenLabs audio) offloaded to n8n cloud workflows
- Zero server-side rendering – everything client-side except AI calls
- Total user session < 3:30 min, average cold start → badge in < 90 seconds

## Architecture Pattern
- Jamstack + Workflow Automation Hybrid
  - Frontend: Vaadin Flow 24 (Java) compiled to static assets → Vercel
  - Backend: n8n.cloud (visual workflow engine) as BFF – Backend For Frontend)
  - AI orchestration layer: n8n handles Gemini 2.0 Flash + ElevenLabs + Cloudinary
  - Data layer: Google Firestore + Cloud Storage (via Firebase SDK in browser)

## State Management
- Vaadin Flow built-in server-side state (View → UI state synchronised via WebSocket)
- Local fallback: IndexedDB + localStorage for onboarding answers + current story progress
- Global state object (TypeScript interface in shared module):
  ```ts
  interface AppState {
    profile: { name: string; gender: string; confidence: number; familyTalk: string };
    currentStoryId: string;
    madlibAnswers: string[];
    comicAssets: { images: string[]; audio: string };
    quizScore: number;
  }
  ```

## Data Flow
1. User → Vercel static site (Vaadin app)
2. Onboarding answers → Firestore document `users/{uid}/profile`
3. Story selection → n8n webhook `/start-story` → returns story template
4. MadLib answers submitted → n8n webhook `/generate-comic`
   → parallel: Gemini sequential image gen → ElevenLabs audio → Cloudinary URLs
   → webhook response with {images[], audioUrl}
5. What-If & quiz → client-side (pre-cached or same webhook with modified prompt)
6. Victory → Firestore update badges + optional share image upload

## Technical Stack
| Layer          | Technology                                      | Reason                                                                 |
|----------------|-------------------------------------------------|------------------------------------------------------------------------|
| Frontend       | Vaadin Flow 24 (Java 21 + TypeScript views)     | Extremely fast UI prototyping, built-in routing/state, perfect Copilot support |
| Hosting        | Vercel (static + serverless functions if needed)| Instant preview URLs for judges                                          |
| Backend        | n8n.cloud (self-hosted instance optional)       | Visual workflow = 10× faster than writing Express for AI orchestration |
| AI Images      | Google Gemini 2.0 Flash (via Vertex AI or API)  | Best cartoon consistency in 2025, sequential prompting works reliably  |
| AI Audio       | ElevenLabs (Finnish voices “Aada” / “Onni”)       | Native Finnish teen voices, streaming, SSML support                    |
| Storage        | Google Cloud Storage (via signed URLs) + Cloudinary fallback | Fast CDN, easy image transformations                                   |
| Database       | Google Firestore in Native mode                 | Real-time sync, offline support, scales to zero                         |
| Auth           | Anonymous Firebase Auth (uid only)              | No friction for students                                               |

## Authentication Process
- Anonymous Firebase Authentication on app load
- UID generated client-side → used for Firestore doc paths
- No email/password, no Google sign-in → zero friction for classroom use
- Optional class code query param `?class=ABC123` → writes to shared collection for future teacher view

## Route Design (Vaadin @Route)
```
/                     → SplashView (redirects to onboarding if no profile)
/onboarding          → OnboardingView
/stories             → StoryPickerView (recommended tab default)
/madlib/:storyId     → MadLibView (10 blanks, vertical pager)
/comic/:sessionId    → ComicPlayerView
/quiz/:sessionId     → QuizView
/whatif/:sessionId   → WhatIfView
/victory/:sessionId  → VictoryView
```

All routes server-side rendered for instant navigation (Vaadin magic).

## API Design (n8n exposed webhooks)
| Method | Endpoint              | Request Body                              | Response                                 |
|--------|-----------------------|-------------------------------------------|------------------------------------------|
| POST   | /api/recommend        | {profile}                                 | {recommendedId, allStories[]}            |
| POST   | /api/generate-comic   | {storyId, answers[], profile}             | {images: string[], audio: string}        |
| POST   | /api/whatif           | {storyId, answers[], whatIfIndex}         | {altImage: string, explanation: string}  |
| POST   | /api/save-progress    | {uid, storyId, score, badge}              | {success: true}                          |

All n8n workflows protected with API key header (Vercel env var).

## Database Design ERD (Firestore NoSQL)

```
Collection: users
  Document: {uid}
    Sub-collection: profile
      doc: profile → {name, gender, confidence, familyTalk, createdAt}
    Sub-collection: sessions
      doc: auto-id → {storyId, answers[], score, badge, createdAt, sharedWithClass?}

Collection: stories (static, deployed via script)
  Document: debt-sneaky-fees → {title, category, blanks[], storyTemplate, quiz[], lessons[], badge}

Collection: classes (future)
  Document: ABC123 → {teacherEmail, studentCount, completed: number}
```

No relational joins – everything denormalised for speed.