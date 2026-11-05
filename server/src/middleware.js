const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { HttpError } = require('./errors');

const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

/** Token -> user. Every private route needs it; ownership is then enforced by every query (user_id). */
function auth(cfg, repos) {
  return (req, _res, next) => {
    if (!cfg.tokens.size) return next(new HttpError(500, 'Server has no APP_TOKEN (or APP_USERS) set.'));
    const given = req.get('x-app-token') || '';
    let user = null;
    for (const [tok, id] of cfg.tokens) if (safeEq(tok, given)) user = id;
    if (!user) return next(new HttpError(401, 'Wrong app token.'));
    req.userId = user;
    repos.users.ensure(user);
    next();
  };
}

function requestLog(log) {
  return (req, res, next) => {
    const t = Date.now();
    req.id = crypto.randomBytes(4).toString('hex');
    res.setHeader('x-request-id', req.id);
    res.on('finish', () => log.info('request', { id: req.id, method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - t, user: req.userId }));
    next();
  };
}

const limiter = (max, windowMs = 60_000) => rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Slow down and retry in a minute.' } });

function notFound(_req, _res, next) { next(new HttpError(404, 'Not found.')); }

function errorHandler(log) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, _next) => {
    if (err.type === 'entity.too.large') err = new HttpError(413, 'Request too large.');
    else if (err.type === 'entity.parse.failed') err = new HttpError(400, 'Request body is not valid JSON.');
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    if (status >= 500) {
      // Keep the detailed cause in the backend terminal only. Never return stack traces
      // or provider credentials to the app/browser.
      log.error('request failed', {
        id: req.id,
        method: req.method,
        path: req.originalUrl || req.path,
        status,
        message: err.message || 'Unknown server error',
        stack: err.stack,
      });
    }
    const body = { error: status === 500 && !err.expose ? 'Something went wrong on the server.' : (err.message || 'Request failed.') };
    if (err.quota) { body.quota = true; if (err.retryAfterSec) { body.retryAfterSec = err.retryAfterSec; res.set('retry-after', String(err.retryAfterSec)); } }
    if (err.unconfigured) body.unconfigured = true;
    if (req.id) body.requestId = req.id;
    res.status(status).json(body);
  };
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { auth, requestLog, limiter, notFound, errorHandler, wrap };
