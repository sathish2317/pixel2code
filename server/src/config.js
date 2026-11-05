// All configuration comes from environment variables (server/.env). Secrets never leave the server.
require('dotenv').config();
const path = require('path');

const OPENAI_STYLE = {
  groq: { url: 'https://api.groq.com/openai/v1/chat/completions', keyName: 'GROQ_API_KEY', modelName: 'GROQ_MODEL', model: 'qwen/qwen3.8-27b' },
  openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions', keyName: 'OPENROUTER_API_KEY', modelName: 'OPENROUTER_MODEL', model: 'nvidia/nemotron-3.5-super-vl:free' },
};

function load(env = process.env) {
  const provider = (env.AI_PROVIDER || 'gemini').toLowerCase();
  const oa = OPENAI_STYLE[provider];
  if (!oa && provider !== 'gemini') throw new Error(`Unknown AI_PROVIDER "${provider}". Use gemini, groq or openrouter.`);
  const keyName = oa ? oa.keyName : 'GEMINI_API_KEY';

  // Users: APP_USERS="alice:tokenA,bob:tokenB". APP_TOKEN alone keeps the old single-user setup (user "local").
  const tokens = new Map();
  for (const part of String(env.APP_USERS || '').split(',')) {
    const i = part.indexOf(':');
    if (i > 0) {
      const id = part.slice(0, i).trim(), tok = part.slice(i + 1).trim();
      if (/^[\w.-]{1,40}$/.test(id) && tok.length >= 8) tokens.set(tok, id);
    }
  }
  if (env.APP_TOKEN) tokens.set(env.APP_TOKEN, 'local');

  return {
    port: Number(env.PORT) || 8787,
    provider,
    model: oa ? env[oa.modelName] || oa.model : env.GEMINI_MODEL || 'gemini-2.5-flash',
    openaiStyle: oa || null,
    // AI_BASE_URL lets you point the adapter at a proxy or a local test server. Default is the real provider.
    baseUrl: env.AI_BASE_URL || null,
    keyName,
    key: env[keyName] || '',
    tokens,
    dbPath: env.DB_PATH || path.join(__dirname, '..', 'data', 'pixel2code.db'),
    aiTimeoutMs: Number(env.AI_TIMEOUT_MS) || 240_000,
    aiMaxAttempts: Math.min(Math.max(Number(env.AI_MAX_ATTEMPTS) || 3, 1), 4), // never an infinite loop
    aiBackoffMs: Number(env.AI_BACKOFF_MS) || 1000,
    aiRateLimit: Math.min(Math.max(Number(env.AI_RATE_LIMIT) || 20, 1), 1000),
    // Deep mode = analysis pass + generate + a self-check pass that fixes what is missing. DESIGN_VERIFY=off saves one AI call per design.
    verifyPass: String(env.DESIGN_VERIFY || 'on').toLowerCase() !== 'off',
    limits: {
      fileBytes: 1_000_000,      // one source file
      projectBytes: 8_000_000,   // all files of one project
      projectFiles: 500,
      projectsPerUser: 200,
      requestFilesChars: 400_000, // source sent to the AI in one request
    },
    cors: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((s) => s.trim()) : true,
    logLevel: env.LOG_LEVEL || 'info',
  };
}

module.exports = { load, OPENAI_STYLE };
