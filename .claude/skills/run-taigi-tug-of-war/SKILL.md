---
name: run-taigi-tug-of-war
description: Launch, drive, and verify the 台語搶答拔河 (Taiwanese vocabulary tug-of-war buzzer game) static web app in this repo — plain HTML/CSS/JS, no build step, no framework. Use this whenever asked to run, test, screenshot, or verify a change to index.html/src/**/data/questions.js in this project.
---

# Running 台語搶答拔河

Single static page (`index.html` + `src/*.js` + `src/lib/*.js` + `data/questions.js`),
no build step, no `package.json`. Script load order matters (set in `index.html`):
`src/lib/romanize.js` → `data/questions.js` → `src/lib/questions.js` →
`src/game-state.js` → `src/keyboard.js` → `src/ui.js` → `src/settings.js` → `src/main.js`.

## Serve — you usually don't need to

The game loads its question bank via `<script src="data/questions.js">`
(not `fetch()`), specifically so `file://` works with **no server at all**.
Double-clicking `index.html` is a valid way to test it. Only spin up a server
if you want devtools' network panel or are testing something server-specific:

```bash
python -m http.server 8000   # optional; not required for the game to work
```

## Regenerating the question bank

`data/questions.js` (~3MB, committed to git) is generated from the MOE
Taiwanese dictionary open data. Regenerate it after changing
`data/build-questions.js`:

```bash
curl -L -o data/raw/dict-twblg.json \
  https://raw.githubusercontent.com/g0v/moedict-data-twblg/master/dict-twblg.json
node data/build-questions.js
```

`data/raw/` is gitignored (~8MB source dump); `data/questions.js` is not.

**Never edit `src/lib/romanize.js`.** It's vendored byte-for-byte from
`project_claude_TTS_SST/romanize.js` (sibling project, same parent folder).
If it needs updating, copy the source file over again — don't hand-edit the copy.

## Testing without a browser: logic tests via `vm`

Both `src/lib/romanize.js` and `src/lib/questions.js` are written as bare
browser globals (`const X = (() => {...})()`, no `module.exports`) — by
design, so they load as plain `<script>` tags. To exercise them from Node for
fast logic tests (question generation shape, `GameState` transitions), run
them through `vm` in one shared context, in load order, and append
`this.__NAME = NAME;` to any script whose top-level `const` you need to read
back from the Node side (top-level `const`/`class` in a vm-run script stays
in the context's lexical scope across multiple `runInContext` calls on the
same context — which is why loading order works without extra plumbing — but
does *not* automatically become a property of the context object; the
`this.__NAME = NAME;` trick is what exposes it to `sandbox.__NAME`):

```js
const vm = require('vm');
const sandbox = { console, performance: { now: () => Date.now() } };
vm.createContext(sandbox);
function load(p) { vm.runInContext(fs.readFileSync(p, 'utf8'), sandbox); }
load('src/lib/romanize.js');
load('src/lib/questions.js');
load('data/questions.js'); // defines TAIGI_QUESTIONS
sandbox.fetch = async () => ({ ok: true, json: async () => sandbox.TAIGI_QUESTIONS }); // unused now, Questions.load() reads the global directly
await vm.runInContext('Questions.load()', sandbox);
const q = vm.runInContext('Questions.generate(["animal"], "poj")', sandbox);
```

`GameState` (`src/game-state.js`) is a plain top-level `class`, loads the same way.

## Drive it: Playwright

Same pattern as `project_claude_TTS_SST` — `chromium-cli` isn't available on
this Windows setup; use Playwright directly from a **scratch dir** (not the
repo), since `node_modules` resolution is relative to the script's own path:

```bash
cd <scratch dir>/pw-test
npm init -y && npm install playwright@1.63.0
npx playwright install chromium   # first time only
```

Write a throwaway `.js` file *inside* that same `pw-test` folder (not a
sibling scratch dir) and run with plain `node file.js` — Node resolves
`node_modules` from the script's own directory, so a script placed elsewhere
gets `Cannot find module 'playwright'` even though `npm install` succeeded.

### Known-good assertions (smoke checks)

- `#dictStatus` reaches `/已就緒|失敗/` — 13,876 words as of the last
  `data/questions.js` build. Works instantly (no network wait) since it's a
  `<script>` global, not a fetch.
- Settings → game: fill `#targetScore`/`#questionSeconds`/`#teamAName`/`#teamBName`,
  toggle `.modeCheckbox[value="meaning|romanization|tone|animal"]`, radio
  `input[name="romanSystem"][value="tailo|poj"]`, click `#startBtn`.
- Buzz keys are fixed, not configurable in the UI: `d` = Team A, `k` = Team B
  (`page.keyboard.press('d')`). Answer keys `1`–`4` work for whichever team
  currently holds `activeTeam`, no team-specific answer keys.
- `#statusLine` text is the reliable phase signal: contains `搶答中` (buzz
  phase), `搶到了` (answer phase, first attempt), `偷答機會` (steal),
  `答對了`/`答錯了`/`作廢` (result). Poll on substring match, not exact text
  (team names are user-configurable and get interpolated in).
- **`#gameOverScreen` only becomes visible ~1200ms *after* `GameState.phase`
  flips to `'gameover'`** (see the `setTimeout` in `src/main.js`'s
  `onStateChange`). Checking `getAttribute('#gameOverScreen', 'hidden')`
  immediately after a winning click will show `hidden` even though the game
  has actually ended — wrap the check in its own `waitForSelector` with a
  ~1800ms timeout and treat a timeout as "not a win this round", don't treat
  it as a hard failure.
- A correct answer that reaches `targetScore` skips the `'result'` phase
  entirely and jumps straight to `'gameover'` — the tug-of-war "big pull"
  burst animation (`.bigPull`/`.stumble` classes, `ui.js`'s `pulseTug`) never
  fires for the *winning* answer specifically; only the victory/defeat pose
  (`celebrateTug`) does. Not a bug, just don't expect `bigPull` on a winning
  click when asserting animation classes.
- **SVG elements' `.className` is an `SVGAnimatedString` object, not a
  string** — `document.getElementById('charA').className.includes(...)`
  throws `TypeError: ... .includes is not a function`. Use
  `.getAttribute('class')` instead when checking animation classes on
  `#charA`/`#charB` from `page.evaluate`.
- Mobile layout: viewport 375px wide should never produce
  `document.documentElement.scrollWidth > document.documentElement.clientWidth`
  — `#arena` collapses to a 2-column grid (`panelA panelB` / `center center`)
  under the 700px breakpoint in `src/style.css`.
- Dark/light theme toggle: `#themeToggle` click toggles
  `document.documentElement.dataset.theme` between `dark`/`light` and
  persists via `localStorage.getItem('theme')`; survives reload.

## Deployment

Live at **https://sinliongtoo.github.io/taigi-tug-of-war/** — GitHub Pages,
serving the `master` branch root (legacy Jekyll build, but `.nojekyll` is
present so it's served as raw static files). Any push to `master` on
`https://github.com/SinLiongToo/taigi-tug-of-war` redeploys automatically —
no separate deploy step needed. `gh` CLI is installed at
`C:\Program Files\GitHub CLI\gh.exe`; it's not on PATH in fresh shell
sessions spawned by the tool, so prepend
`export PATH="/c/Program Files/GitHub CLI:$PATH"` (Bash) before calling `gh`.
