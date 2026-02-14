# HeartByte - Replit Agent Guide

## Overview

HeartByte is a personalized romantic web application built exclusively for two users ("Cookie" and "Senorita"). It's a real-time relationship app featuring love letters, photo galleries, mood sharing, chat, a Valentine's Week special experience with 8 interactive days, a secret vault, shared calendar, milestones, and a futuristic "Message from 2030" memory experience. All data syncs in real-time between both users via Supabase.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Single-Page Application)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (dev server on port 5000, output to `frontend/build/`)
- **Styling**: Tailwind CSS with shadcn/ui component library (Radix UI primitives)
- **State Management**: React Context API (`ThemeContext`, `SpaceContext`, `CoupleContext`) + TanStack React Query for server state
- **Routing**: React Router v6 with role-based routes (`/cookie` for boyfriend dashboard, `/senorita` for girlfriend dashboard)
- **Animation Libraries**: Framer Motion (primary UI animations), Anime.js v4 (motion path animations), Three.js via React Three Fiber + Drei (3D scenes for teddy bears, rings, galaxies)
- **Additional Libraries**: html2canvas (screenshot capture), date-fns (date formatting), MediaPipe (AR pose tracking for Teddy Day)
- **Path Aliases**: `@/` maps to `frontend/src/`

### Backend / Database
- **Database & Auth**: Supabase (PostgreSQL) — used directly from the frontend via `@supabase/supabase-js`
- **Real-time**: Supabase Realtime subscriptions for live sync of messages, moods, photos, calendar events, notifications, valentine progress, and vault data
- **Storage**: Supabase Storage for photos (`valentine-memories/` bucket) and uploaded media
- **No dedicated backend server** — the app is frontend-only with Supabase as the BaaS. The Vite config proxies `/api` to port 8001, but the primary data layer is Supabase client-side calls
- **Authentication**: Custom simple auth (username/password lookup against a `users` table in Supabase, case-insensitive matching with `.ilike()` and `.limit(1)` — no `.single()`)

### Key Database Tables (Supabase)
- `users` — Cookie and Senorita accounts
- `letters` — Love letters between users
- `photos` — Photo gallery
- `moods` — Mood sharing/tracking
- `messages` — Chat messages with read status
- `calendar_events` — Shared calendar
- `milestones` — Relationship milestones
- `special_dates` — Important dates with countdown
- `daily_affirmations` — Random love notes
- `love_language_results` — Love language quiz results
- `quick_notifications` — In-app notifications
- `valentines_progress` — Valentine's Week day unlock tracking, answers, custom messages
- `vault_settings` — Secret vault password setup
- `constellations`, `constellation_stars`, `shooting_star_wishes` — Kiss Day cosmic experience
- `future_memories`, `memory_progress`, `secret_message_unlocks` — Future memory experience

### Application Structure
```
frontend/
├── public/
│   ├── audio/          # Voice notes, ambient sounds
│   └── memories/       # Future memory images
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # shadcn/ui primitives
│   │   └── valentine/  # Valentine's-specific components
│   ├── contexts/       # React Context providers (Theme, Space, Couple)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities (supabase client, auth, utils)
│   ├── pages/          # Route-level page components
│   ├── App.tsx         # Root component with routes
│   ├── App.css         # Global styles, animations, glassmorphism
│   └── index.css       # Tailwind base + design tokens (HSL variables)
```

### Design Patterns
- **Dual-dashboard architecture**: Cookie gets a blue-themed dashboard, Senorita gets pink-themed. Both see synced content
- **Valentine's Week**: 8 days (Feb 7-14), each with unique interactive experiences (3D animations, AR, games, story modes). Date-validated unlocking with test mode
- **Glassmorphism UI**: Consistent use of backdrop-blur, transparent backgrounds, gradient borders throughout
- **Real-time subscriptions**: Most components subscribe to Supabase channels for live updates and clean up on unmount
- **Error handling**: Global ErrorBoundary component, robust Supabase queries avoiding `.single()`

### Important Conventions
- All colors in the design system use HSL format (defined as CSS variables in `index.css`)
- TypeScript is used throughout but with relaxed settings (`strict: false`, `noImplicitAny: false`)
- The app targets two specific users only — no registration flow, no multi-tenant architecture
- Valentine's features are date-gated but include test unlock buttons for development

## External Dependencies

### Services
- **Supabase**: Primary backend — PostgreSQL database, real-time subscriptions, file storage, Row Level Security (RLS). Connection via `@supabase/supabase-js` client initialized in `frontend/src/lib/supabase.ts`
- **WeatherAPI.com**: Current weather data fetched client-side (API key embedded in `TimeWeatherWidget.tsx`)
- **Google Fonts**: Dancing Script, Pacifico, Sacramento (handwritten fonts), Poppins, Merriweather, JetBrains Mono

### Key NPM Packages
- `@supabase/supabase-js` — Supabase client
- `@react-three/fiber` + `@react-three/drei` — 3D rendering (Three.js)
- `framer-motion` — UI animations
- `animejs` — Motion path animations (v4 API: `animate`, `createScope`, `svg.createMotionPath`)
- `@mediapipe/pose` + `@mediapipe/camera_utils` — AR pose tracking
- `@tanstack/react-query` — Server state management
- `date-fns` — Date utilities
- `react-router-dom` — Client-side routing
- `sonner` + `@radix-ui/react-toast` — Toast notifications
- `html2canvas` — Screenshot/save-to-album functionality
- `bcryptjs` — Password hashing (client-side)
- Full Radix UI primitive set via shadcn/ui