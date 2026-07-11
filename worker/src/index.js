// Backend for timetable.html's "AI timetable reader" — receives a photo,
// asks Claude to read it, and returns the raw model text for the page to parse.
// Deploy with Wrangler; see worker/README.md.

const ANTHROPIC_VERSION = '2023-06-01';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // generous headroom over the ~1600px jpeg the page sends

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Shared-Secret',
  };
}

function json(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

function parseDataUrl(dataUrl) {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl || '');
  if (!m) return null;
  return { mediaType: m[1], data: m[2] };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Use POST' }, 405, env);
    }

    // optional shared-secret gate — set SHARED_SECRET so randoms who find the
    // URL can't spend your Anthropic budget; unset means no gate (fine for quick testing)
    if (env.SHARED_SECRET && request.headers.get('X-Shared-Secret') !== env.SHARED_SECRET) {
      return json({ error: 'Unauthorized' }, 401, env);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'Worker is missing ANTHROPIC_API_KEY — see worker/README.md' }, 500, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Request body must be JSON' }, 400, env);
    }

    const { imageDataUrl, prompt } = body || {};
    if (!prompt || typeof prompt !== 'string') {
      return json({ error: 'Missing "prompt"' }, 400, env);
    }
    const image = parseDataUrl(imageDataUrl);
    if (!image) {
      return json({ error: 'Missing or malformed "imageDataUrl" (expected a data: URL)' }, 400, env);
    }
    if (image.data.length > MAX_IMAGE_BYTES * 4 / 3) {
      return json({ error: 'Image is too large' }, 413, env);
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || 'claude-opus-4-8',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });

    const data = await anthropicRes.json();
    if (!anthropicRes.ok) {
      return json({ error: 'Anthropic API error', detail: data }, anthropicRes.status, env);
    }

    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return json({ text }, 200, env);
  },
};
