# Markzo
Study planner for students

Static, no-build site — open `index.html` directly, or serve the folder with any static file host.

- `index.html` — the planner: onboarding, daily/weekly/monthly timeline, syllabus tracker. State is saved to the browser's `localStorage` only (nothing is sent anywhere). School-timetable photos are read on-device with [Tesseract.js](https://github.com/naptha/tesseract.js) (vendored in `vendor/`, no data leaves the device) to pull out start/end times.
- `timetable.html` — optional AI timetable reader (beta), for richer results (days, per-period subjects) than the on-device reader gives you. Photographs your timetable and sends it to a backend URL you provide to extract structured data. You must paste your own backend URL — none is bundled — and it's remembered in that browser via `localStorage`. `worker/` has a ready-to-deploy Cloudflare Worker backend for this — see `worker/README.md`.
- `vendor/` — the Tesseract.js OCR library, committed locally so the timetable reader in `index.html` still works if a school network blocks CDNs. Only the JS engine is vendored (~200KB); the language/training data (a few MB) is still fetched from jsdelivr the first time OCR actually runs.
- `worker/` — an optional Cloudflare Worker backend for `timetable.html`'s AI reader. Not required for `index.html`'s on-device reader.
