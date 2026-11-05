# Pixel2Code: build it from scratch (free, React Native + Expo)

Upload a screenshot, an AI turns it into website code, you preview it, tweak it, and export a ZIP.
One codebase runs as a **web app** and an **Android/iOS app** (Expo). The AI is **Google Gemini's free tier**, called only from a small Node server so your key is never inside the app.

Tested while writing this: Expo SDK 58 (React Native 0.88), Node 22. All commands are for **Windows** (CMD or PowerShell).

---

## 0. What is real and what is not

**Working (built and checked):**
- Library: search, filters (All / Recent / Favorites / Drafts / Exported / Recycle bin), rename, duplicate, favorite, export ZIP, import ZIP
- New project: choose/paste/drag an image (PNG/JPG/WebP), crop on phone, pick HTML / Bootstrap 5 / Tailwind, add rules, generate with Gemini
- Editor: file chips + code editor, autosave with Saved/Saving status, undo/redo, copy file, download file, delete single file
- Live preview of the real generated site (sandboxed iframe on web, WebView on phone), Desktop/Tablet/Mobile + adjustable width, runtime error + missing asset report
- Google Fonts manager (heading/body/button, weights, fallbacks, one CSS2 URL)
- Sections list from your HTML ids, highlight in preview, per-section style (background, padding, min height, align, hide per device)
- Per-section animations (fade/zoom entrance with IntersectionObserver, hover lift/scale/shadow for the section or only its cards), reduced-motion respected
- Rules (persistent instructions: add/edit/reorder/on-off/delete) + one-time chat requests with Undo/Keep
- Versions: auto snapshot before AI changes, manual save, restore, delete a version
- Permanent local storage; nothing is deleted unless you choose "Delete forever" and confirm
- 8 unit tests (`npm test`), backend validation tested with real HTTP calls

