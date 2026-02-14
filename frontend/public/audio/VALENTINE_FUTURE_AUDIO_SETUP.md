# 🎵 Valentine's Future Audio Setup

The Valentine's Future Memory Experience requires three audio files for the complete experience.

## Required Audio Files

### 1. warp-whoosh.mp3
**Type:** Warp transition sound effect  
**Duration:** 1-2 seconds  
**Volume:** 0.7-0.9  
**Use:** Plays when user clicks "Message from 2030" button and warp animation starts

**Free Download Sources:**
- **Mixkit**: https://mixkit.co/free-sound-effects/whoosh/
  - Look for: "Fast Whoosh" or "Swirling Whoosh"
- **Freepik**: https://www.freepik.com/audio/sound-effects/whooshes
  - Search for: "Whoosh of a spaceship" or "Spaceship Riser"
- **SFX Engine**: https://sfxengine.com/sound-effects/whoosh
  - Look for: Cinematic whoosh effects

### 2. memory-chime.mp3
**Type:** Notification/chime sound  
**Duration:** 0.5-1 second  
**Volume:** 0.6  
**Use:** Plays when user clicks on a memory node

**Free Download Sources:**
- **Mixkit**: https://mixkit.co/free-sound-effects/bell/
  - Look for: "Notification bell" or "Soft bell chime"
- **Uppbeat**: https://uppbeat.io/sfx/category/bell/chime
  - Look for: "Notification bell - classic ding"
- **Free Sounds Library**: https://www.freesoundslibrary.com/ding-sound-effect/
  - Direct download: Ding sound effect

### 3. space-ambient.mp3
**Type:** Ambient space music loop  
**Duration:** 2-3 minutes (seamless loop)  
**Volume:** 0.3-0.4  
**Use:** Background music for the Valentine's Future page

**Free Download Sources:**
- **Freesound**: https://freesound.org/s/709986/
  - "Cosmic Ambient Space (loop)" by AudioCoffee (requires attribution)
- **Looperman**: https://www.looperman.com/loops/tags/free-space-ambient-loops-samples-sounds-wavs-download
  - Search for: "space ambient" loops (100% royalty-free)
- **YouTube Audio Library**: Search for "ambient space loop"

## Installation Instructions

1. Download the three audio files from the sources above
2. Rename them to match the exact filenames:
   - `warp-whoosh.mp3`
   - `memory-chime.mp3`
   - `space-ambient.mp3`
3. Place them in `/app/frontend/public/audio/` directory
4. Test by accessing the Valentine's Future page

## Audio Format Requirements

- **Format**: MP3
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Rate**: 128-320 kbps
- **Channels**: Stereo (preferred) or Mono

## Notes

- The application will work without audio files (gracefully fails)
- Audio may not autoplay on some browsers due to autoplay policies
- Users may need to interact with the page first for audio to play
- All audio plays with proper volume levels set in the code

## License Compliance

When using audio from these sources:
- **Mixkit**: Free under Mixkit License (no attribution required)
- **Freesound**: May require attribution (check individual file)
- **Looperman**: Free for commercial/non-commercial use
- **Uppbeat**: Free for personal projects

Always verify the license for each specific file you download.

---

**Status**: ⚠️ Audio files not yet downloaded  
**Action Required**: Download and place the three MP3 files in this directory

Once completed, update this file with:
```
**Status**: ✅ Audio files installed
```
