# 💕 Love OS

<div align="center">

![Love OS](https://img.shields.io/badge/Love%20OS-v6.0-ff69b4?style=for-the-badge&logo=heart&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-Personal-blue?style=for-the-badge)

**A personalized digital sanctuary for couples to share love, memories, and daily moments**

[Features](#-features) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Quick Start](#-quick-start) • [Migration Guide](#-migration-guide) • [Project Structure](#-project-structure)

</div>

---

## 📖 About

**Love OS** is a beautiful, real-time relationship application designed exclusively for Cookie 🍪 and Senorita 💃. Built with modern web technologies and connected to Supabase for seamless data synchronization, authentication, and real-time features.

### ✨ Core Concept

Two dedicated personalized spaces with secure password authentication:
- 🍪 **Cookie's Command Center** - Blue-themed boyfriend space
- 💃 **Senorita's Sanctuary** - Pink-themed girlfriend space

All content syncs in real-time across both spaces via Supabase subscriptions.

---

## 🎯 Features

### 🔐 **NEW: Secure Authentication**
- Password-protected login for both users
- Custom password storage in Supabase
- Password change functionality in settings
- Session management

### 💬 **NEW: Real-Time Chat System**
- Instant messaging between Cookie and Senorita
- **Typing indicators** - See when your partner is typing
- **Read receipts** - Know when messages are read (✓ sent, ✓✓ read)
- **Message reactions** - React with emojis (❤️ 😍 😊 👍 🔥)
- **Virtual Hug & Kiss** - Send special animated messages
- Beautiful chat bubble design with color customization
- Real-time synchronization via Supabase

### 🤗 **NEW: Virtual Love Actions**
- **Send Virtual Hugs** - Instant warm hug animations
- **Send Virtual Kisses** - Sweet kiss notifications
- Real-time delivery with beautiful animations
- Partner receives instant notifications

### ✨ **NEW: Daily Love Affirmations**
- Random romantic affirmations
- Multiple categories (love, appreciation, encouragement, romantic, cute)
- Refresh button for new affirmations
- 15+ beautiful pre-loaded affirmations

### ⏰ **NEW: Countdown Timers**
- Count down to special dates and anniversaries
- Live updating timer (days, hours, minutes, seconds)
- Custom icons and descriptions for each event
- Auto-switches to next event when one passes

### 📅 **NEW: Shared Calendar**
- Plan dates and events together
- View upcoming events on dashboard
- Color-coded categories (date, reminder, appointment, special)
- Location tracking for events

### ⭐ **NEW: Memory Timeline**
- Create and view relationship milestones
- Categories: first times, memories, achievements, trips, special moments
- Add photos to memories
- Chronological display of your journey together

### 💭 **NEW: Quick "Thinking of You" Notifications**
- Floating notification bell with unread count
- Send instant "thinking of you" messages
- Real-time notification panel
- Mark notifications as seen
- Beautiful notification animations

### 💖 **NEW: Love Language Results**
- Display love language quiz results
- Shows primary love language for both partners
- 5 love languages: Words of Affirmation, Quality Time, Receiving Gifts, Acts of Service, Physical Touch
- Helps understand each other better

### 💌 Love Letters
- Write and send heartfelt letters to each other
- Beautiful card-based display with preview
- Full-screen reading experience
- Real-time notifications when partner sends a letter
- Connected to Supabase for persistent storage

### 💖 Mood Sharing
- Share current mood with emoji selection
- Add notes and photos to mood updates
- React to partner's moods with emoji reactions
- View mood history timeline
- Real-time synchronization

### 📸 Photo Gallery
- Upload and share couple photos
- Add captions to memories
- Beautiful grid-based gallery view
- Cloud storage via Supabase
- Dashboard preview shows latest photos

### ❓ Daily Questions
- Answer romantic daily questions
- View partner's answers side-by-side
- Pre-loaded with 50+ thoughtful questions
- Strengthen connection through shared responses

### 🎨 Theme Customization
- **6 Color Themes**: Pink, Purple, Blue, Green, Orange, Red
- **Appearance Modes**: Light, Dark, **System (Default)**
- Personalized settings for each space
- Preferences persist across sessions

### ⚡ Real-time Sync
- Instant updates across both spaces
- Push notifications for new content
- Powered by Supabase Realtime
- Live updates for chat, moods, letters, and more

---

## 🛠️ Tech Stack

### Frontend
```
React 18          - UI Framework
TypeScript        - Type Safety
Vite              - Build Tool & Dev Server
Tailwind CSS      - Utility-First Styling
Framer Motion     - Smooth Animations
React Router      - Client-Side Routing
Tanstack Query    - Data Fetching & Caching
Radix UI          - Accessible Component Primitives
Shadcn UI         - Beautiful Component Library
```

### Backend & Database
```
Supabase          - Backend as a Service
  ├─ PostgreSQL   - Relational Database
  ├─ Realtime     - WebSocket Subscriptions
  ├─ Storage      - File/Photo Storage
  └─ Auth         - (Optional - Currently Open Policies)
```

### Infrastructure
```
FastAPI           - Python Backend (Optional)
MongoDB           - Additional Data Storage (Optional)
Nginx             - Reverse Proxy
Supervisor        - Process Management
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- Supabase Account
- Access to the repository

### 1. Clone & Install

```bash
cd /app/frontend
yarn install
```

### 2. Environment Configuration

Create `/app/frontend/.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# Execute the schema file
cat /app/supabase-clean-install.sql
```

This creates:
- ✅ Letters table
- ✅ Moods & mood_reactions tables
- ✅ Photos table
- ✅ Questions & answers tables
- ✅ Storage bucket for photos
- ✅ Real-time subscriptions
- ✅ Row Level Security policies (open access)

### 4. Start Development Server

```bash
# Start frontend (Port 3000)
sudo supervisorctl restart frontend

# Check status
sudo supervisorctl status
```

### 5. Access the Application

- **Landing Page**: `http://localhost:3000/`
- **Cookie's Space**: `http://localhost:3000/cookie`
- **Senorita's Space**: `http://localhost:3000/senorita`

---

## ✅ Current Status

### 🎉 Production Ready - All Features Operational

**What's Working:**
- ✅ Beautiful UI with smooth animations
- ✅ Space selection and navigation
- ✅ Direct URL access (bookmarkable & shareable)
- ✅ Love Letters with Supabase integration
- ✅ Mood sharing with real-time updates
- ✅ Photo gallery with cloud storage
- ✅ Daily questions system
- ✅ Theme switching (6 colors + dark/light/system modes)
- ✅ Settings persistence
- ✅ Real-time synchronization across spaces
- ✅ Toast notifications for user actions

**Latest Updates (v5.0):**
- 🆕 Letters dashboard now connected to real Supabase data (no hardcoded examples)
- 🆕 System theme set as default (auto-adapts to device preference)
- 🆕 Cleaned up unused files and documentation
- 🆕 Professional README with comprehensive documentation
- 🆕 Real-time sync working perfectly across all features

---

## 📁 Project Structure

```
/app/
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── ui/            # Shadcn UI Components
│   │   │   ├── LoveLetters.tsx          # Letters Dashboard Widget
│   │   │   ├── PhotoGallery.tsx         # Photos Dashboard Widget
│   │   │   ├── MoodSharing.tsx          # Mood Dashboard Widget
│   │   │   ├── DailyQuestion.tsx        # Questions Widget
│   │   │   ├── FloatingHearts.tsx       # Animated Background
│   │   │   └── ...
│   │   ├── contexts/          # React Context Providers
│   │   │   ├── SpaceContext.tsx         # Space Management (Cookie/Senorita)
│   │   │   ├── ThemeContext.tsx         # Theme & Appearance Settings
│   │   │   └── CoupleContext.tsx        # Couple Data
│   │   ├── pages/             # Route Pages
│   │   │   ├── SpaceSelection.tsx       # Landing Page
│   │   │   ├── CookieDashboard.tsx      # Cookie's Dashboard
│   │   │   ├── SenoritaDashboard.tsx    # Senorita's Dashboard
│   │   │   ├── Letters.tsx              # Full Letters Page
│   │   │   ├── MoodEnhanced.tsx         # Full Mood Page
│   │   │   ├── Gallery.tsx              # Full Gallery Page
│   │   │   ├── Questions.tsx            # Full Questions Page
│   │   │   └── Settings.tsx             # Settings Page
│   │   ├── lib/               # Utilities & Clients
│   │   │   ├── supabase.ts              # Supabase Client
│   │   │   └── utils.ts                 # Helper Functions
│   │   └── main.tsx           # Application Entry Point
│   ├── .env                   # Environment Variables
│   ├── package.json           # Dependencies
│   ├── tailwind.config.ts     # Tailwind Configuration
│   └── vite.config.ts         # Vite Configuration
├── backend/                   # Optional FastAPI Backend
│   ├── server.py
│   └── requirements.txt
├── supabase-clean-install.sql # Database Schema
└── README.md                  # This File
```

---

## 🗃️ Database Schema

### Simplified Tables (No Authentication Required)

#### **letters**
```sql
- id            UUID PRIMARY KEY
- title         TEXT NOT NULL
- content       TEXT NOT NULL
- from_user     TEXT ('Cookie' | 'Senorita')
- to_user       TEXT ('Cookie' | 'Senorita')
- created_at    TIMESTAMPTZ
```

#### **moods**
```sql
- id            UUID PRIMARY KEY
- user_name     TEXT ('Cookie' | 'Senorita')
- mood_emoji    TEXT
- mood_label    TEXT
- mood_color    TEXT
- note          TEXT
- photo_url     TEXT
- created_at    TIMESTAMPTZ
```

#### **photos**
```sql
- id            UUID PRIMARY KEY
- image_url     TEXT
- caption       TEXT
- uploaded_by   TEXT ('Cookie' | 'Senorita')
- created_at    TIMESTAMPTZ
```

#### **questions & answers**
```sql
questions:
  - id, question_text, category, date, created_at

answers:
  - id, question_id, user_name, answer_text, created_at
```

---

## 🎨 Design System

### Color Themes
- **Primary (Pink)**: `#ec4899` - Default couple theme
- **Purple**: `#8b5cf6` - Royal elegance
- **Blue**: `#3b82f6` - Cool serenity
- **Green**: `#22c55e` - Fresh harmony
- **Orange**: `#f97316` - Warm energy
- **Red**: `#ef4444` - Passionate love

### Space Theming
- **Cookie's Space**: Blue primary, command center aesthetic
- **Senorita's Space**: Pink primary, sanctuary aesthetic

### Appearance Modes
- **System (Default)**: Auto-adapts to device/browser preference
- **Light**: Clean, bright interface
- **Dark**: Easy on the eyes, modern look

---

## 🔧 Development

### Scripts

```bash
# Frontend Development
yarn dev              # Start dev server with hot reload
yarn build           # Production build
yarn preview         # Preview production build
yarn lint            # Run ESLint

# Backend (Optional)
pip install -r requirements.txt
python server.py
```

### Service Management

```bash
# Restart services
sudo supervisorctl restart frontend
sudo supervisorctl restart backend
sudo supervisorctl restart all

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/frontend.*.log
```

---

## 🔐 Environment Variables

### Frontend (`/app/frontend/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend (Optional - `/app/backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017/loveos
REACT_APP_BACKEND_URL=http://your-backend-url/api
```

---

## 🚢 Deployment

### Production Checklist
- ✅ Configure environment variables
- ✅ Set up Supabase project
- ✅ Run database migrations
- ✅ Configure storage bucket policies
- ✅ Enable real-time subscriptions
- ✅ Test all features end-to-end
- ✅ Set up custom domain (optional)

### Supabase Configuration
1. Create new project on [Supabase](https://supabase.com)
2. Run SQL schema in SQL Editor
3. Configure Storage bucket for photos
4. Enable Realtime on all tables
5. Update frontend `.env` with credentials

---

## 🤝 Contributing

This is a personal project built exclusively for Cookie 🍪 and Senorita 💃. 

If you'd like to create something similar for your relationship, feel free to fork and customize!

---

## 📝 License

**Personal Use Only** - Built with ❤️ for Cookie & Senorita

---

## 💝 Credits

<div align="center">

**Built with Love**

*Because every love story deserves its own operating system*

---

**Cookie 💕 Senorita • Forever & Always**

</div>
