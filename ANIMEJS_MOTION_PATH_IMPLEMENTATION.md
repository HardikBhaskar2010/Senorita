# Anime.js Motion Path Implementation

## Overview
This document explains the implementation of Anime.js v4 with React, including the motion path animation feature using `svg.createMotionPath()`.

## Implementation Details

### File: `/app/frontend/src/components/valentine/AnimatedHeartBg.tsx`

This component demonstrates proper usage of Anime.js v4 with React, including:
1. **createScope** - Proper scoping of animations to React components
2. **createMotionPath** - Animating elements along SVG paths
3. **Cleanup** - Proper cleanup using `scope.revert()`

## Key Features

### 1. Proper React Integration

```typescript
import { animate, createScope, svg } from 'animejs';

useEffect(() => {
  if (!rootRef.current) return;

  // ✅ CORRECT: Pass DOM element, not ref object
  scope.current = createScope({ root: rootRef.current }).add((self) => {
    // All animations scoped here
  });

  // Cleanup on unmount
  return () => scope.current?.revert();
}, []);
```

### 2. Motion Path Animation

The component includes 6 small hearts that animate along different SVG paths:

**Motion Paths:**
1. **Circular motion** - Top left circular pattern
2. **Wave motion** - Horizontal wave across the top
3. **Diagonal swoosh** - Diagonal path from top-right to bottom-left
4. **Bottom wave** - Horizontal wave at the bottom
5. **Figure-8 pattern** - Infinity loop in the center
6. **Vertical loop** - Right side vertical circular motion

**Implementation:**
```typescript
// Get motion path values (translateX, translateY, rotate)
const motionPathValues = svg.createMotionPath(path as SVGPathElement);

// Apply to element
animate(smallHeart, {
  ...motionPathValues,  // Spreads translateX, translateY, rotate
  duration: 8000 + (index * 1000),
  easing: 'linear',
  loop: true,
  delay: index * 500,
});
```

### 3. Multiple Animation Layers

The component features three layers of animation:

**Layer 1: Background Heart**
- Scale pulsing (1 → 1.15 → 1)
- Opacity breathing (0.15 → 0.25 → 0.15)
- Slow rotation (360° over 60 seconds)
- Subtle position movement

**Layer 2: Motion Path Hearts (NEW)**
- 6 small hearts following SVG paths
- Each heart has unique path and timing
- Includes scale pulsing (1 → 1.3 → 1)
- Opacity variation (0.6 → 1 → 0.6)

**Layer 3: Static Floating Hearts**
- 8 CSS-animated hearts using Tailwind's `animate-pulse`
- Random positioning across the screen
- Staggered animation delays

## SVG Path Definitions

All motion paths are invisible (`stroke="none"`) but provide the coordinates for animations:

```tsx
<path
  className="motion-path"
  d="M 300,200 Q 400,100 500,200 T 700,200 Q 600,300 500,200 T 300,200 Z"
  fill="none"
  stroke="none"
/>
```

## Animation Parameters

### Motion Path Hearts
- **Duration**: 8-14 seconds (varies per heart)
- **Easing**: Linear (for smooth path following)
- **Loop**: Infinite
- **Delay**: 0-2.5 seconds (staggered start)

### Pulsing Effect
- **Duration**: 2 seconds
- **Scale**: 1 → 1.3 → 1
- **Opacity**: 0.6 → 1 → 0.6
- **Easing**: inOut(2)

## Browser Compatibility

✅ Works with all modern browsers supporting:
- SVG paths
- CSS transforms
- ES6+ JavaScript

## Performance Considerations

- All animations use `transform` and `opacity` (GPU-accelerated)
- Motion paths are hidden (no rendering overhead)
- Scoped animations ensure proper cleanup
- No memory leaks with proper `revert()` cleanup

## Testing

To verify the implementation:
1. Navigate to Valentine's Special page
2. Check browser console for errors
3. Observe small hearts moving along various paths
4. Verify no Anime.js errors in console

## Benefits of createMotionPath

1. **Automatic calculation** - No manual path coordinate calculations
2. **Smooth motion** - Natural movement along curves
3. **Rotation included** - Elements rotate to follow path direction
4. **Simple API** - Just pass SVG path element

## Common Issues & Solutions

### Issue: Motion paths not working
**Solution**: Ensure SVG viewBox matches coordinate system used in path definitions

### Issue: Hearts not visible
**Solution**: Check that path coordinates are within the visible viewport

### Issue: Jerky animation
**Solution**: Use `easing: 'linear'` for smooth path following

## References

- [Anime.js v4 Documentation](https://animejs.com)
- [React Integration Guide](https://animejs.com/documentation/#usingWithReact)
- [SVG createMotionPath API](https://animejs.com/documentation/#svgCreateMotionPath)
