# Sky Runner 3D

A lightweight browser game built with HTML/CSS/JS + Three.js.

## Features

- First-person movement with mouse look + jump physics.
- Collectible coins, animated hazards, win/lose states.
- Procedural textures recreated to match the provided sky, brick, grass, and tile assets.

## Easiest way to play (no terminal knowledge needed)

- **Windows:** double-click `start-game.bat`
- **Mac / Linux:** double-click `start-game.sh` (or run `./start-game.sh`)

This starts a local server and opens your browser.

## Manual run>>>>>>> main

For best pointer-lock behavior, serve locally:

```bash
python3 -m http.server 8080
# open http://localhost:8080/sky-runner-3d/
```

## Controls

- `WASD` / Arrow keys: move
- Mouse: look around
- `Space`: jump
