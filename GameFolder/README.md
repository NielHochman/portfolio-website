# Under The Sea — Tech Art Reskin Documentation

## Project Overview

Reskin of a simple HTML "Lane Runner" game into a polished "Under The Sea" underwater mobile game. The original used Canvas 2D primitives (rectangles, circles, X marks). The final version uses custom sprite assets, parallax backgrounds, character animation, particle effects, audio system, and a fully themed canvas UI.

## File Structure

```
GameFolder/
├── Game.html              # Complete game (single-file, HTML + CSS + JS)
├── _serve.js              # Local dev server (Node.js, port 9191, range request support)
├── Assets/                # Original AI-generated assets (high-res source files)
│   ├── Bg_layer_1_back.jpg.png
│   ├── Bg_layer_2_mid.png.png
│   ├── Coin.png.png
│   ├── Gem.png.png
│   └── mine.png.png
├── assets_opt/            # Optimized game assets (compressed + transparency fixed)
│   ├── bg_back.png        # 800×1200 — static underwater background
│   ├── reef.png           # 233×350 — coral reef overlay (bottom-right, 55% opacity)
│   ├── fish_mid.png       # 240×155 — fish neutral pose (2× res)
│   ├── fish_up.png        # 240×181 — fish tail up (2× res)
│   ├── fish_down.png      # 240×182 — fish tail down (2× res)
│   ├── fish_hit.png       # 251×240 — fish hit reaction pose (2× res)
│   ├── coin.png           # 200×199 — gold star coin collectible
│   ├── gem.png            # 185×200 — purple gem rare collectible
│   ├── mine.png           # 196×200 — spiked sea mine obstacle
│   ├── anchor.png         # 100×140 — decorative anchor (special event)
│   ├── coin_ui.png        # 475×235 — coin score HUD banner
│   ├── gem_ui.png         # 475×236 — gem score HUD banner
│   ├── heart.png          # 100×86  — life heart icon
│   ├── title_bg.jpg       # 800×1200 — title screen splash
│   ├── play_btn.png       # 200×199 — play button
│   ├── gameover_panel.png # 400×605 — gold-framed Game Over panel
│   ├── restart_btn.png    # 200×72  — gold Restart button
│   └── victory_panel.png  # 400×650 — gold-framed Victory panel
├── Sounds/                # Audio assets
│   ├── UnderTheSea_bg_sound.mp3  # Background music (loops)
│   ├── Coin_collect.mp3          # Coin collect SFX
│   ├── Gem_collect.mp3           # Gem collect SFX
│   └── Hitsound.wav              # Mine hit SFX
├── compress-assets.js     # Node.js asset pipeline script (sharp)
├── package.json
└── README.md              # This file
```

## How to Run

Start the local dev server (required for asset loading and audio):

```bash
cd GameFolder
node _serve.js
# then open http://localhost:9191
```

Controls: Arrow keys or A/D (keyboard), tap left/right halves or swipe (mobile).

**Win condition:** Collect 100 coins. **Lose condition:** Lose all 3 lives from mine hits.

---

## Task 1: Asset Pipeline & Image Loader

### Asset Problem

All assets from Nano Banana arrived at 2816x1536 with a critical defect: the transparency checkerboard was baked into the pixel data as solid grey pixels (alpha = 255 everywhere, 0% actual transparency). Total size: ~65 MB.

### Asset Pipeline (compress-assets.js)

Built a Node.js batch processor using `sharp` with two background-removal strategies:

**Saturation-based removal (sprites):**
Grey background has HSV saturation near 0. Coloured content (orange fish, gold coin, purple gem) has high saturation. Any pixel with `sat < 0.08` becomes transparent, with a `0.06` feather zone for anti-aliased edges.

