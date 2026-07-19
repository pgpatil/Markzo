# Markzo
Study planner for students

Static, no-build site — open `index.html` directly, or serve the folder with any static file host.

- `index.html` — the planner: onboarding, daily/weekly/monthly timeline, syllabus tracker. State is saved to the browser's `localStorage` only (nothing is sent anywhere) unless you turn on the optional Google Drive backup below. School-timetable photos are read on-device with [Tesseract.js](https://github.com/naptha/tesseract.js) (vendored in `vendor/`, no data leaves the device) to pull out start/end times.
- `timetable.html` — optional AI timetable reader (beta), for richer results (days, per-period subjects) than the on-device reader gives you. Photographs your timetable and sends it to a backend URL you provide to extract structured data. You must paste your own backend URL — none is bundled — and it's remembered in that browser via `localStorage`. `worker/` has a ready-to-deploy Cloudflare Worker backend for this — see `worker/README.md`.
- `vendor/` — the Tesseract.js OCR library, committed locally so the timetable reader in `index.html` still works if a school network blocks CDNs. Only the JS engine is vendored (~200KB); the language/training data (a few MB) is still fetched from jsdelivr the first time OCR actually runs.
- `worker/` — an optional Cloudflare Worker backend for `timetable.html`'s AI reader. Not required for `index.html`'s on-device reader.

## Google Drive backup (optional)

Setup → Backup & sync lets you back up your study data to Google Drive, so a
reset or a new device doesn't lose it. It's entirely client-side (no backend,
no server ever sees your data) — the app writes one JSON file to a hidden,
app-only folder in your Drive (the `drive.appdata` scope: it never sees or
lists your other files, and nothing shows up in your normal Drive view).

Like `timetable.html`'s backend, none of this is bundled — you set up a free
Google Cloud OAuth Client ID once and paste it into the app:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create a project (or use an existing one).
2. **APIs & Services → Library** — enable the **Google Drive API**.
3. **APIs & Services → OAuth consent screen** — set it to **External**, add your own Google account as a **test user** (this keeps it in "Testing" mode, which is fine for personal use and skips Google's app-verification review).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID** — Application type **Web application**. Under **Authorized JavaScript origins**, add the exact origin you'll open `index.html` from (e.g. `https://your-username.github.io` for GitHub Pages, or `http://localhost:8000` for local testing — no path, no trailing slash).
5. Copy the generated **Client ID** and paste it into the app's Setup → Backup & sync card, then tap **Connect**.

A Client ID isn't a secret by itself (it's meant to be public in client-side
apps like this one) — but only origins you explicitly authorized in step 4
can use it to request access, so don't add origins you don't control.
