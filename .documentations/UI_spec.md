# MadLib Financial Literacy – User Interface Design Document

## Layout Structure
- **100% mobile-first vertical single-page flow** (no horizontal navigation, no desktop sidebar).
- Full-screen screens that advance only forward (back button allowed but discouraged).
- TikTok/Instagram Reels-style infinite vertical scroll within sections (MadLib blanks, quiz, what-if).
- Fixed bottom progress bar on every screen (thin mint line + percentage + current step name).
- No top app bar except on Victory screen (share + home).

## Core Components
- **Splash / Onboarding**: Full-screen cartoon background (worried teen with empty wallet), large headline, 4 big rounded input cards that animate in one-by-one.
- **Story Picker**: Horizontal scrollable cards at top (Recommended card 1.5× larger + glowing border + “Made for you” ribbon), tabs below for categories.
- **MadLib Input**: One blank per full-screen at a time, huge text input with funny placeholder, swipe-up or big arrow to next.
- **Comic Player**: Full-screen black borders, auto-advance frames (2–3 s each), speaker icon pulsing with voice, replay FAB bottom-right.
- **Quiz**: 3 vertical cards, swipe left/right, right for answer, instant confetti explosion + explanation card.
- **What-If Explorer**: 3 large rounded cards in column, tap/hold reveals alternate frame + short text bubble.
- **Victory Screen**: Badge hero image top half, stitched comic below, big pulsing share button, “Play another” CTA.

## Interaction Patterns
- Vertical swipe-to-advance everywhere (feels native on phone).
- Big tappable areas (min 60 dp touch targets).
- Micro-animations: confetti on correct quiz answer, “poof” smoke when wrong, gentle bounce on recommended card.
- Voiceover auto-plays once, replay on tap.
- All buttons use haptic feedback (subtle vibration on tap).
- No text-heavy screens — max 12 words per screen outside comic.

## Visual Design Elements & Color Scheme
- **Palette (2025 Nordic teen trend)**:
  - Primary: Mint ice #A3E4D7
  - Accent happy: Soft coral #FF6B6B
  - Accent warning: Warm orange #F39C6B
  - Background: Off-white #F8FAFC
  - Dark text: Charcoal #2D3436
  - Success: Forest green #27AE60
- **Style**: Hand-drawn cartoon line art (thick black outlines, flat colours, exaggerated expressions — think modern Pertti Jarla meets Duolingo).
- Rounded corners everywhere (24 dp).
- Subtle grain texture overlay on backgrounds for warmth.

## Mobile, Web App, Desktop Considerations
- **Mobile only in practice** — responsive but optimised for portrait phone.
- Force portrait mode.
- Web/desktop: show centred phone frame with “Best on mobile” message + QR code.
- No mouse hover states — everything tap/swipe.

## Typography
- **Headings**: TT Hoves Pro Bold or similar geometric sans (Finnish schools love it).
- **Body**: Inter Medium 18–20 px, line-height 1.6.
- Maximum 2 font weights per screen.
- All text left-aligned, generous padding.

## Accessibility
- WCAG AA compliant contrast (mint text on white passes).
- VoiceOver reads every blank hint + comic narration text.
- Colour-blind safe accents.
- ElevenLabs voice at 1.0× speed with clear Finnish teen pronunciation.
- Skip-to-content hidden button.
- Reduced motion toggle in onboarding (respects OS setting).