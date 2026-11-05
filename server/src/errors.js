class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    Object.assign(this, extra);
  }
}

// Small request validators (throw 400 with a readable message).
const bad = (msg) => new HttpError(400, msg);
const v = {
  str(x, name, { min = 0, max = 10_000, optional = false } = {}) {
    if (x === undefined || x === null) { if (optional) return undefined; throw bad(`${name} is required.`); }
    if (typeof x !== 'string') throw bad(`${name} must be text.`);
    if (x.length < min) throw bad(`${name} is too short.`);
    if (x.length > max) throw bad(`${name} is too long (max ${max} characters).`);
    return x;
  },
  oneOf(x, name, list, def) {
    if (x === undefined || x === null || x === '') { if (def !== undefined) return def; throw bad(`${name} is required.`); }
    if (!list.includes(x)) throw bad(`${name} must be one of: ${list.join(', ')}.`);
    return x;
  },
  int(x, name, { min = 0, max = 1e9, def } = {}) {
    if (x === undefined || x === '') { if (def !== undefined) return def; throw bad(`${name} is required.`); }
    const n = Number(x);
    if (!Number.isInteger(n) || n < min || n > max) throw bad(`${name} must be a whole number between ${min} and ${max}.`);
    return n;
  },
  id(x, name) {
    if (typeof x !== 'string' || !/^[A-Za-z0-9_-]{4,64}$/.test(x)) throw bad(`${name} is not a valid id.`);
    return x;
  },
  bool: (x, def = false) => (x === undefined ? def : x === true || x === 'true' || x === '1'),
};

module.exports = { HttpError, v };
