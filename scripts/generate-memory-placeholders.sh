#!/bin/bash

# Valentine's Future Memory Image Placeholder Generator
# Creates SVG placeholder images for all 10 memories

MEMORIES_DIR="/app/frontend/public/memories"
mkdir -p "$MEMORIES_DIR"

# Memory titles and colors
declare -A MEMORIES=(
  ["first-meet"]="First Meet|#ec4899"
  ["first-trip"]="First Trip|#8b5cf6"
  ["code-night"]="Code Night|#3b82f6"
  ["stargazing"]="Stargazing|#22c55e"
  ["kitchen-dance"]="Kitchen Dance|#f97316"
  ["movie-night"]="Movie Night|#ef4444"
  ["sunrise"]="Sunrise|#fbbf24"
  ["bookmark"]="Bookmark|#a855f7"
  ["future-plans"]="Future Plans|#06b6d4"
  ["right-now"]="Right Now|#f43f5e"
)

# Function to create SVG placeholder
create_placeholder() {
  local filename=$1
  local title=$2
  local color=$3
  
  cat > "$MEMORIES_DIR/${filename}.jpg" << EOF
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${filename}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="800" fill="url(#grad-${filename})" />
  
  <!-- Stars effect -->
  <circle cx="100" cy="100" r="2" fill="#ffffff" opacity="0.8"/>
  <circle cx="300" cy="150" r="1.5" fill="#ffffff" opacity="0.6"/>
  <circle cx="500" cy="200" r="2.5" fill="#ffffff" opacity="0.7"/>
  <circle cx="700" cy="120" r="1" fill="#ffffff" opacity="0.9"/>
  <circle cx="900" cy="180" r="2" fill="#ffffff" opacity="0.5"/>
  <circle cx="1100" cy="140" r="1.5" fill="#ffffff" opacity="0.8"/>
  <circle cx="200" cy="600" r="2" fill="#ffffff" opacity="0.6"/>
  <circle cx="400" cy="650" r="1.5" fill="#ffffff" opacity="0.7"/>
  <circle cx="600" cy="700" r="2.5" fill="#ffffff" opacity="0.8"/>
  <circle cx="800" cy="620" r="1" fill="#ffffff" opacity="0.9"/>
  <circle cx="1000" cy="680" r="2" fill="#ffffff" opacity="0.5"/>
  
  <!-- Central content area -->
  <rect x="200" y="300" width="800" height="200" rx="20" fill="#000000" opacity="0.3"/>
  
  <!-- Title -->
  <text x="600" y="380" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${title}
  </text>
  
  <!-- Subtitle -->
  <text x="600" y="440" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" opacity="0.8" text-anchor="middle">
    A Memory to Cherish
  </text>
  
  <!-- Heart icon -->
  <path d="M600 460 L610 470 L600 480 L590 470 Z" fill="${color}" opacity="0.8"/>
  <circle cx="595" cy="468" r="7" fill="${color}" opacity="0.8"/>
  <circle cx="605" cy="468" r="7" fill="${color}" opacity="0.8"/>
</svg>
EOF
  
  echo "Created placeholder: ${filename}.jpg"
}

# Generate all placeholders
for key in "${!MEMORIES[@]}"; do
  IFS='|' read -r title color <<< "${MEMORIES[$key]}"
  create_placeholder "$key" "$title" "$color"
done

echo ""
echo "✅ All 10 placeholder images created in $MEMORIES_DIR"
echo ""
echo "Note: These are SVG placeholders. Replace with actual photos for best experience."
echo "Rename your photos to match these filenames and place them in $MEMORIES_DIR"