> **Fix: Correcting Alpha Channel Artifacts in AI-Generated Sprites**
> The initial saturation-only approach made the clownfish's white stripes transparent because pure white (R=G=B=255) also has zero saturation. Analysis showed 98,844 bright pixels were being wrongly removed. The fix adds a **brightness guard**: pixels brighter than `val > 0.92` (HSV value) are preserved regardless of saturation, while a dark guard (`val < 0.15`) protects outlines. Brightness distribution analysis confirmed a clean separation — speckles cluster at val 0.80-0.85, true white stripes at val 0.95-1.00 — so the 0.92 threshold eliminates all background speckles while keeping every stripe pixel intact.

**Distance + saturation hybrid (background layers):**
Samples average grey from 6 edge regions of the resized image, then removes pixels within Euclidean colour-distance OR with near-zero saturation (`sat < 0.04`). Alpha clamping (`alpha < 80 → 0`) eliminates ghost pixels from resize interpolation.

**Critical pipeline order:** Resize FIRST, then remove background. Processing at original resolution and then resizing creates new interpolated grey values that escape the removal tolerance.

Result: 65 MB → ~5.4 MB (92% reduction).

### Image Loader (in Game.html)

Promise-based loader iterates over an 18-asset manifest, creates `new Image()` for each, and resolves when all `onload` callbacks fire. A themed loading screen with animated progress bar shows percentage and asset name. The game loop does NOT start until the promise resolves. Failed assets are tracked separately — if any fail, the promise rejects and an error message is shown.

---

## Task 2: Parallax Background

Two static layers drawn every frame in `drawParallax()`:

| Layer | Asset | Behaviour | Purpose |
|-------|-------|-----------|---------|
| bg_back | 800×1200 underwater scene | Static, covers full canvas | Base environment with light rays |
| reef | 233×350 coral reef | Static, bottom-right, 55% opacity | Blended foreground decoration |

The reef is positioned at `(W - 150 + 30, H - 225 + 20)` with `globalAlpha = 0.55` to blend naturally with the background.

---

## Task 3: Fish Character Animation

Five animation systems run simultaneously:

### a) Idle Bob (Sine Wave)
```
y_offset = 5 * sin(time * 0.004)
```
Amplitude = 5px, frequency = 0.004. Creates gentle vertical oscillation so the fish never looks static.

### b) Swimming Frame Cycle
Cycles through `[fish_mid, fish_up, fish_mid, fish_down]` every 150ms. The mid frame appears twice so the tail spends more time in neutral — this looks more natural than equal distribution. Creates a tail-wagging swimming loop.

### c) Smooth Lane Movement (Lerp)
```
visualX += (targetX - visualX) * 0.14
```
Instead of snapping to the target lane, the visual X position interpolates 14% of the remaining distance each frame. This produces an ease-out curve: fast initial movement that decelerates smoothly.

### d) Sprite Flipping
```js
if (faceRight) ctx.scale(-1, 1);
```
The source sprite faces left by default. Canvas transform applied before drawing flips it when moving right. `ctx.save()`/`ctx.restore()` isolates the transform.

### e) Hit Reaction
When the fish collides with a mine, `S.hitTimer` is set to 400ms. During this period, `fish_hit.png` (a distinct hit reaction pose) replaces the normal swim frame. The timer decrements by `dt` each frame and smoothly returns to normal animation.

---

## Task 4: Feedback & Particles

### Sprite-Based Objects
Coins (26×26), gems (26×26), and mines (38×39) render their image sprites via `ctx.drawImage()`. Each object has:
- `rotation` + `rotationSpeed` for slow spinning
- `sin(phase) * 2` horizontal wobble for organic movement

### Gem Glow Effect
Gems have a 3-layer glow effect:
1. Radial gradient halo behind the gem (pulsing purple)
2. Canvas `shadowBlur` glow on the sprite
3. Three orbiting white sparkle dots

### Particle Burst System
On collision, `spawnParticles(x, y, colour, count)` creates particles with:
- Position (x, y), velocity (vx, vy), life (1.0 → 0.0), decay rate, size
- 50% bubbles: float upward (`vy -= 0.04`), drawn as hollow circles with highlight
- 50% sparkles: fall with gravity (`vy += 0.07`), drawn as 4-point stars
- `ctx.globalAlpha = life` for natural fade-out
- Spliced from array when `life <= 0` to prevent memory leaks

