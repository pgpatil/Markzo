# Markzo timetable-reader backend

A small Cloudflare Worker that backs `timetable.html`'s "AI timetable reader": it
takes a photo (as a data URL) and a prompt, asks Claude to read the timetable,
and returns the model's raw text for the page to parse into JSON.

Nothing in this repo talks to this worker by default — you deploy your own
copy and paste its URL into `timetable.html` yourself. Your Anthropic API key
never leaves your Cloudflare account.

## Deploy

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and log in:
   ```
   cd worker
   npm install
   npx wrangler login
   ```
2. Set your Anthropic API key as a secret (never put it in `wrangler.toml`):
   ```
   npx wrangler secret put ANTHROPIC_API_KEY
   ```
3. (Recommended) Set a shared secret so random people who find your worker's
   URL can't spend your Anthropic budget:
   ```
   npx wrangler secret put SHARED_SECRET
   ```
   If you set this, you'll need to send it as the `X-Shared-Secret` header on
   requests — `timetable.html` doesn't do this yet, so either skip this step
   for personal use, or add the header yourself in `timetable.html`'s `fetch`
   call before deploying it somewhere public.
4. Deploy:
   ```
   npx wrangler deploy
   ```
   Wrangler prints your worker's URL (`https://markzo-timetable-reader.<your-subdomain>.workers.dev`).
5. Paste that URL into the "Your backend URL" field in `timetable.html`.

## Configuration

- `ANTHROPIC_API_KEY` (secret, required) — your Anthropic API key.
- `SHARED_SECRET` (secret, optional) — if set, requests must include a
  matching `X-Shared-Secret` header.
- `ANTHROPIC_MODEL` (var, optional) — defaults to `claude-opus-4-8`. Set to
  a cheaper model like `claude-haiku-4-5` if you want lower cost over
  accuracy on this fairly simple extraction task.
- `ALLOWED_ORIGIN` (var, optional) — defaults to `*` (any site can call your
  worker, though without the API key nothing sensitive is exposed). Set this
  to the exact origin you host `timetable.html` on if you want to restrict it.

## What it costs

Each photo read is one Claude API call with one image and a few hundred
output tokens — a handful of cents at most per read at current Anthropic
pricing. Cloudflare Workers' free tier (100,000 requests/day) covers normal
personal use with room to spare.
