// Tiny structured logger. Never log request bodies, tokens or API keys.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
function create(level = 'info', sink = console) {
  const min = LEVELS[level] ?? 20;
  const out = (lvl, msg, extra) => {
    if (LEVELS[lvl] < min) return;
    const line = JSON.stringify({ t: new Date().toISOString(), level: lvl, msg, ...extra });
    (lvl === 'error' || lvl === 'warn' ? sink.error : sink.log)(line);
  };
  return { debug: (m, e) => out('debug', m, e), info: (m, e) => out('info', m, e), warn: (m, e) => out('warn', m, e), error: (m, e) => out('error', m, e) };
}
module.exports = { create };
