# Vector Rocks

A browser-based, **Deluxe-style vector shooter**: inertia flight, breaking asteroids, shields, hyperspace, hostile saucers, and a high score saved locally. Built with **TypeScript**, **Vite**, and the **Canvas 2D** API—no game engine, small bundle, runs anywhere you can host static files.

**Fan tribute.** Vector Rocks is inspired by classic late-70s / early-80s coin-op vector games. It is **not** affiliated with any rights holder, and it does not use original ROM assets, logos, or sampled audio.

---

## Play

| | |
| :-- | :-- |
| **Live (GitHub Pages)** | [**Play on GitHub Pages →**](https://vedjuk.github.io/Vector-Rocks/) |
| **Local** | See below |

Open the live link or run locally, then press **Space** or **Enter** to start.

```bash
npm install
npm run dev
```

Vite prints a URL (usually `http://localhost:5173`).

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

## Deploying

**GitHub Pages (this repo):** Pushes to `main` run [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)—`npm ci`, `npm run build`, then publish `dist/`. In the repo **Settings → Pages**, set **Source** to **GitHub Actions**.

`vite.config.ts` sets [`base`](https://vite.dev/config/shared-options.html#base) to `/Vector-Rocks/` so asset URLs match `https://vedjuk.github.io/Vector-Rocks/`. If you fork or rename the repo, update `base` to `/<your-repo-name>/` (with trailing slash), rebuild, and push.

**Other hosts:** After `npm run build`, upload the contents of **`dist/`** anywhere that serves static files. For a site at the domain root (not a subpath), use `base: '/'`.

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

This project is licensed under the [MIT License](LICENSE).

Permission is hereby granted to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions in the license file. **The software is provided “as is,” without warranty of any kind.**

The MIT license applies to **this project’s source code and assets** only. It does not grant any rights in third-party trademarks or in the classic games that inspired this tribute.
