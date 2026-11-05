// Line diff (LCS) used to preview AI changes before they are applied. Pure, no dependencies.
export type DiffOp = { t: 'eq' | 'add' | 'del'; text: string; a?: number; b?: number }; // a/b = 1-based line numbers

const MAX_CELLS = 4_000_000;

export function diffLines(oldText: string, newText: string): DiffOp[] {
  const a = oldText === '' ? [] : oldText.replace(/\r\n/g, '\n').split('\n');
  const b = newText === '' ? [] : newText.replace(/\r\n/g, '\n').split('\n');
  // trim common prefix/suffix first: keeps the table small for typical edits
  let s = 0;
  while (s < a.length && s < b.length && a[s] === b[s]) s++;
  let ea = a.length, eb = b.length;
  while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) { ea--; eb--; }
  const A = a.slice(s, ea), B = b.slice(s, eb);
  const ops: DiffOp[] = [];
  for (let i = 0; i < s; i++) ops.push({ t: 'eq', text: a[i], a: i + 1, b: i + 1 });

  if ((A.length + 1) * (B.length + 1) > MAX_CELLS) {
    // Too big for an exact diff: show the whole middle as replaced (honest and cheap).
    A.forEach((x, i) => ops.push({ t: 'del', text: x, a: s + i + 1 }));
    B.forEach((x, i) => ops.push({ t: 'add', text: x, b: s + i + 1 }));
  } else {
    const n = A.length, m = B.length;
    const w = m + 1;
    const dp = new Uint32Array((n + 1) * w);
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
      dp[i * w + j] = A[i] === B[j] ? dp[(i + 1) * w + j + 1] + 1 : Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1]);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { ops.push({ t: 'eq', text: A[i], a: s + i + 1, b: s + j + 1 }); i++; j++; }
      else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) { ops.push({ t: 'del', text: A[i], a: s + i + 1 }); i++; }
      else { ops.push({ t: 'add', text: B[j], b: s + j + 1 }); j++; }
    }
    while (i < n) { ops.push({ t: 'del', text: A[i], a: s + i + 1 }); i++; }
    while (j < m) { ops.push({ t: 'add', text: B[j], b: s + j + 1 }); j++; }
  }
  for (let k = 0; k < a.length - ea; k++) ops.push({ t: 'eq', text: a[ea + k], a: ea + k + 1, b: eb + k + 1 });
  return ops;
}

export const diffStats = (ops: DiffOp[]) => ({ added: ops.filter((o) => o.t === 'add').length, removed: ops.filter((o) => o.t === 'del').length });

/** Collapses long unchanged stretches: keeps `context` lines around each change. */
export function hunks(ops: DiffOp[], context = 3): (DiffOp | { t: 'gap'; hidden: number })[] {
  const keep = new Array(ops.length).fill(false);
  ops.forEach((o, i) => { if (o.t !== 'eq') for (let k = Math.max(0, i - context); k <= Math.min(ops.length - 1, i + context); k++) keep[k] = true; });
  const out: (DiffOp | { t: 'gap'; hidden: number })[] = [];
  let hidden = 0;
  ops.forEach((o, i) => {
    if (keep[i]) { if (hidden) { out.push({ t: 'gap', hidden }); hidden = 0; } out.push(o); } else hidden++;
  });
  if (hidden) out.push({ t: 'gap', hidden });
  return out;
}
