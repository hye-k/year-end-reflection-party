# Year-End Party

## Overview
We're going to make a simple website to prepare for a year-end party with my friends (8 freediving-club friends).
The website consists of a series of forms for users, my friends, to fill in of which answers are stored in a google sheet. 
Simplity is the key in the architecture. It's a static website that takes answers, much like google forms, no reason for complicated architecture. The reason why I decided building my own instead of using google forms lies in flexibility of the forms. I would rather put more effort in the design and delivery of the questions so that the process of answering entertaining.

## Contents
Below are the resources the questions were generated from.
- Year-end reflection: everyone makes a list of what they've tried this year. It doesn't matter whether it worked out or not. We celebrate the effort, not the outcome.
- New year's resolutions: everyone shares what they want to achieve in the New year. Perhaps a list of 12 small items so that we can have monthly goals?
- Bragging session: everyone must come up with 5 number of things to brag about. As Koreans, we're raised to be humble, so why not give ourselves permission to brag for once?
- TODO Bingo: 5x5 grid to fill in the things they want to achieve in the coming year. Reference the image below.
  ![alt text](image.png)
  ![alt text](image-1.png)

What was built (status as of 2026-11-14): the site is **deployed and live, friends are submitting answers** at https://hye-k.github.io/year-end-reflection-party/ (repo `hye-k/year-end-reflection-party`, public).
- **2026 다이브 로그** (reflection): 13 quests, all required, including the bragging quest (5 slots) and a letter to the past self. Quest ids: warmup-food, warmup-song, warmup-purchase, warmup-photo, thanks, first-tries, glad-i-did, let-go, courage, new-self, brag, to-past-self, year-sentence.
- **2027 시즌 훈련표** (mandala, 9x9 with mirrored themes): replaces the resolutions and the bingo (the bingo was never built). It is a **bonus stage**: nothing is required and the writer can skip it. Submit needs at least one cell.
- Flow: title (pick name) → quests → clear (confetti) → mandala → done (credits). The writer can only reach "clear" after submitting with every quest answered.

## Goals
- decide the system architecture — done (see Architecture)
- generate questions — done (wording lives in `app/src/content/ko.json`)
- design the visuals and delivery of the contents — done: pixel-art "수심 다이브" game (quests = questions, depth gauge, mandala as a season plan)
- deploy the website — done (GitHub Pages)

## Architecture
- `app/`: Vite + React 19 + TypeScript SPA, no router (the screen is a state machine in `App.tsx`), no backend. Tests: Vitest (`npm test`, ~98 tests in `src/core`, `src/data`, `src/screens`), lint: oxlint (`npx oxlint src`), types: `npx tsc -b`.
- `apps-script/Code.gs`: the only server. A Google Apps Script web app bound to the Google Sheet. `doGet`: `names`, `draft`, `ping`. `doPost`: `submit`, `saveDraft`, `deleteDraft`. It checks only the name allow-list, form name, sizes and header/row length, never completeness. The allow-list is the sheet's `names` tab (column A from row 2, header in row 1; read on every request), so the player list changes by editing the sheet: no Apps Script or site redeploy. The tab must exist (the `names` request fails otherwise); records are keyed by name, so never rename a player, only add or remove. Other tabs: `reflection`, `mandala`, `drafts` (header `key,name,form,savedAt,json`). A tab is created with its header on the first write: **delete a tab entirely to reset it; never leave an empty tab without its header row** (the first row would be written as header-less data, and `drafts` is read from row 2).
- `app/src/core`: pure logic (content, reflection answers, mandala model, serialize, text helpers). `data`: Apps Script client, localStorage drafts, `useFormDraft` hook. `ui`: components and scenes. `screens`: one file per screen. `content`: `ko.json` (quest wording) and `credits.json` (credit roll). Each folder has a short README where useful.
- Saving: input is saved to localStorage 0.5 s after an edit; the server gets it 20 s after the first unsaved edit (autosave, no calls without an edit, a failure is retried only on the next edit or the save button). Submit keeps the submitted state as the draft, so coming back restores it. localStorage keys all start with `ydp:v1:` (`lastName`, `lastStep`, `draft:<form>:<name>`, `tourSeen:quest|mandala`). The last step is resumed except the done screen.
- Layout: desktop is a fixed 1280x760 `Stage` scaled to the visible viewport (width ≤ 760 px switches to the phone layout, `MobileShell` sized by `visualViewport`). Landscape tablets use the desktop layout; black bars above and below are accepted. Portrait tablets are not a target.
- Quest wording is split from structure (`QUEST_STRUCTURES` in `core/content.ts` + `ko.json`, merged by `buildQuests`, which throws on a mismatch). Placeholders: empty in the JSON means the field shows "최대 N자".
- i18n is prepared only that far: UI strings are still hardcoded in components; there is no `en.json`.

