# Product Requirements Document (PRD): MadLib Financial Literacy

## 1. Elevator Pitch
MadLib Financial Literacy is a 3-minute web app that turns Finnish 15–17-year-olds’ own impulsive money decisions into absurd, personalised AI-generated cartoon comics with Finnish voiceover. By letting teens fill silly MadLib blanks about their first summer-job paycheck and watching “their” financial disaster unfold (followed by instant what-if fixes and a quiz), the app directly targets the single strongest predictor of financial literacy in Finnish adolescents — confidence in using digital financial services (Silinskas et al., PISA 2018 Finland). Teachers lack self-efficacy to teach these topics (Ranta et al. 2022) and games alone don’t change behaviour (Kalmi & Rahko 2022) — MadLib solves both by delivering emotional, counterfactual learning that feels like TikTok but teaches budgeting, saving, and (especially) debt traps.

## 2. Who This App Is For
- Primary: Finnish lower-secondary students (ages 15–17, 9th grade) who have just received their first real paycheck (kesätyöpalkka ~800–1200 €) and face daily digital temptations (MobilePay, Klarna, TikTok shops).
- Secondary: Teachers who want a zero-prep confidence-building activity for “working life & entrepreneurship” classes (the topic they feel least capable of teaching — Ranta et al. 2022).

## 3. Functional Requirements
| ID | Feature | Description | Priority |
|----|-------|-----------|----------|
| F01 | Onboarding profiling | 3 quick questions (gender, confidence in digital payments 1–5, family money-talk frequency) + name → stored in Firestore | Must-have |
| F02 | Recommended storyline | System auto-recommends 1–3 stories based on Silinskas 2023 logic (default tab) | Must-have |
| F03 | Story library | 4 fixed templates (focus: Debt (2), Budgeting (1), Saving, Scams(1), Investing) | Must-have |
| F04 | MadLib input | 10 vertical swipe-up blanks per story | Must-have |
| F05 | AI comic generation | 4–6 sequential cartoon frames (Gemini) + ElevenLabs Finnish teen voiceover narration using user’s name and inputs | Must-have |
| F06 | Quiz | 3 fixed multiple-choice questions with instant feedback | Must-have |
| F07 | What-If explorer | 3 hover/tap alternate endings (pre-generated or live) showing happier outcome | Must-have |
| F08 | Victory & share | Badge, 3 lesson bullets, stitched vertical comic, shareable image/clip | Must-have |
| F09 | Progress saving | Optional Firestore profile to track completed stories/badges | Should-have |
| F10 | Teacher dashboard (future) | Class code → see anonymised completion stats | Could-have |

## 4. User Stories
| As a… | I want to… | So that… | Acceptance Criteria |
|------|------------|----------|---------------------|
| 15-year-old student | Answer 3 quick questions and get a recommended funny story | It feels made for me without choice overload | <30 s onboarding, recommended tab pre-selected |
| Student | Fill silly blanks about my own money impulses | The disaster that plays back is literally “my” story | User’s name + inputs appear correctly in comic/audio |
| Student | Watch a 45-second cartoon of my financial mistake | I laugh and emotionally remember the lesson | Auto-play comic with Finnish voiceover |
| Student | Take a 3-question quiz and see what-if fixes | I instantly understand how to avoid the trap next time | Correct answers → confetti + badge |
| Student | Share my comic and badge | My friends try it too (viral loop) | One-tap share image with caption |
| Teacher | Send a class link | Students get age-appropriate content without my preparation | All stories aligned to national curriculum transversal competences |

## 5. User Interface
- Style: Clean Nordic teen aesthetic — mint/ice-blue palette, hand-drawn cartoon style (Pertti Jarla vibes), bold sans-serif (Inter), 100 % mobile-first vertical flow.
- Screens (full flow <3:30 min):
  1. Splash → Onboarding (4 inputs, big buttons)
  2. Story picker (horizontal cards, huge glowing “Recommended for you” first)
  3. MadLib blanks (TikTok-style vertical swipe, one blank per screen)
  4. Comic player (full-screen auto-play slideshow + audio, replay button)
  5. Quiz (3 swipeable cards, confetti on correct)
  6. What-If (3 big hover cards → alternate frame + short text/voice)
  7. Victory (badge front-and-centre, stitched comic below, share button)

This PRD is intentionally lean and ready for immediate build — every requirement traces to the Finnish research stack that proves confidence mediation is the missing piece in current financial education.