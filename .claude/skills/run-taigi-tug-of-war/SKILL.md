---
name: run-taigi-tug-of-war
description: Launch, drive, and verify the 台語搶答拔河 (Taiwanese vocabulary tug-of-war buzzer game) static web app in this repo — plain HTML/CSS/JS, no build step, no framework. Use this whenever asked to run, test, screenshot, or verify a change to index.html/src/**/data/questions.js in this project.
---

# Running 台語搶答拔河

Single static page (`index.html` + `src/*.js` + `src/lib/*.js` + `data/questions.js`),
no build step, no `package.json`. Script load order matters (set in `index.html`):
`data/version.js` → `src/lib/romanize.js` → `data/questions.js` →
`src/lib/questions.js` → `src/game-state.js` → `src/solo-state.js` →
`src/solo-stats.js` → `src/keyboard.js` → `src/ui.js` → `src/settings.js` →
`src/main.js`.

Two game types, chosen via the `input[name="gameType"]` radio on the settings
screen: **team** (`team`, the original two-team buzzer game, `GameState`) and
**solo** (`solo`, practice/drill mode, `SoloState` + `SoloStats`, see
"Solo/practice mode" below). Both share the same `Questions.generate()`
question bank and modes.

Nine question *categories* backed by 13 checkbox mode values (`enabledModes`
entries, `.modeCheckbox` values in `index.html`): `meaning`, `romanization`,
`tone` (all three filter against `data/build-questions.js`'s
`classifyLevel()` difficulty tag — `elementary`/`junior`/`senior`/
`university`, itself an LLM approximation, not official data, see README),
`animal-hanzi`/`animal-roman`, `body-hanzi`/`body-roman`,
`plant-hanzi`/`plant-roman`, `vehicle-hanzi`/`vehicle-roman` (curated picture
pools, see below — each of these four categories is two independent
checkboxes, one per direction, *not* one checkbox that randomizes direction
internally, unlike `romanization`/`tone`/`place` which still do randomize
hanzi⇄roman per question within a single checkbox), `place` (curated text
pool, see below), and `multiplication` (pure numeral generation, no
dictionary lookup at all).

## Serve — you usually don't need to

The game loads its question bank via `<script src="data/questions.js">`
(not `fetch()`), specifically so `file://` works with **no server at all**.
Double-clicking `index.html` is a valid way to test it. Only spin up a server
if you want devtools' network panel or are testing something server-specific:

```bash
python -m http.server 8000   # optional; not required for the game to work
```

## Regenerating the question bank

`data/questions.js` (~4.6MB, committed to git) is generated from two MOE
Taiwanese dictionary open data files — main + `-ext` — merged by
`build-questions.js`'s `processItems()` (called twice, main dict first so it
wins on any hanzi collision with the extended dict; ~678 overlap out of
6,793 ext entries). Regenerate after changing `data/build-questions.js`:

```bash
curl -L -o data/raw/dict-twblg.json \
  https://raw.githubusercontent.com/g0v/moedict-data-twblg/master/dict-twblg.json
curl -L -o data/raw/dict-twblg-ext.json \
  https://raw.githubusercontent.com/g0v/moedict-data-twblg/master/dict-twblg-ext.json
node data/build-questions.js
```

