const JSZip = require('jszip');
const { safePath } = require('../filePolicy');

async function zipFiles(files, rootName) {
  const zip = new JSZip();
  const seen = new Set();
  for (const f of files) {
    if (!safePath(f.path) || seen.has(f.path)) continue; // never write an unsafe path into an archive
    seen.add(f.path);
    zip.file(f.path, f.content, { date: new Date(0) });
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}
const downloadName = (n) => (String(n || 'project').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'project') + '.zip';

module.exports = { zipFiles, downloadName };
