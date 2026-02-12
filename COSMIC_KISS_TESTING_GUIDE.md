# 🧪 Cosmic Kiss Symphony - Testing Guide

## Pre-Testing Checklist

### 1. Database Migration ✅
**IMPORTANT**: Must be completed first!

```bash
# Open Supabase SQL Editor and run:
/app/cosmic-kiss-symphony-migration.sql
```

This creates:
- `constellations` table
- `constellation_stars` table
- `shooting_star_wishes` table
- Real-time subscriptions
- RLS policies

### 2. Verify Frontend is Running ✅
```bash
sudo supervisorctl status frontend
# Should show: RUNNING
```

## Testing Scenarios

### Test 1: Basic Star Placement 🌟
1. Navigate to `/valentines-special`
2. Unlock Day 7 (Kiss Day)
3. Click anywhere on the canvas
4. **Expected**:
   - Musical note plays
   - Particle burst animation appears
   - Star appears at click position
   - Instrument icon floats up
5. Click multiple times
6. **Expected**:
   - Stars connect with lines
   - Different areas play different instruments:
     - Top = Violin (pink)
     - Middle = Piano (blue)
     - Bottom = Harp (purple)

### Test 2: Save Constellation 💾
1. Place 5+ stars
2. Click "Save" button (bottom center)
3. **Expected**: Modal appears asking for name
4. Enter name (e.g., "Midnight Promise")
5. Click "Save ✨"
6. **Expected**:
   - Modal closes
   - Completion animation plays
   - Sparkles burst across screen
   - Constellation name appears with gradient
   - Melody plays automatically
   - Stars clear after 3 seconds
   - Constellation appears in sidebar

### Test 3: Play Saved Constellation 🎵
1. Find saved constellation in right sidebar
2. Click "Play" button
3. **Expected**:
   - Notes play in sequence (500ms apart)
   - Each note matches instrument color
   - Constellation stays visible during playback

### Test 4: Collaborative Constellations 💞
**Requires two browser windows/users**

1. **User 1**: Create and save a constellation
2. **User 2**: Refresh page
3. **Expected**: User 2 sees the constellation in sidebar
4. **User 2**: Click "Add Star" on User 1's constellation
5. **Expected**: Button turns green
6. **User 2**: Click on canvas to add stars
7. **Expected**: 
   - New stars added to constellation
   - Lines connect to existing stars
   - Notes play
8. **User 1**: Check constellation
9. **Expected**: User 1 sees User 2's added stars in real-time

### Test 5: Shooting Star Wishes 🌠
1. Wait for shooting star to appear (every 8 seconds)
2. **Expected**: 
   - Sparkle icon shoots across top of screen
   - Leaves glowing trail
3. Click on the shooting star
4. **Expected**: 
   - Modal appears: "Make a Wish"
   - Input field ready
5. Type wish (e.g., "I love you forever")
6. Click "Send Wish ✨"
7. **Expected**:
   - Modal closes
   - Toast notification: "Wish Sent!"
8. **Partner's screen**:
   - Toast notification appears
   - Wish card displays at top
   - Badge shows wish count

### Test 6: Delete Constellation 🗑️
1. Find constellation in sidebar
2. Click trash icon (top right of card)
3. **Expected**:
   - Constellation removed from sidebar
   - Constellation removed from canvas
   - Toast: "Deleted"

### Test 7: Audio System 🔊
1. **Test Violin** (top third):
   - Click in top area
   - **Expected**: Bright, stringy sawtooth sound
2. **Test Piano** (middle third):
   - Click in middle area
   - **Expected**: Clear, balanced triangle sound
3. **Test Harp** (bottom third):
   - Click in bottom area
   - **Expected**: Soft, pure sine sound
4. **Test Scale**:
   - Click from top to bottom
   - **Expected**: Notes descend in pentatonic scale

### Test 8: Visual Effects 🎨
1. Place a star
2. **Expected**:
   - 8 particles burst outward
   - Particles fade as they expand
   - Instrument icon floats up
   - Glow effects around particles
3. **Verify Colors**:
   - Violin particles: Pink gradient
   - Piano particles: Blue gradient
   - Harp particles: Purple gradient

### Test 9: Responsive Design 📱
1. Resize browser window
2. **Expected**:
   - Canvas scales properly
   - Stars maintain relative positions
   - Controls remain accessible
   - Sidebar scrollable on small screens

### Test 10: Real-time Sync 🔄
1. Open two browser windows (Cookie and Senorita)
2. **Window 1**: Create constellation
3. **Expected**: Window 2 sees it instantly
4. **Window 2**: Add star to constellation
5. **Expected**: Window 1 sees new star instantly
6. **Window 1**: Send shooting star wish
7. **Expected**: Window 2 receives notification immediately

## Performance Tests

### Audio Latency 🎵
- Click rapidly
- **Expected**: Notes play without delay
- No crackling or audio glitches

### Animation Performance 💫
- Place 10+ stars quickly
- **Expected**: 
  - Smooth 60fps animations
  - No lag in particle effects
  - Canvas remains responsive

### Memory Management 🧠
- Create and delete multiple constellations
- Play melodies repeatedly
- **Expected**:
  - No memory leaks
  - Browser doesn't slow down
  - Audio engine cleans up properly

## Edge Cases

### Empty State
- **Test**: Load page with no constellations
- **Expected**: Instructions display in center

### Browser Audio Permission
- **Test**: First click on new browser
- **Expected**: Audio initializes on user interaction

### Long Constellation Names
- **Test**: Enter 50+ character name
- **Expected**: Displays properly, truncates if needed

### Rapid Clicking
- **Test**: Click very fast (10+ times/second)
- **Expected**: All notes play, no crashes

### Network Offline
- **Test**: Disconnect internet while playing
- **Expected**: Audio still works, saves queue for sync

## Bug Reporting

If issues found, report with:
1. Browser (Chrome/Firefox/Safari)
2. Steps to reproduce
3. Expected vs actual behavior
4. Console errors (F12 > Console)
5. Screenshots/video if visual issue

## Success Criteria ✅

- [x] Stars place and connect properly
- [x] All three instruments sound different
- [x] Constellations save to database
- [x] Playback works correctly
- [x] Collaboration updates in real-time
- [x] Shooting stars appear and wishes send
- [x] Completion animation displays
- [x] Particle effects are smooth
- [x] UI is responsive
- [x] No console errors

## Known Limitations

1. **Browser Audio**: Requires user interaction first (browser security)
2. **Three.js**: May not work on very old browsers
3. **Real-time**: Requires active internet connection
4. **Mobile**: Best experienced on tablet/desktop due to precision needed

---

**Happy Testing! 🌟 May your constellations be beautiful and your melodies be sweet! 💕**
