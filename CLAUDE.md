# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Games

No build step. Open any file directly in a browser:

```
open shooter.html
open tictactoe.html
```

## Git Workflow

After every code change: commit with a clean message and push to GitHub.

```bash
git add <specific-files>
git commit -m "descriptive message"
git push
```

Remote: `https://github.com/averyamidon12/sector-zero` (branch: `main`)

## Project Structure

Two self-contained single-file browser games. All HTML, CSS, JS, and assets live inside one `.html` file each — no external dependencies, no build tools, no image files.

- `shooter.html` — Sector Zero, the main game (~1,200 lines)
- `tictactoe.html` — 2-player Tic Tac Toe

## Sector Zero Architecture (`shooter.html`)

The script is divided into 15 numbered sections in order:

| # | Section | Purpose |
|---|---------|---------|
| 1 | Constants & Config | `W`, `H`, speeds, timings, `PAL` color palette |
| 2 | Level Data | `LEVELS[]` declarative wave configs |
| 3 | Canvas & Context | Canvas setup, `resize()` for window scaling |
| 4 | Input System | `keys{}` map, `mouse{x,y,down,justPressed}` |
| 5 | Audio | Web Audio API procedural synth (`playTone`, `playNoise`, `sfx*`) |
| 6 | Particle System | Flat `particles[]` array, `spawnExplosion/Impact/Muzzle` |
| 7 | Sprite Draw Helpers | `drawPlayer`, `drawEnemy`, `drawBullet`, `drawBackground`, `drawCursor` |
| 8 | Entity Classes | `Player`, `Enemy`, `Bullet` |
| 9 | Collision Detection | `circlesOverlap`, `runCollision` |
| 10 | HUD | HP bar, ammo strip, score, wave/level indicator |
| 11 | Screen Renderers | `drawMenu`, `drawWaveClear`, `drawLevelClear`, `drawVictory`, `drawGameOver` |
| 12 | CRT Overlay | Pre-rendered offscreen canvas (scanlines + vignette), stamped each frame |
| 13 | Game State & Wave Manager | State machine globals, `startGame`, `startWave`, `nextWave`, `updateSpawns` |
| 14 | Main Game Loop | `requestAnimationFrame` loop, `dt` capped at 50ms, state dispatch |
| 15 | Bootstrap | `initMenuParticles()`, first `requestAnimationFrame` call |

### Global State (Section 13)

All mutable game state lives as module-level `let` variables:

```js
state         // 'menu' | 'playing' | 'waveClear' | 'levelClear' | 'victory' | 'gameOver'
currentLevel  // index into LEVELS[]
currentWave   // index into LEVELS[currentLevel].waves[]
score         // running total
enemies[]     // active Enemy instances
bullets[]     // active Bullet instances (both player and enemy)
particles[]   // flat particle objects (not class instances)
player        // Player instance (null on menu)
spawnQueues[] // active spawn timers for the current wave
bossFlash     // countdown for red boss-warning overlay
```

`mouse.justPressed` is consumed (set to `false`) at the end of every frame to prevent multi-frame triggers.

### Level Data Format

```js
LEVELS = [
  { name: 'SECTOR 1', waves: [
    { spawns: [{ type: 'runner', count: 5, interval: 1.4 }] },
    { spawns: [{ type: 'runner', count: 7, interval: 1.1 },
               { type: 'scout',  count: 2, interval: 1.8 }] },
    { spawns: [...], isBoss: true },  // triggers red flash + "! BOSS WAVE !"
  ]},
]
```

Multiple entries in `spawns` run concurrently with independent timers. `interval` is seconds between individual enemy spawns within that entry.

### Enemy Types

| Type | Radius | HP | Speed | Behavior |
|------|--------|----|-------|----------|
| `runner` | 10 | 30 | 92 | Straight line to player |
| `scout` | 8 | 15 | 155 | Jitters ±63° off player direction every 0.3–0.8s |
| `tank` | 16 | 120 | 46 | Straight; red tint below 50% HP; barrel tracks player |
| `ranged` | 10 | 25 | 68 | Maintains 190px preferred distance; shoots every 2–4s; charges red before firing |

All enemy behavior is type-switched inside `Enemy.update()` — no subclasses.

### Rendering Pipeline (each frame)

1. `ctx.clearRect`
2. `drawBackground(gameTime)` — scrolling dark grid
3. `drawParticles()`
4. `e.draw()` for each enemy
5. `b.draw()` for each bullet
6. `player.draw()`
7. HUD / screen overlay for current state
8. `drawCRT()` — offscreen scanline canvas + chromatic fringe (always last, above everything)
9. `drawCursor()` — crosshair at `mouse.x/y`

### Sprites

All sprites are drawn procedurally with Canvas 2D API — no image files. Colors come from the `PAL` object (Section 1). Animations are math-based (`Math.sin(animT * speed)`) rather than frame arrays.

- Player body/head/gun rotate together via `ctx.rotate(player.angle)` (faces mouse); legs are drawn before the rotate so they stay upright.
- `drawEnemy` dispatches on `e.type`; enemies carry `animT`, `hitFlash`, and `angleToPlayer` fields used by their draw cases.
- CRT scanlines are rendered once to an offscreen canvas at startup and `drawImage`'d each frame (avoids 300 `fillRect` calls per frame).

### Audio

`AudioContext` is created lazily on first user gesture (`initAudio()` called from `startGame`). All sounds are synthesized: `playTone(freq, dur, type, vol, sweep)` for oscillator sounds, `playNoise(dur, vol)` for white noise bursts.

### Color Palette

All colors are defined in `PAL` at the top of Section 1. When adding new visual elements, add entries to `PAL` rather than using inline hex strings.

### High Score

Stored in `localStorage` under key `'sz_hs'`. Written on game over and on victory.