The ext file is optional — its absence only prints a warning and falls back
to main-dict-only (fewer words), doesn't error out. `data/raw/` is gitignored
(~10.5MB combined source dump); `data/questions.js` is not.

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
const q = vm.runInContext('Questions.generate(["animal-hanzi"], "poj")', sandbox);
```

`GameState` (`src/game-state.js`) is a plain top-level `class`, loads the same way.

## Curated word-list modes (animal / body / plant / vehicle / place)

Five modes don't draw from the main dictionary-filtered `entries` pool —
they're hand-curated lists in `src/lib/questions.js`, each cross-checked at
`Questions.load()` time against the loaded dictionary (`byHanzi.get(hanzi)`)
so a typo or a word the dictionary doesn't actually contain silently drops
out rather than crashing:

- `ANIMAL_WORDS`, `BODY_WORDS`, `PLANT_WORDS`, `VEHICLE_WORDS` — emoji or
  photo prompt, `{ type: 'emoji'|'image', value, hanzi }`. Every `hanzi`
  here **was individually verified to exist in the MOE dictionary** before
  being added — don't add a new entry without checking `byHanzi.get('新詞')`
  first (load `data/questions.js` via the `vm` pattern above and inspect
  `TAIGI_QUESTIONS.entries`). **Existence of the hanzi alone isn't enough —
  check the dictionary's own `defs` text actually matches the intended
  meaning.** `VEHICLE_WORDS` hit this for real: `byHanzi.get('山貓')` returns
  a real entry, but its definition is "雲豹、石虎、狸貓" (clouded leopard),
  not "skid loader" — same trap for 鋼牙 (dictionary: dentures, not a
  hydraulic shear attachment), 豬哥牙 (canine tooth, not a forklift fork),
  干樂 (spinning top, not a concrete mixer truck nickname), 田螺 (a
  freshwater snail, not a concrete mixer truck nickname either).
  `buildPicturePool()` has no way to detect this automatically (it only
  checks existence, not semantic match), so it's a manual read-the-definition
  step every time a curated word list borrows vocabulary from a
  non-dictionary reference source. The project owner explicitly signed off
  on keeping these four anyway (`山貓`/`豬哥牙`/`干樂`/`田螺` — 鋼牙 stayed
  out for lack of a clean photo, not a data decision) once the *pronunciation*
  was cross-checked to match between the dictionary reading and the
  reference source's romanization exactly — this is a same-hanzi-repurposed-
  as-slang case (parallel to English reusing "Bobcat" for a skid loader),
  not a fabricated reading, and both `VEHICLE_WORDS`' own comment block and
  README disclose it. Don't generalize this as "dictionary definition
  mismatches are fine to ignore" — it only holds here because (a) the
  pronunciation was verified to be identical, not just assumed, and (b) the
  project owner explicitly approved this specific case after being shown the
  mismatch, not because the check itself doesn't matter.
  Each of these four pools backs *two* checkbox modes (`animal-hanzi`/
  `animal-roman`, etc.) — `generate()` picks the direction directly from
  which checkbox fired rather than randomizing internally, see
  `generate()`'s dispatch block in `src/lib/questions.js`.
  Photo entries point at `data/images/tw-wildlife/*.jpg`,
  `data/images/tw-plants/*.jpg`, or `data/images/tw-vehicles/*.jpg` — see
  README's "圖片授權" for the CC licenses/attribution; only add a new photo
  via the same Wikimedia Commons API flow (search → `imageinfo` with
  `iiprop=url|extmetadata` → check `LicenseShortName` is CC BY/BY-SA/CC0
  before downloading — reject anything else or anything with a
  missing/ambiguous license, like the Shoushan Zoo boar photo that got
  swapped out for a clean CC BY-SA one instead). For `VEHICLE_WORDS`
  specifically, also reject a technically-licensed photo if it's too visually
  busy/confusable with another entry in the same pool to answer correctly
  from (e.g. a dump truck photo that also has an excavator and a road roller
  strapped to a trailer behind it — swapped for a cleaner single-vehicle shot).
- `PLACE_RAW` — hanzi + raw romanization string, **not** MOE-dictionary
  sourced (the dictionary has essentially zero place names — verified by
  grepping `data/raw/dict-twblg.json` for `/^地名/`-tagged defs: 12 hits
  total, only 2 are actual place names). Instead it's pulled from two other
  local projects under `Projects_antigravity/` (same OneDrive parent folder):
  the 73-station `stations` array in `台灣鐵路四界行/app.js`, and the
  14-entry mountain/river/landmark list in `geo地理,動物,人體,車,蟲/app.js`.
  **Read-only** — never edit either of those projects. Every `PLACE_RAW`
  romanization was validated once via `Romanize.parseWord()` (one entry,
  烏日/"O͘-ji̍t", failed to parse and was dropped); this is a structural
  check only, not a correctness check against an authoritative dictionary —
  README flags this mode as lower-confidence than the others.
- `genFromPicturePool(pool, mode, direction, toRoman, labels, system)` is the
  shared generator behind animal/body/plant — don't reimplement the
  distractor logic per mode, extend this one if you add a fifth picture pool.

## Solo/practice mode

`SoloState` (`src/solo-state.js`) is a small state machine parallel to
`GameState` but simpler — no buzz/steal, just `idle → answering → result`.
`SoloStats` (`src/solo-stats.js`) is a pure `localStorage` read/write module
(key `taigiTugOfWar.soloStats.v1`, wrapped in try/catch since private
browsing / disabled storage genuinely throws) that persists cumulative
`{ totalAnswered, totalCorrect, bestStreak, lastPlayedAt }` across sessions —
this is separate from `SoloState`'s own `sessionAnswered`/`sessionCorrect`
which reset every time the page reloads or a new solo session starts.

- Toggle game type: `page.check('input[name="gameType"][value="solo"]')` then
  submit `#settingsForm`. Watch `UI.applyGameTypeVisibility()` — it hides
  `#teamOnlyFields` (target score / team names) and shows `#soloStatsBox`
  (cumulative stats + `#resetSoloStatsBtn`) when solo is selected, and vice
  versa.
- Solo screen is `#soloScreen`, parallel IDs to the team screen throughout
  (`#soloTimerBadge`, `#soloStatusLine`, `#soloQuestionCard`,
  `#soloPromptLabel`/`#soloPromptText`, `#soloChoices .choiceBtn`,
  `#soloSessionScore`/`#soloTotalScore`, `#soloEndBtn`). Don't reuse the
  team screen's bare IDs (`#timerBadge`, `#questionCard`, `.choiceBtn`
  unscoped) for anything solo-related — they collide with the team screen's
  real elements since both screens' markup is always in the DOM
  simultaneously (only `hidden` differs), which silently breaks
  `document.getElementById`/`querySelectorAll` in both `ui.js` and `main.js`.
- Answering: click a `#soloChoices .choiceBtn`, or press `1`-`4` (there's a
  dedicated solo keydown listener in `main.js`, unrelated to the team game's
  `Keyboard.js` buzz-key wiring — no buzz step in solo mode).
- After each answer, `SoloStats.recordAnswer()` is called and the cumulative
  numbers update immediately in `#soloTotalScore`/the settings-screen stats
  box; a correct/wrong-colored choice button (`.correct`/`.wrong` classes)
  and the real answer both show for ~1.2s before auto-advancing to the next
  question (`setTimeout(nextSoloRound, 1200)` in `main.js`).
- `#resetSoloStatsBtn` triggers a native `confirm()` dialog before actually
  calling `SoloStats.reset()` — in Playwright, handle it with
  `page.once('dialog', d => d.accept())` (or `.dismiss()`) registered
  *before* the click.
- **A real bug this mode's testing caught**: `#soloStatsBox` was toggled via
  the `hidden` attribute alone, but `style.css` also had a plain
  `#soloStatsBox { display: flex; ... }` rule — an ID selector beats the
  browser's built-in `[hidden] { display: none }` attribute-selector rule in
  specificity, so the box stayed visible in team mode regardless of the
  `hidden` attribute. Only caught by actually screenshotting/inspecting
  `isVisible()` in team mode, not by reading the CSS or JS in isolation. Fix
  was an explicit `#soloStatsBox[hidden] { display: none; }` override. If you
  add a new element that's toggled via `.hidden = ...` *and* has its own
  `display:` rule keyed off the same ID, add the same `[hidden]` override or
  you'll reproduce this bug.

## Bumping the version footer

`data/version.js` drives the small `vX.Y.Z · 更新於 <date>` line at the
bottom of the page (`#appVersion`, populated by `main.js`'s `showVersion()`).
It's cosmetic only, not read by any game logic. Before a commit you want
reflected there:

```bash
node data/bump-version.js          # patch bump (default)
node data/bump-version.js minor    # or major
```

Commit the regenerated `data/version.js` alongside the actual change.

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

- `#dictStatus` reaches `/已就緒|失敗/` — 19,821 words as of the last
  `data/questions.js` build (main dict + the `dict-twblg-ext.json` extended
  dict, merged in `build-questions.js`'s `processItems()`). Works instantly
  (no network wait) since it's a `<script>` global, not a fetch.
- Settings → game: fill `#targetScore`/`#questionSeconds`/`#teamAName`/`#teamBName`,
  toggle `.modeCheckbox[value="meaning|romanization|tone|animal-hanzi|animal-roman|body-hanzi|body-roman|plant-hanzi|plant-roman|vehicle-hanzi|vehicle-roman|place|multiplication"]`,
  toggle `.levelCheckbox[value="elementary|junior|senior|university"]` (all
  four checked by default; unchecking all falls back to unrestricted, not to
  zero results), radio `input[name="romanSystem"][value="tailo|poj"]`, click
  `#startBtn`.
- `animal-*`/`body-*`/`plant-*`/`vehicle-*` modes render an emoji, a whole photo, or (body only)
  a cropped region of the shared skeleton chart inside `#promptText`,
  depending on `q.promptType`: `'emoji'` (text), `'image'` (`<img>`), or
  `'crop'` (a `<div class="boneCrop">` with `background-image`/`-size`/
  `-position` set from `q.cropStyle`). Assert on
  `document.querySelector('#promptText img')` or `.boneCrop` presence rather
  than text content when you need to distinguish them. `place` mode is
  text-only (hanzi or romanization string, never an image).
- Bone crops all read one shared file, `data/images/tw-body/skeleton.webp`
  (an unlabeled 1896 anatomical plate, public domain), cropped via
  `BONE_CROPS` in `questions.js` — 12 named regions (skull-upper/-lower,
  chest, spine, pelvis, thigh, knee, lowerleg, feet, upperarm, fullarm,
  fullleg), each entry in `BODY_WORDS` picks one by name. To add/retune a
  region: the container is always a square (`.boneCrop { aspect-ratio: 1/1 }`
  in `style.css`), so compute `background-size` / `background-position` with
  the "cover" formula in the comment above `BONE_CROPS` — critically, the
  Y-axis effective zoom is `zoomX / imageAspectRatio`, **not** the same
  `zoomX` used for the X axis (since `background-size: X% auto` scales
  height to preserve the image's aspect ratio, not the container's). Verify
  any new region visually before trusting the numbers: build a small HTML
  page with the background-image + computed values at 220×220px, screenshot
  it with Playwright, and look — several regions were badly mispositioned
  (or fully blank) on the first pass from small coordinate-estimation
  errors, especially thin bone shafts on a mostly-white line-art image.
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