**NOT built (be honest with yourself and your clients):**
- React/Vue/Angular/PHP/Laravel/Flutter etc. output (only HTML, Bootstrap 5, Tailwind). See section 9 for how to add them.
- Live preview of non-web code (needs its own runtime anyway)
- Pixel diff and similarity score, automatic visual refinement (side-by-side compare only)
- Monaco editor (React Native has no Monaco; a plain monospace editor is used)
- Open preview in a separate tab (blocked on purpose: a blob tab would share the app's origin and break the sandbox)
- OCR/upscaling of blurry images (Gemini reads the image directly; it can only guess missing detail)
- Cloud sync between web and phone (storage is local to each device)
- Login system (a shared APP_TOKEN protects your server)

**Free, but check the terms yourself:** Gemini has a free tier, but limits change and Google says free-tier prompts may be reviewed and used to improve its products. Do not upload confidential client designs on the free tier. Read: https://ai.google.dev/gemini-api/terms

---

## 1. Install the tools (once)

1. **Node.js LTS** from https://nodejs.org (check: `node -v`)
2. **VS Code** from https://code.visualstudio.com
3. On your Android phone install **Expo Go** from Play Store (for testing on the phone)
4. A Google account (for the free AI key)

## 2. Get the free AI key

1. Open https://aistudio.google.com/apikey and sign in
2. Click **Create API key**, copy it. No card needed.
3. Never paste this key into the app code. It goes only in `server/.env`.

## 3. Project folder

```
cd %USERPROFILE%\Desktop
mkdir pixel2code
cd pixel2code
```

You will end with:

```
pixel2code/
  server/     <- Node + Express, holds the AI key
  app/        <- Expo app (web + phone)
```

## 4. Backend (server/)

If you got this folder as a ZIP, just do:

```
cd server
npm install
copy .env.example .env
notepad .env
```

Fill `GEMINI_API_KEY` and pick any long `APP_TOKEN` (for example `my-long-secret-123`). Then:

```
npm start
```

Open http://localhost:8787/health. You should see `{"ok":true,...,"hasKey":true}`.

**From scratch**, the same server is: `npm init -y`, `npm i express cors dotenv express-rate-limit`, then the code in `server/index.js`. What it does, in order:

| Piece | Why |
|---|---|
| `dotenv` | reads the key from `.env`, so it is never in source code |
| `express.json({limit:'8mb'})` | upload size limit (image arrives as base64) |
| `express-rate-limit` | 20 requests/minute per IP |
| `auth` middleware | rejects requests without the right `x-app-token` header |
| `buildPrompt` | tells the AI: output JSON files, give every section an id, use the chosen stack, follow your rules; for edits: change as little as possible |
| `callGemini` | one REST call, 120 s timeout, friendly errors for 429 (free limit) and timeouts |
| `parseFiles` + `safePath` | the AI output is untrusted: only relative safe paths are accepted (no `..`, no `/`) |
| `/api/generate`, `/api/refine` | validate MIME type and size, call AI, return `{files, notes}` |

Model name is `GEMINI_MODEL` in `.env`. If Google retires it, pick a current free model at https://ai.google.dev/gemini-api/docs/models.

## 5. The app (app/)

If you got the ZIP: `cd app`, `npm install`, skip to section 6.

From scratch:

```
cd %USERPROFILE%\Desktop\pixel2code
npx create-expo-app@latest app --template blank-typescript
cd app
npx expo install @react-native-async-storage/async-storage react-native-webview expo-image-picker expo-image-manipulator expo-file-system expo-sharing expo-document-picker expo-clipboard react-native-web react-dom @expo/metro-runtime
npm install jszip
npm install -D tsx
```

Then copy `App.tsx` and the whole `src/` folder from this project into your `app/` folder, and `tests/` if you want the tests. Set `"web": { "bundler": "metro" }` in `app.json`. In `package.json` add the script `"test": "node --import tsx --test tests/*.test.ts"`.

### How the app is organised

```
App.tsx                  switches screens, loads settings + projects, saves
src/types.ts             the shared Project shape (files, rules, fonts, animations, versions)
src/storage.ts           AsyncStorage: one key per project, permanent delete only on request
src/api.ts               calls your server
src/lib/managed.ts       THE core trick (below)
src/lib/fonts.ts         font list + Google Fonts CSS2 URL builder
src/lib/exporter.ts      ZIP export/import with path-traversal checks
src/lib/image.ts         shrinks screenshots before upload
src/components/Preview.tsx   sandboxed preview
src/components/ui.tsx    buttons, cards, theme
src/screens/Library.tsx, NewProject.tsx, Editor.tsx, Settings.tsx
```

**The core trick: managed blocks.** The Fonts, Section and Animation panels do not ask the AI. They generate CSS/JS and write it between `<!-- p2c:head:start -->` markers inside `index.html`. Re-applying replaces only that block, so it is deterministic, free (no AI quota), safe to repeat, and visible in the code editor. Before a chat edit, `stripManaged` hides those blocks from the AI, and `applyManaged` puts them back afterwards.

**Preview safety.** On web the site runs in `<iframe sandbox="allow-scripts" srcDoc=...>`. There is deliberately no `allow-same-origin`, so generated code cannot read your app's storage. Errors travel back through `postMessage`, and only from that iframe. On phone the WebView blocks top-level navigation and file access.

**Storage.** Each project (code, reference image, versions) is one AsyncStorage record: IndexedDB-backed localStorage on web (about 5 MB total), app-private storage on phones. Nothing ever deletes a project except **Delete forever** after a confirm dialog. "Move to bin" is recoverable. If storage fills up you get a clear message; export a ZIP and delete old versions.

## 6. Run it

Terminal 1:
```
cd server
npm start
```
Terminal 2:
```
cd app
npx expo start --web
```
Browser opens. Go to **Settings**, set Server URL `http://localhost:8787` and the same App token as `server/.env`, Save, press **Test server**.

**On your phone** (same Wi-Fi as your PC):
1. `ipconfig` and note your IPv4, for example `192.168.1.20`
2. In `app/` run `npx expo start`, scan the QR with Expo Go
3. In the app Settings set Server URL `http://192.168.1.20:8787`
4. If it cannot connect, allow Node.js through Windows Firewall (private networks)

**Android emulator:** use `http://10.0.2.2:8787`.

## 7. Test it end to end (do this, it is your proof)

1. New project, choose a screenshot, Generate. Files appear and the preview shows a real site
2. Edit CSS in the Code tab. Status shows Saving... then Saved. Preview refreshes
3. Close the browser completely, reopen: the project is still in the Library
4. Design tab: pick Poppins for headings, preview shows it. Select `about`, add `fade-up`, scroll the preview
5. Chat: "change the button color to #E22728". Check the change summary, then Undo
6. Versions: restore the first generation
7. Export ZIP, unzip it, double-click `index.html`
8. Library: Move to bin, then Restore. Then Delete forever and confirm the dialog

Unit tests: `npm test` in `app/`. Type check: `npx tsc --noEmit`.

## 8. Ship it (free options, verify current limits first)

- **APK for yourself:** install Android Studio, then `npx expo run:android --variant release`. Plain `http://` to your LAN server needs cleartext traffic allowed in release builds, so for a real app host the server on **https**.
- **Cloud build:** `npm i -g eas-cli`, `eas login`, `eas build -p android --profile preview`. EAS has a free plan with limited builds; check https://expo.dev/pricing.
- **Web:** `npx expo export --platform web` makes a static `dist/` you can put on any static host.
- **Server:** deploy `server/` to any Node host that supports environment variables (set the same 4 variables). Free tiers exist but change often. Then set Server URL in the app to the https address.

## 9. Growing it (what to build next, in this order)

1. **More targets (React, Vue, PHP...):** in `server/index.js` add entries to the `stack` object in `buildPrompt` and ask for the right files (for example `package.json`, `src/App.jsx`). Add chips in `NewProject.tsx` `TARGETS`. Preview works only for web targets, so for others show the code and skip the preview (check `target`).
2. **Similarity score:** render the preview to an image (web: `html2canvas`; phone: `react-native-view-shot` on the WebView) and compare it with the reference using a downscaled pixel diff. Do not claim "pixel perfect"; show the number as an estimate.
3. **Element-level selection:** in the preview reporter script, listen for clicks, build a CSS path, and post it back to select an element.
4. **Real font catalog search:** call the Google Fonts Developer API from the server with a free key and cache it.
5. **Login + cloud sync:** add a database (SQLite/Postgres) to the server. Until then do not promise sync.

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot reach the server" | server not running, wrong URL, phone on another network, firewall |
| "Wrong app token" | Settings token must equal `APP_TOKEN` in `server/.env` |
| "AI rate limit reached" | free tier limit. Wait a minute |
| "AI did not return valid JSON" | press Generate again, or shrink/crop the screenshot |
| Preview blank | open the red "Preview problems" box; check Code tab for errors |
| Fonts not showing | no internet, or a typo in the family name (exact Google Fonts spelling) |
| Storage full | export ZIP, delete old versions or projects permanently |
| `expo install` says "Forbidden" | corporate proxy; use plain `npm install` with the versions from `npx expo install --check` on another network |