## Design system
- Pixel-art game look. Palette Lospec Apollo: gold `#e8c170` (primary), navy `#253a5e`, orange `#da863e`, stage `#73bed3`, panel `#c8e5e2`, field `#ebede9`, ink `#090a14`; tokens in `app/src/ui/tokens.css`. Fonts: Galmuri11 Bold (headings, buttons, labels), Pretendard Variable (body).
- One gold button component (`ui/GoldButton`), labels in `ui/actionLabels.ts`. Rule: English caps for a step forward (START, NEXT ▼, NEXT ▶, BONUS ▶, SUBMIT!), Korean for everything else. Panel body text is 16 px (`.panel-text`). Mobile inputs stay at 16 px (smaller makes iOS zoom in on focus).
- No auto-focus on inputs (it shrinks the iPad viewport). Onboarding tours (`ui/OnboardingTour`) on the quest and mandala screens, replayable with the `?` button; on phones the card docks to a screen edge and the tour scrolls the target into view.
- Copy tone: friendly Korean (요체). Each screen has at most one animated moment (confetti on clear, credit roll on done); reduced motion is respected.

## Deploy
- `cd app && npm run deploy` builds with `VITE_SITE_URL` (from `app/.env.local`, also sets the Vite `base` and the og tags) and force-pushes the build to the `gh-pages` branch. Pages serves that branch.
- `app/.env.local` (git-ignored) holds `VITE_APPS_SCRIPT_URL` and `VITE_SITE_URL`; see `.env.example`.
- After editing `apps-script/Code.gs`, redeploy the Apps Script as a **new version of the same deployment** (Manage deployments → edit → New version), otherwise the URL changes and the site must be rebuilt. Friend names are not in the code at all: they live in the sheet's `names` tab.
- Link preview picture: `app/public/og.png`, made by `app/scripts/make-og-image.py` (stdlib only, no licensed sprites).

## Licences and what is not in the repo
- Sprites are from Szym's SpearFishing Assets Pack. Its licence allows use in websites and modification but forbids reselling or distributing the assets "in any form". So `assets/` (the raw pack) and `app/src/assets/sprites/` (the 16 sheets in use) are git-ignored; the build only works on this machine. The built site on `gh-pages` unavoidably contains the sprite PNGs; the owner accepted that. Credit is in `content/credits.json`.
- `image.png`, `image-1.png` (the bingo references above) are git-ignored, provenance unknown. Fonts: Galmuri and Pretendard (open fonts).

## Working notes
- Reply to the user in Korean, plain-language explanation first, no code unless asked. Do not commit or push unless asked.
- Browser testing used the Claude-in-Chrome tools against `npx vite --port 5174`. The window cannot go below ~960 px wide, so phone layouts are tested through a temporary iframe page in `app/public/` (remove it afterwards). Seed state through localStorage (`ydp:v1:*`). Real-device behaviour was never verified.
- Match the style of the file being edited (`core/mandala.ts` uses double quotes and semicolons, the rest does not).

## Open items / known leftovers
- **Live data warning**: friends' answers are in the sheet now. Do not rename or reorder quest ids, slot counts or the column layout (`core/serialize.ts` headers), and do not reset tabs, without first migrating the existing rows. A site redeploy is safe; an Apps Script change must go out as a new version of the same deployment.
- Verify on real devices: iPhone and landscape iPad (viewport changes, keyboard overlap, tour cards), and the deployed site's submit flow end to end into the sheet.
- `app/public/favicon.svg` is still the Vite template logo; replace it with an app icon.
- The `names`-tab version of `Code.gs` was handed over on 2026-11-14 and the user reported it working; if the name list ever fails to load on the live site, check that the `names` tab exists and the deployed Apps Script version is the latest.
- Not done: i18n steps 2–3 (move UI strings into keys, add `en.json`), the bingo form.
- Abandoned: background music from the user's own dive video (loops were prepared, the idea was dropped on 2026-11-13).
