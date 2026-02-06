# Love OS - replit.md

## Overview

Love OS is a personalized romantic web application built for two users ("Cookie" and "Senorita"). It serves as a private digital relationship space with real-time features including love letters, photo gallery, mood sharing, chat, Valentine's Day special interactive experiences, milestones tracking, and daily affirmations. Each user has their own themed dashboard (blue for Cookie, pink for Senorita) with content syncing in real-time via Supabase.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend-Only SPA (Single Page Application)
- **Framework**: React 18 with TypeScript, built with Vite
- **Styling**: Tailwind CSS with shadcn/ui component library (Radix UI primitives)
- **Routing**: React Router DOM with route-based space separation (`/cookie`, `/senorita`, `/letters`, `/gallery`, `/mood`, `/chat`, `/questions`, `/milestones`, `/settings`, `/valentines-special`)
- **State Management**: React Context API with three main contexts:
  - `SpaceContext` — manages which user is logged in (cookie/senorita), handles auth state and navigation guards
  - `CoupleContext` — stores hardcoded relationship data (anniversary dates, partner names)
  - `ThemeContext` — manages color themes, dark/light mode, and custom backgrounds per user
- **Data Fetching**: TanStack React Query for caching, plus direct Supabase client calls
- **3D/Animations**: Three.js via `@react-three/fiber` and `@react-three/drei` for particle effects; Framer Motion for page transitions and UI animations; anime.js for additional animations
- **Build Output**: `frontend/build/` directory

### Backend / Database
- **No custom backend server** — the app connects directly to Supabase from the frontend
- **Database**: Supabase (hosted PostgreSQL) accessed via `@supabase/supabase-js` client
- **Real-time**: Supabase Realtime subscriptions used extensively across components (messages, moods, photos, letters, calendar events, notifications, valentine's progress)
- **Storage**: Supabase Storage for photo uploads and valentine memory images
- **Authentication**: Custom auth implementation in `frontend/src/lib/auth.ts` — NOT using Supabase Auth. Users table stores `password_hash` (bcryptjs), login queries the `users` table directly with case-insensitive matching (`ilike`). Session is stored in localStorage as a JSON user object.
- **Environment Variables Required**:
  - `VITE_SUPABASE_URL` — Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public key

### Database Tables (Supabase)
Key tables referenced throughout the codebase:
- `users` — id, username, display_name, role, password_hash, profile_color, avatar_url, background fields
- `messages` — chat messages between users (from_user, to_user, content, message_type, is_read)
- `letters` — love letters (title, content, from_user, to_user)
- `photos` — gallery photos (image_url, caption, uploaded_by)
- `moods` — mood entries (user_name, mood_emoji, mood_label, mood_color, note, photo_url)
- `milestones` — relationship milestones (title, description, milestone_date, category, icon, image_url)
- `calendar_events` — shared calendar events
- `special_dates` — upcoming special dates for countdown
- `daily_affirmations` — love notes/affirmations
- `quick_notifications` — virtual hugs/kisses and notifications
- `love_language_results` — love language quiz results
- `valentines_progress` — Valentine's week day tracking (user_name, day_number, day_name, unlocked_at, custom_message, answer)
- `daily_questions` / `question_answers` — daily couple questions

### Key Design Patterns
- **Component-per-feature**: Each dashboard widget is a self-contained component with its own Supabase subscriptions
- **Real-time everywhere**: Nearly every data component subscribes to Supabase postgres_changes for live updates
- **Two-user system**: The entire app is designed for exactly 2 users. Auth, routing, and UI all assume Cookie or Senorita
- **Error Boundary**: Global React error boundary wrapping the app
- **Path aliases**: `@/` maps to `frontend/src/` for clean imports

### Valentine's Special System
A significant feature with its own component ecosystem under `frontend/src/components/valentine/`:
- 8 themed days (Feb 7-14) with time-gated unlocking
- Interactive questions with saved answers per day
- Custom animations per day (CSS roses, confetti, 3D teddy bears, kiss ripples, etc.)
- Easter egg hunt system with localStorage persistence
- Save-to-album functionality using html2canvas

### Dev Server Configuration
- Vite dev server runs on port **5000** (host: 0.0.0.0)
- API proxy configured: `/api` routes proxy to `http://localhost:8001` (though no backend server currently exists)
- Build outputs to `frontend/build/`

## External Dependencies

### Supabase (Critical — Primary Backend)
- PostgreSQL database hosting
- Real-time subscriptions (WebSocket-based)
- File storage (photos, valentine memories)
- Accessed via `@supabase/supabase-js` client
- Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
- Row Level Security (RLS) policies configured on tables

### Key NPM Packages
- `@supabase/supabase-js` — database client
- `bcryptjs` — client-side password hashing for authentication
- `framer-motion` — animations and transitions
- `@react-three/fiber` + `@react-three/drei` — 3D rendering (floating particles, teddy bears)
- `date-fns` — date manipulation
- `@tanstack/react-query` — data fetching/caching
- `react-router-dom` — client-side routing
- `shadcn/ui` (Radix UI) — complete UI component library
- `html2canvas` — screenshot capture for Valentine's features
- `embla-carousel-react` — carousel functionality
- `recharts` — data visualization
- `animejs` — additional animation library

### Google Fonts
- Dancing Script, Pacifico, Sacramento (handwritten styles)
- Poppins, Merriweather, JetBrains Mono (UI fonts)
- Loaded via CSS `@import` in App.css and index.css