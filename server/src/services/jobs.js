// In-process job queue for long AI work (convert, big reviews). Jobs live in memory only:
// they are lost if the server restarts, and there is no cross-process queue. For a hosted multi-instance setup use a real queue (BullMQ, SQS ...).
const crypto = require('crypto');

function create({ concurrency = 2, ttlMs = 30 * 60_000, maxPerUser = 20 } = {}) {
  const jobs = new Map();
  const queue = [];
  let running = 0;

  const sweep = () => { const t = Date.now(); for (const [id, j] of jobs) if (j.finishedAt && t - j.finishedAt > ttlMs) jobs.delete(id); };
  const pump = () => {
    while (running < concurrency && queue.length) {
      const j = queue.shift();
      running++; j.status = 'running'; j.startedAt = Date.now();
      Promise.resolve().then(j.fn).then((r) => { j.result = r; j.status = 'done'; }, (e) => { j.error = { message: e.message, status: e.status || 500 }; j.status = 'failed'; })
        .finally(() => { j.finishedAt = Date.now(); delete j.fn; running--; pump(); });
    }
  };

  return {
    submit(userId, kind, fn) {
      sweep();
      const active = [...jobs.values()].filter((j) => j.userId === userId && !j.finishedAt).length;
      if (active >= maxPerUser) { const e = new Error('Too many unfinished jobs. Wait for one to finish.'); e.status = 429; throw e; }
      const id = crypto.randomBytes(9).toString('base64url');
      const j = { id, userId, kind, status: 'queued', createdAt: Date.now(), fn };
      jobs.set(id, j); queue.push(j); pump();
      return id;
    },
    get(userId, id) {
      const j = jobs.get(id);
      if (!j || j.userId !== userId) return null;
      return { id: j.id, kind: j.kind, status: j.status, createdAt: j.createdAt, finishedAt: j.finishedAt, result: j.result, error: j.error };
    },
    size: () => jobs.size,
  };
}
module.exports = { create };
