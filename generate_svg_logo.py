# Let's generate a pixel-perfect SVG matching the exact uploaded artwork:
# 1. Dark green squircle background (#163d27 / #11341e gradient)
# 2. Crisp white open power standby circle
# 3. Lightning bolt in the top vertical position replacing the vertical bar of the standby switch:
#    - Top sharp point pointing upward, jagged stepped sides, bottom point extending into the center of the circle!
# 4. Realistic green leaf hugging the bottom-right arc:
#    - Natural leaf silhouette with curved tip pointing upward-right
#    - Central leaf vein and delicate side veins
#    - Rich gradient from lime/emerald to darker forest green
#    - Subtle drop shadow on the leaf over the white ring!

svg_content = '''<svg viewBox="0 0 512 512" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient (Dark Forest Green) -->
    <radialGradient id="bgGrad" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#1e4b30"/>
      <stop offset="60%" stop-color="#153b24"/>
      <stop offset="100%" stop-color="#0d2817"/>
    </radialGradient>

    <!-- Inner Glow / Bevel on Squircle -->
    <linearGradient id="squircleBorder" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a6341" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#081e10" stop-opacity="0.8"/>
    </linearGradient>

    <!-- Leaf Gradients & Shadows -->
    <linearGradient id="leafGrad" x1="20%" y1="20%" x2="90%" y2="90%">
      <stop offset="0%" stop-color="#84cc16"/>
      <stop offset="40%" stop-color="#4ade80"/>
      <stop offset="85%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>

    <linearGradient id="leafUnderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="leafShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="-2" dy="4" stdDeviation="5" flood-color="#051a0e" flood-opacity="0.7"/>
    </filter>

    <filter id="symbolShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Squircle Base Icon (Rounded Rectangle edge-to-edge without white borders) -->
  <rect x="16" y="16" width="480" height="480" rx="120" ry="120" fill="url(#bgGrad)" stroke="url(#squircleBorder)" stroke-width="4"/>

  <!-- Main Power Circle (White with top gap) -->
  <!-- Center: 256, 268. Radius: ~128. Thickness: 34. Gap at top for lightning bolt: 65 degrees each side -->
  <!-- Arc path from angle 50 deg to 310 deg -->
  <g filter="url(#symbolShadow)">
    <path d="M 224 186
             A 115 115 0 1 0 326 210"
          fill="none"
          stroke="#FFFFFF"
          stroke-width="32"
          stroke-linecap="round"
          stroke-linejoin="round"/>

    <!-- Lightning Bolt (Centered at X=256, vertically piercing the power ring) -->
    <!-- Pointed top, zigzag notch, pointed bottom extending downward inside the ring -->
    <polygon points="256,142 267,194 250,224 268,224 248,272 253,222 238,222"
             fill="#FFFFFF"
             stroke="#FFFFFF"
             stroke-width="2"
             stroke-linejoin="miter"/>
  </g>

  <!-- Green Eco Leaf attached to bottom-right curve of the ring -->
  <g filter="url(#leafShadow)">
    <!-- Leaf Body -->
    <path d="M 256 350
             C 256 350, 262 290, 308 260
             C 334 244, 350 252, 354 278
             C 358 304, 342 344, 308 368
             C 282 386, 260 366, 256 350 Z"
          fill="url(#leafGrad)"
          stroke="#15803d"
          stroke-width="2"/>

    <!-- Main Central Vein -->
    <path d="M 258 348
             Q 296 312 346 266"
          fill="none"
          stroke="#bbf7d0"
          stroke-width="3"
          stroke-linecap="round"
          opacity="0.85"/>

    <!-- Secondary Veins -->
    <path d="M 280 334 Q 288 348 296 352" fill="none" stroke="#bbf7d0" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
    <path d="M 296 320 Q 308 334 318 338" fill="none" stroke="#bbf7d0" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
    <path d="M 314 304 Q 328 316 338 318" fill="none" stroke="#bbf7d0" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
    <path d="M 290 318 Q 288 302 294 290" fill="none" stroke="#bbf7d0" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
    <path d="M 310 298 Q 312 284 322 274" fill="none" stroke="#bbf7d0" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
  </g>
</svg>'''

with open("public/logo.svg", "w") as f:
    f.write(svg_content)
print("Logo SVG generated successfully!")
