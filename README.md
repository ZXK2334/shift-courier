# Shift Courier

A short original browser arcade flight game for [GitHub Game Off 2026](https://itch.io/jam/game-off-2026). Theme: **SHIFT**. A courier flies a low route toward the last relay. Switch between two lanes to dodge marked barriers and deliver your cargo. One authored 52-second run, 28 gates, three hull points.

## Play

Open `index.html` in a current browser or serve the directory with any static file server. No installation, runtime dependencies, or network requests are needed. Click **Launch flight**. Use **Shift** (either key) or the visible **SHIFT** button to swap lanes. Press **P** or **Esc** to pause; click **Resume flight** to continue. The sound button is opt-in.

## Source

- `flight.js`: route, fixed time progression, state transitions, collision and hull logic.
- `game.js`: canvas rendering, browser input, HUD and procedural Web Audio.
- `index.html` and `style.css`: layout and UI.
- `core.test.cjs` and `runtime.test.cjs`: Node model tests and production-script interaction tests in a simulated DOM/Canvas.

Run `node --test core.test.cjs runtime.test.cjs`.

## Credits and AI disclosure

The flight-game direction and Shift lane-swap mechanic were approved by the entrant. OpenAI Codex was used to develop and test the game's source, procedural visuals, and procedural audio. Inspired by the immediacy of arcade flight games, including *Towards The Sunrise* as a reference; no code, meshes, images, sounds or text were copied from it or from other games. No film IP, fonts, external libraries, or shipped third-party assets are used. Browser system fonts are used.

## itch.io packaging

Upload the HTML5 ZIP as **HTML** and mark it as playable in the browser. Its root contains `index.html`, `style.css`, `flight.js`, and `game.js`. Publish a public GitHub source repository and link it to the itch.io page before entering the separate Game Off submission. Do not claim the jam entry is submitted until the jam entry appears.