Particle colours: gold (`#ffd700`) for coins, purple (`#c77dff`) for gems, red (`#ff6b6b`) for mines.

### Squash & Stretch
- **Collect:** `scaleX = 1.35, scaleY = 0.7` (horizontal stretch = happy bounce)
- **Hit:** `scaleX = 0.7, scaleY = 1.35` (vertical squash = impact)
- **Lane switch:** `scaleX = 1.2, scaleY = 0.85` (darting stretch)
- **Recovery:** `sqX += (1 - sqX) * 0.14` — lerps back to (1,1) with spring-back feel

---

## Task 5: UI & Polish

### CSS Theme
- **Page background:** Deep ocean gradient (`#0a1628` → `#1a5276`)
- **Canvas:** 16px rounded corners, blue glow `box-shadow`
- **Font:** Google Fonts "Fredoka" — rounded, bubbly, mobile-game feel
- **Buttons:** Ocean gradient (`#00b4d8` → `#0077b6`), hover/active scale transitions

### Canvas HUD
All HUD elements are drawn directly on the canvas (no HTML overlays):

- **Coin banner** (top-left): Shows coin count with pop animation on collect
- **Gem banner** (centered): Shows gem count with pop animation on collect
- **Heart icons** (top-right): 3 hearts using `heart.png`, full opacity = alive, 25% = lost
- **Rolling counters:** `displayCoins`/`displayGems` lerp toward actual values for smooth number changes
- **Pop animation:** Banners scale to 1.12× on collect, decay via `*= 0.85`

### Heart Loss Animation
When the player loses a life, the corresponding heart plays a dramatic animation:
- **Phase 1 (pop):** Heart scales up to 1.6× with a red flash glow
- **Phase 2 (shatter):** Heart spins, shrinks, and fades away while floating upward
- **Particles:** 8 red particles burst from the heart position
- The heart is excluded from normal drawing during its animation to prevent double-rendering

### Canvas Game Over Panel
When all lives are lost, a canvas-drawn panel replaces the HTML overlay:
- Dark backdrop (`rgba(5, 15, 40, 0.82)`) with fade-in animation
- `gameover_panel.png` with coin/gem score text on dark bars (icon + text centered as a group)
- `restart_btn.png` — clicking restarts directly into a new game (no title screen)

### Canvas Victory Panel
When 100 coins are collected:
- Same approach as Game Over panel but uses `victory_panel.png`
- Dark rounded boxes behind score text for readability
- Restart button returns directly to gameplay

### Responsive Design
- Container: `aspect-ratio: 2/3` with `max-width: 100vw`
- Canvas: `width: 100%; height: 100%` CSS scaling (internal resolution stays 400×600)
- High-DPI support: Canvas backing store scales by `devicePixelRatio` for crisp rendering on Retina displays
- `@media (max-width: 420px)`: removes border-radius for full-bleed mobile
- `@media (max-height: 660px)`: locks to viewport height
- Uses `100dvh` (dynamic viewport height) for mobile browser chrome

### Touch Controls
- Tap left/right halves of canvas to move
- Swipe detection (20px threshold) as alternative input
- Animated hint text ("Tap sides to move") hides after first touch interaction

---

## Audio System

### Background Music
- `UnderTheSea_bg_sound.mp3` loops continuously from the title screen
- Volume: 0.4
- Browser autoplay policy handled via unlock listener — music starts on first user click/touch

### Sound Effects
| Sound | Trigger | Volume |
|-------|---------|--------|
| `Coin_collect.mp3` | Coin collected | 0.6 |
| `Gem_collect.mp3` | Gem collected | 0.6 |
| `Hitsound.wav` | Mine collision | 0.7 |

SFX use a `playSFX()` helper that resets `currentTime` to 0 before playing, allowing rapid re-triggering without waiting for the previous play to finish.

---

## Visual Effects

### Coin Collect Glow
When the fish collects a coin or gem, a golden glow effect activates for ~15 frames:
- `ctx.shadowBlur = 20` with `shadowColor = '#ffd700'`
- `ctx.filter = 'brightness(1.5)'`
- Counts down frame by frame and clears automatically

