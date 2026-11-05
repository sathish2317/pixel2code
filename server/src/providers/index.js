// AI provider adapters. Each adapter turns [{text}|{inline_data}] parts into one text answer.
// Switch provider with AI_PROVIDER in .env; nothing else in the app changes.
const { HttpError } = require('../errors');

function makeProvider(cfg, fetchImpl = fetch) {
  const oa = cfg.openaiStyle;

  async function once(parts, signal) {
    let url, headers, body;
    if (oa) {
      url = cfg.baseUrl || oa.url;
      headers = { 'content-type': 'application/json', authorization: `Bearer ${cfg.key}` };
      const hasImage = parts.some((p) => p.inline_data);
      // Text-only models need "content" as a string, vision models a list of parts.
      const content = hasImage
        ? parts.map((p) => (p.text !== undefined ? { type: 'text', text: p.text } : { type: 'image_url', image_url: { url: `data:${p.inline_data.mime_type};base64,${p.inline_data.data}` } }))
        : parts.map((p) => p.text).join('\n');
      body = { model: cfg.model, messages: [{ role: 'user', content }], temperature: 0.2 };
    } else {
      url = (cfg.baseUrl || 'https://generativelanguage.googleapis.com/v1beta') + `/models/${cfg.model}:generateContent`;
      headers = { 'content-type': 'application/json', 'x-goog-api-key': cfg.key };
      body = { contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.2, maxOutputTokens: 60000 } };
    }
    const r = await fetchImpl(url, { method: 'POST', headers, body: JSON.stringify(body), signal });
    if (r.status === 429) {
      const ra = Number(r.headers.get('retry-after'));
      throw new HttpError(429, 'AI quota or rate limit reached. Wait a minute and retry (free tiers are small).', { quota: true, retryAfterSec: Number.isFinite(ra) && ra > 0 ? ra : undefined });
    }
    if (!r.ok) {
      const t = await r.text();
      let detail = '';
      try { const j = JSON.parse(t); detail = j?.error?.message || j?.message || ''; } catch { detail = t.slice(0, 200); }
      // 5xx and 408 are worth retrying; 4xx (bad key, bad request) are not.
      throw new HttpError(502, `AI provider error ${r.status}: ${String(detail).slice(0, 300)}`, { retryable: r.status >= 500 || r.status === 408 });
    }
    const data = await r.json();
    const text = oa ? data?.choices?.[0]?.message?.content || '' : data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    if (!text) throw new HttpError(502, 'AI returned an empty answer.', { retryable: true });
    return text;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /** One AI call with a timeout per attempt and at most cfg.aiMaxAttempts attempts (exponential backoff + jitter). */
  async function complete(parts, { log } = {}) {
    if (!cfg.key) throw new HttpError(503, `AI is not configured: set ${cfg.keyName} in server/.env.`, { unconfigured: true });
    let lastErr;
    for (let attempt = 1; attempt <= cfg.aiMaxAttempts; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), cfg.aiTimeoutMs);
      try {
        return await once(parts, ctrl.signal);
      } catch (e) {
        let err = e;
        if (e.name === 'AbortError') err = new HttpError(504, 'AI request timed out.'); // not retried: the wait was already long
        else if (!(e instanceof HttpError)) err = new HttpError(502, 'Could not reach the AI provider.', { retryable: true });
        lastErr = err;
        let wait = cfg.aiBackoffMs * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
        // A quota error is retried once, and only if the provider says the wait is short.
        const retry = err.retryable || (err.quota && attempt === 1 && err.retryAfterSec && err.retryAfterSec <= 10);
        if (err.quota && err.retryAfterSec) wait = err.retryAfterSec * 1000;
        if (!retry || attempt === cfg.aiMaxAttempts) break;
        log?.warn('ai retry', { attempt, status: err.status });
        await sleep(wait);
      } finally { clearTimeout(timer); }
    }
    throw lastErr;
  }

  return { name: cfg.provider, model: cfg.model, configured: Boolean(cfg.key), supportsPdf: cfg.provider === 'gemini', maxImages: oa ? 3 : 12, complete };
}

module.exports = { makeProvider };
