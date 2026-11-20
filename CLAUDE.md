# Year-End Party

A simple static website for a year-end party with 8 freediving-club friends. Friends fill in forms; answers go to a Google Sheet. Simplicity is the key in the architecture (no router, no backend besides one Apps Script). It is custom-built instead of Google Forms so the design and delivery of the questions can be entertaining.

Status: **deployed and live, friends are answering** at https://hye-k.github.io/year-end-reflection-party/ (repo `hye-k/year-end-reflection-party`, public).
- **2026 다이브 로그** (reflection): 13 required quests (ids in `app/src/core/content.ts`, wording in `app/src/content/ko.json`).
- **2027 시즌 훈련표** (mandala, 9x9): a bonus stage, nothing required.
- Flow: title (pick name) → quests → clear → mandala → done.

## Policies
App-wide policies and decisions (scope, data and saving, input limits, access, design and copy, deploy and licences, usage events, award stats, results screen) are in **`docs/policies.md`**. Read it before changing behaviour it covers (UI look, button labels, character limits, saving, what is public).

## Architecture
- `app/`: Vite + React 19 + TypeScript SPA; the screen is a state machine in `App.tsx`. Tests `npm test` (Vitest), lint `npx oxlint src`, types `npx tsc -b`. Folders (`core` pure logic, `data` Apps Script client and drafts, `ui`, `screens`, `content`) have short READMEs.
- `apps-script/Code.gs`: the only server, bound to the Google Sheet. The player allow-list is the sheet's `names` tab (column A from row 2, header in row 1, read on every request), so players are added or removed by editing the sheet. The tab must exist or the `names` request fails. Never rename a player (records are keyed by name).
- Sheet tabs: `reflection`, `mandala`, `drafts`, `events` (usage log), `names`. A tab is created with its header on the first write: **delete a tab entirely to reset it; never leave an empty tab without its header row** (the first row would be written as header-less data, and `drafts` is read from row 2).
- Character limits are constants at the top of `core/content.ts`; change them only there.

## Deploy
- `cd app && npm run deploy` builds and force-pushes to the `gh-pages` branch. It needs `app/.env.local` (git-ignored: `VITE_APPS_SCRIPT_URL`, `VITE_SITE_URL`; see `.env.example`) and the git-ignored sprites, so it only works on this machine.
- After editing `apps-script/Code.gs`, redeploy it as a **new version of the same deployment** (Manage deployments → edit → New version), otherwise the URL changes and the site must be rebuilt. When a site change needs a new Apps Script action, deploy the Apps Script first, then the site.
- Tabs that friends already have open keep running the old build until they refresh.

## Working notes
- Reply to the user in Korean, plain-language explanation first, no code unless asked. Do not commit or push unless asked.
- Match the style of the file being edited (`core/mandala.ts` uses double quotes and semicolons, the rest does not).
- Browser testing: Claude-in-Chrome tools against `npx vite --port 5174`. The window cannot go below ~960 px wide, so test phone layouts through a temporary iframe page in `app/public/` (remove it afterwards). Seed state through localStorage (`ydp:v1:*`).
- `app/.env.local` points the local dev server at the **real sheet**. Test with a test name added to the `names` tab (never a friend's name), and delete the test rows from every tab afterwards (`reflection`, `mandala`, `drafts`, `events`, `names`). Never touch friends' rows.
- **Keep `docs/policies.md` current.** Whenever a policy is added, changed or reversed (a decision made in conversation counts), update it in the same change, with the date for dated decisions, and keep its table of contents in step with the section headings. Do not keep design or implementation-plan documents after a feature is finished; decisions that outlive the feature move into `policies.md`.

## Open items
- **Live data warning**: friends' answers are in the sheet. Do not rename or reorder quest ids, slot counts or the column layout (`core/serialize.ts` headers), and do not reset tabs, without first migrating the existing rows. A site redeploy is safe.
- **Next: the results screen** (not built; design and provisional assumptions in `docs/policies.md`).
- The mandala form's events have not been checked in the real sheet (the reflection ones have).
- `app/public/favicon.svg` is still the Vite template logo; replace it with an app icon.
- Not done: i18n steps 2–3 (move UI strings into keys, add `en.json`).
