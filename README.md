# Vector Rocks

A browser-based, **Deluxe-style vector shooter**: inertia flight, breaking asteroids, shields, hyperspace, hostile saucers, and a high score saved locally. Built with **TypeScript**, **Vite**, and the **Canvas 2D** API—no game engine, small bundle, runs anywhere you can host static files.

**Fan tribute.** Vector Rocks is inspired by classic late-70s / early-80s coin-op vector games. It is **not** affiliated with any rights holder, and it does not use original ROM assets, logos, or sampled audio.

---

## Play

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`), then press **Space** or **Enter** to start.

---

## Controls

| Action | Keys |
|--------|------|
| Start (title) / Restart (game over) | **Space**, **Enter** |
| Rotate | **←** **→** or **A** **D** |
| Thrust | **↑** or **W** |
| Fire | **Space** (up to 4 shots on screen) |
| Shield | **Shift** (hold; uses energy, recharges) |
| Hyperspace | **X** (cooldown; small chance of a bad jump) |
| Pause | **P** |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve `dist/` locally (good check before deploy) |

**Requirements:** [Node.js](https://nodejs.org/) 20+ recommended (LTS).

---

## Deploying (e.g. GitHub Pages)

The output is static: deploy the **`dist/`** folder after `npm run build`.

If the site is served from a **subpath** (e.g. `https://user.github.io/vector-rocks/`), set Vite’s [`base`](https://vite.dev/config/shared-options.html#base) to that path (e.g. `'/vector-rocks/'`) in `vite.config.ts`, rebuild, then publish `dist/`. For a **custom domain** or a **user** GitHub Pages site at the domain root, the default base `/` is usually correct.

---

## Project layout

```
src/
  main.ts              # Canvas + game loop bootstrap
  game/                # Loop, constants, main Game orchestration
  entities/            # Ship, bullets, asteroids, saucers
  systems/             # Input, collision, spawning
  render/              # Canvas drawing (vector look, HUD, title)
  audio/               # Web Audio beeps
```

---

## License

This repository is marked **private** in `package.json`. Add a `LICENSE` file if you open-source the project.
