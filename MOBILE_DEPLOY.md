Mobile deployment options for Carbo-Tracker

Problem you hit:
- `npx cap copy android` / `npx cap sync android` fails with:
  "The web assets directory (./out) must contain an index.html file."

Why this happens:
- `capacitor.config.ts` points `webDir` at `out` (the static export folder). Capacitor expects a static site there with an `index.html` entrypoint.
- Your Next.js project currently uses App Router and API routes (server features). `next export` can only produce a static site if your pages are fully static (no server-side rendering or API routes).

Two recommended paths to resolve (pick one):

Option A — Recommended: Host the Next app remotely and let Capacitor load the hosted URL
- Pros: preserves server-side features and API routes; minimal code changes.
- Cons: requires hosting and network access.

Steps (quick):
1. Deploy your Next.js app to a host (Vercel/Render/Fly/your VPS). Make sure environment variables are set for any server APIs.
2. Update `capacitor.config.ts` server.url to point to the deployed URL or to a development URL:
   - For Android emulator development: use `http://10.0.2.2:3000` (maps emulator to host's localhost)
   - For a device or remote host use `https://your-deployed-url`
   Example (uncomment in `capacitor.config.ts`):
   server: { url: 'https://your-deployed-url', cleartext: false }
3. Sync and open Android project:

```powershell
npm ci
npx cap sync android
npx cap open android
```
4. Build/run from Android Studio (emulator or device). For release, create a signed AAB in Android Studio.

Option B — Static export inside the APK (offline) — only if your app is fully static
- Pros: app works offline, no hosting required.
- Cons: API routes and SSR won't work. You may need to refactor APIs to external endpoints or make pages static.

Steps (quick):
1. Ensure your Next pages are exportable (no server-side code or API routes). If not, refactor or pick Option A.
2. Build and export static assets into `out` (Capacitor's `webDir`):

```powershell
npm ci
npm run export
# or
npm run build:web
```

3. Confirm `out/index.html` exists.
4. Copy to Android and open project:

```powershell
npx cap copy android
npx cap sync android
npx cap open android
```

5. Build/run in Android Studio.

Troubleshooting tips
- If you want to test a running dev server in the Android emulator, set `server.url` to `http://10.0.2.2:3000` in `capacitor.config.ts` and run `npm run dev` on host.
- On a physical device use your machine LAN IP (e.g., `http://192.168.1.42:3000`) and confirm the device can reach that IP.
- If `next export` fails because of App Router or API use, Option A is the correct path.

Commands summary (PowerShell)

Host/remote flow (recommended):

```powershell
# locally test dev server
npm ci
npm run dev
# in another shell, start capacitor and point to dev host (set server.url appropriately)
npx cap sync android
npx cap open android
```

Static-export flow (if app is fully static):

```powershell
npm ci
npm run export
# verify out/index.html exists
npx cap copy android
npx cap sync android
npx cap open android
```

If you want, I can:
- Add `server.url` to `capacitor.config.ts` with a placeholder and show exact commands (already added as commented guidance), or
- Try to run `npm run export` here and report errors that block static export.

Which option do you want to pursue?
