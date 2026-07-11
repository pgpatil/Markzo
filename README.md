# Markzo
Study planner for students

Static, no-build site — open `index.html` directly, or serve the folder with any static file host.

- `index.html` — the planner: onboarding, daily/weekly/monthly timeline, syllabus tracker. State is saved to the browser's `localStorage` only (nothing is sent anywhere).
- `timetable.html` — optional AI timetable reader (beta). Photographs your timetable and sends it to a backend URL you provide (e.g. a Cloudflare Worker proxying a vision LLM) to extract school hours, days, and per-period subjects. You must paste your own backend URL — none is bundled — and it's remembered in that browser via `localStorage`.