### Mine Hit Red Flash
When the fish hits a mine, a red damage flash activates for ~20 frames (higher priority than coin glow):
- `ctx.shadowBlur = 30` with `shadowColor = 'red'`
- `ctx.filter = 'drop-shadow(0 0 10px red) brightness(1.2) sepia(1) hue-rotate(-50deg)'`
- Combined with the hit reaction pose for maximum impact feedback

### God Rays + Frenzy Mode
Three tapered light shafts drawn with `globalCompositeOperation = 'lighter'`:
- **Normal:** White rays, slow pulse, subtle alpha (0.035 base)
- **Frenzy:** Gold-tinted rays, 3× faster pulse, 2.6× alpha
- **Activation:** 3+ coin/gem collects within 2 seconds triggers frenzy for ~120 frames

### Special Events — Anchor Drop
A one-time decorative event per game session:
- Spawns after 20 seconds (random chance, guaranteed by 40 seconds)
- Large anchor (65×90) falls slowly at 0.8 px/frame
- Emits rising bubble particles every ~8 frames from its position
- Purely decorative — no collision with the player

---

## Game Juice — Procedural Micro-Interactions

### 1. Bubble Trail System
The fish emits small semi-transparent bubbles from its tail every ~66ms. Each bubble floats upward with sinusoidal wobble and fades from alpha 0.4 over ~1 second.

### 2. Ambient Bubbles
18 persistent background bubbles rise slowly across the full canvas. Each has randomized speed (0.25–0.95 px/frame), size (1–4.5px), wobble phase, and opacity (0.08–0.30). They recycle from the bottom when reaching the top.

### 3. Screen Shake
`shake(14, 6)` on mine hit — 14-frame rumble with 6px initial intensity, decaying at `*= 0.92` per frame. Applied inside the clip region so no pixels escape the canvas.

### How These Micro-Interactions Improve User Engagement (UX)

**Immediate feedback loops:** Screen shake, red flash, hit sound, and heart animation provide instant multi-sensory confirmation of damage. Score pop and golden glow confirm collection. Players don't need to check the HUD — the screen *reacts*.

**Perceived responsiveness:** Squash/stretch makes the fish feel weighty and physical. The 1.2× horizontal stretch during lane switches and 1.35× on collection create anticipation and follow-through — the same animation principles Disney codified for character animation.

**Environmental immersion:** The bubble trail transforms a static sprite into a living creature. Ambient bubbles and god rays maintain the underwater atmosphere even during idle moments.

**Reward escalation:** The frenzy system creates a positive feedback cascade — rapid collecting triggers gold-tinted, faster-pulsing god rays. The 3-collect-in-2-seconds threshold is achievable but not guaranteed, creating engagement through variable ratio reinforcement.

**Zero gameplay cost:** All visual systems are purely cosmetic — they don't affect collision, scoring, or difficulty. They can be tuned freely without rebalancing the game.

---

## Optimization Techniques

1. **Asset compression:** 65 MB → ~5.4 MB via resize + PNG level 9 compression
2. **Single-file architecture:** Zero framework overhead, instant parse
3. **requestAnimationFrame:** Vsync-aligned rendering, no wasted frames
4. **High-DPI canvas:** `devicePixelRatio` scaling for crisp rendering without doubling draw calls
5. **Array splicing:** Objects and particles removed when expired, keeping arrays small
6. **Canvas save/restore:** Used only where transforms are needed (fish flip, object rotation, heart animation)
7. **Delta-time animation:** Frame cycling uses elapsed ms, consistent at any framerate
8. **CSS scaling:** Internal 400×600 resolution for consistent collision math; CSS handles display scaling
9. **Image smoothing:** `imageSmoothingEnabled = true` with `quality = 'high'` for clean downscaling from 2× resolution sprites
10. **Viewport clipping:** `ctx.clip()` at frame start prevents any sprite or parallax layer from bleeding outside the canvas
