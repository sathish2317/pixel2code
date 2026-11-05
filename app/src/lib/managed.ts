import { AnimConfig, Project, ProjectAsset, ProjectFile, SectionStyle } from '../types';
import { dataUri, findPreviewAsset, mapRefs, rebaseCss } from './assets';
import { googleFontsUrl, stackFor } from './fonts';
import { buildMotionCss, buildMotionJs } from './autoMotion';

/**
 * "Managed blocks": the Fonts, Section and Animation panels write generated CSS/JS
 * between marker comments inside index.html. Re-applying replaces only the block between
 * the markers, so it is safe to run many times and never touches the rest of the code.
 */
const HEAD_START = '<!-- p2c:head:start -->';
const HEAD_END = '<!-- p2c:head:end -->';
const BODY_START = '<!-- p2c:body:start -->';
const BODY_END = '<!-- p2c:body:end -->';

function strip(html: string, a: string, b: string) {
  const i = html.indexOf(a);
  const j = html.indexOf(b);
  if (i === -1 || j === -1 || j < i) return html;
  return html.slice(0, i) + html.slice(j + b.length).replace(/^\r?\n/, '');
}

const esc = (s: string) => s.replace(/[^\w\-]/g, '');
const itemSel = (id: string) => `#${id} :is(.card,[class*="card"],li,article)`;

function entranceFrom(kind: string): string | null {
  switch (kind) {
    case 'fade-in': return 'opacity:0';
    case 'fade-up': return 'opacity:0;transform:translateY(40px)';
    case 'fade-down': return 'opacity:0;transform:translateY(-40px)';
    case 'fade-left': return 'opacity:0;transform:translateX(40px)';
    case 'fade-right': return 'opacity:0;transform:translateX(-40px)';
    case 'zoom-in': return 'opacity:0;transform:scale(.92)';
    default: return null;
  }
}

function animCss(a: AnimConfig): string {
  const id = esc(a.sectionId);
  const t = `${a.duration}ms ease ${a.delay}ms`;
  const from = entranceFrom(a.kind);
  if (from) {
    return `#${id}.p2c-pre{${from}}\n#${id}.p2c-pre.p2c-in{opacity:1;transform:none;transition:opacity ${t},transform ${t}}`;
  }
  const sel = a.scope === 'items' ? itemSel(id) : `#${id}`;
  const base = `${sel}{transition:transform ${a.duration}ms ease,box-shadow ${a.duration}ms ease}`;
  const hover =
    a.kind === 'hover-lift' ? 'transform:translateY(-6px)'
    : a.kind === 'hover-scale' ? 'transform:scale(1.04)'
    : 'box-shadow:0 12px 30px rgba(0,0,0,.25)';
  return `${base}\n${sel}:hover{${hover}}`;
}

function sectionCss(id: string, s: SectionStyle): string {
  const out: string[] = [];
  const rules: string[] = [];
  if (s.bg) rules.push(`background:${s.bg}`);
  if (s.paddingY !== undefined) rules.push(`padding-top:${s.paddingY}px`, `padding-bottom:${s.paddingY}px`);
  if (s.minHeight) rules.push(`min-height:${s.minHeight}px`);
  if (s.textAlign) rules.push(`text-align:${s.textAlign}`);
  if (rules.length) out.push(`#${id}{${rules.join(';')}}`);
  if (s.hideMobile) out.push(`@media (max-width:767px){#${id}{display:none!important}}`);
  if (s.hideTablet) out.push(`@media (min-width:768px) and (max-width:1023px){#${id}{display:none!important}}`);
  if (s.hideDesktop) out.push(`@media (min-width:1024px){#${id}{display:none!important}}`);
  return out.join('\n');
}

export function buildHeadBlock(p: Project): string {
  const f = p.fonts;
  const url = googleFontsUrl([f.heading, f.body, f.button]);
  const css: string[] = [];
  if (f.heading) css.push(`h1,h2,h3,h4,h5,h6{font-family:${stackFor(f.heading)}}`);
  if (f.body) css.push(`body{font-family:${stackFor(f.body)}}`);
  if (f.button) css.push(`button,.btn,input[type=submit]{font-family:${stackFor(f.button)}}`);
  for (const [id, s] of Object.entries(p.sectionStyles)) {
    const c = sectionCss(esc(id), s);
    if (c) css.push(c);
  }
  const anims = p.animations.filter((a) => a.enabled);
  for (const a of anims) css.push(animCss(a));
  if (anims.length)
    css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.p2c-pre{opacity:1!important;transform:none!important}}');
  if (p.motion?.enabled) css.push(buildMotionCss(p.motion));
  if (!url && !css.length) return '';
  const link = url
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="${url}">\n`
    : '';
  return `${HEAD_START}\n${link}<style id="p2c-managed">\n${css.join('\n')}\n</style>\n${HEAD_END}`;
}

export function buildBodyBlock(p: Project): string {
  const ids = [
    ...new Set(
      p.animations
        .filter((a) => a.enabled && entranceFrom(a.kind))
        .map((a) => esc(a.sectionId))
    ),
  ];
  const motionJs = p.motion ? buildMotionJs(p.motion) : '';
  if (!ids.length && !motionJs) return '';
  const motionTag = motionJs ? `\n<script>\n${motionJs}\n</script>` : '';
  if (!ids.length) return `${BODY_START}${motionTag}\n${BODY_END}`;
  // Uses IntersectionObserver, no library. Content stays visible if JS or the observer is unavailable.
  return `${BODY_START}${motionTag}
<script>
(function(){
  var ids=${JSON.stringify(ids)};
  if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add('p2c-in');io.unobserve(e.target);}
  });},{threshold:0.15});
  ids.forEach(function(id){var el=document.getElementById(id);
    if(el){el.classList.add('p2c-pre');io.observe(el);}});
})();
</script>
${BODY_END}`;
}

/** Returns files with the managed blocks refreshed in index.html. */
export function applyManaged(p: Project): ProjectFile[] {
  return p.files.map((f) => {
    if (f.path !== 'index.html') return f;
    let html = strip(strip(f.content, HEAD_START, HEAD_END), BODY_START, BODY_END);
    const head = buildHeadBlock(p);
    const body = buildBodyBlock(p);
    if (head) html = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, () => head + '\n</head>') : head + '\n' + html;
    if (body) html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => body + '\n</body>') : html + '\n' + body;
    return { ...f, content: html };
  });
}

export interface SectionInfo {
  id: string;
  tag: string;
}

export function detectSections(files: ProjectFile[]): SectionInfo[] {
  const html = files.find((f) => f.path === 'index.html')?.content ?? '';
  const out: SectionInfo[] = [];
  const re = /<(header|section|main|nav|footer|aside)\b[^>]*\bid\s*=\s*["']([\w-]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push({ tag: m[1].toLowerCase(), id: m[2] });
  return out;
}

const REPORTER = `<script>
(function(){
  function send(m){try{
    if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(m));
    else parent.postMessage({p2c:true,m:m},'*');}catch(e){}}
  ['log','info','warn','error','debug'].forEach(function(k){
    var orig=console[k];
    console[k]=function(){
      try{var parts=[].slice.call(arguments).map(function(a){
        if(typeof a==='string')return a;
        try{return JSON.stringify(a);}catch(x){return String(a);}
      });send({type:'log',level:k,msg:parts.join(' ').slice(0,500)});}catch(x){}
      if(orig)orig.apply(console,arguments);
    };
  });
  window.addEventListener('error',function(e){
    var t=e.target;
    if(t&&t!==window&&(t.src||t.href)){send({type:'asset',msg:'Failed to load: '+(t.src||t.href)});return;}
    send({type:'error',msg:(e.message||'Error')+(e.lineno?' (line '+e.lineno+')':'')});
  },true);
  window.addEventListener('unhandledrejection',function(e){send({type:'error',msg:String(e.reason)});});
  // Network inspector: record fetch/XHR outcomes and resource timing for the preview debugger.
  function network(method,url,status,ok,duration,error){send({type:'network',msg:method+' '+String(url||'')+' — '+(status==null?'failed':status)+(duration==null?'':' · '+Math.round(duration)+'ms')+(error?' · '+error:''),source:String(url||''),level:ok?'info':'error',status:status==null?0:status,duration:duration==null?0:Math.round(duration)});}
  if(window.fetch){var nativeFetch=window.fetch;window.fetch=function(input,init){var url=typeof input==='string'?input:(input&&input.url)||String(input),method=(init&&init.method)||(input&&input.method)||'GET',start=performance.now();return nativeFetch.apply(this,arguments).then(function(res){network(method,url,res.status,res.ok,performance.now()-start,'');return res;},function(err){network(method,url,0,false,performance.now()-start,String(err&&err.message||err));throw err;});};}
  if(window.XMLHttpRequest){var openX=XMLHttpRequest.prototype.open,sendX=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.open=function(method,url){this.__p2cNet={method:method,url:url};return openX.apply(this,arguments);};XMLHttpRequest.prototype.send=function(){var x=this,start=performance.now();x.addEventListener('loadend',function(){var n=x.__p2cNet||{};network(n.method||'GET',n.url||'',x.status,x.status>=200&&x.status<400,performance.now()-start,x.status?'':'Request failed');},{once:true});return sendX.apply(this,arguments);};}
  window.addEventListener('load',function(){setTimeout(function(){try{performance.getEntriesByType('resource').forEach(function(r){if(r.name&&r.name.indexOf('data:')!==0)send({type:'network',msg:'RESOURCE '+r.name+' · '+Math.round(r.duration)+'ms',source:r.name,level:'info',duration:Math.round(r.duration)});});}catch(e){}},0);});
  window.__p2cHighlight=function(id){
    var o=document.getElementById('__p2c_hl');if(o)o.remove();
    if(!id)return;var el=document.getElementById(id);if(!el)return;
    el.scrollIntoView({behavior:'smooth',block:'start'});
    var r=el.getBoundingClientRect();var d=document.createElement('div');d.id='__p2c_hl';
    d.style.cssText='position:absolute;pointer-events:none;z-index:2147483647;border:3px solid #6c8cff;background:rgba(108,140,255,.12);left:'+(r.left+scrollX)+'px;top:'+(r.top+scrollY)+'px;width:'+r.width+'px;height:'+r.height+'px';
    document.body.appendChild(d);setTimeout(function(){d.remove();},2500);
  };
  window.addEventListener('message',function(e){if(e.data&&e.data.p2cHighlight!==undefined)window.__p2cHighlight(e.data.p2cHighlight);});
  // The preview is a srcdoc page. A plain href="#about" would resolve against the APP's address and load the whole app inside the preview,
  // so in-page links are scrolled by hand and every other navigation is blocked (it works normally in the exported site).
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a||e.defaultPrevented)return;
    var h=a.getAttribute('href')||'';
    if(h.charAt(0)==='#'){
      e.preventDefault();
      if(h.length<2){window.scrollTo({top:0,behavior:'smooth'});return;}
      var el=null;try{el=document.getElementById(decodeURIComponent(h.slice(1)))||document.querySelector(h);}catch(x){}
      if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    if(/^(mailto:|tel:|javascript:)/i.test(h))return;
    e.preventDefault();
    send({type:'asset',msg:'Link "'+h+'" is not opened inside the preview. It works in the exported site.'});
  });
  document.addEventListener('submit',function(e){
    if(e.defaultPrevented)return;e.preventDefault();
    send({type:'asset',msg:'A form was submitted. The preview does not send forms; connect it to your server in the real site.'});
  });
})();
</script>`;

/** Inlines local CSS/JS into one HTML string for the sandboxed preview. */
export function bundleForPreview(files: ProjectFile[], assets: ProjectAsset[] = [], entry?: string): string {
  const clean = (p: string) => p.replace(/[?#].*$/, '').replace(/^\/+/, '').replace(/\\/g, '/').replace(/^(\.\/)+/, '');
  const base = (p: string) => p.split('/').pop() || p;
  const map = new Map(files.map((f) => [clean(f.path), f.content]));
  const resolve = (ref: string, fromPath = '') => {
    const raw = clean(ref);
    const dir = fromPath.includes('/') ? fromPath.slice(0, fromPath.lastIndexOf('/')) : '';
    const parts = (ref.startsWith('/') ? [] : dir.split('/').filter(Boolean));
    for (const seg of raw.split('/')) {
      if (!seg || seg === '.') continue;
      if (seg === '..') parts.pop(); else parts.push(seg);
    }
    return parts.join('/');
  };
  const findPath = (ref: string, fromPath = ''): string | undefined => {
    if (/^(https?:)?\/\/|^(data:|blob:|#|mailto:|tel:|javascript:)/i.test(ref)) return undefined;
    const candidates = [resolve(ref, fromPath), clean(ref), resolve(ref)];
    for (const candidate of candidates) if (map.has(candidate)) return candidate;
    // Last-resort compatibility for projects whose HTML omits a folder prefix.
    const wanted = base(clean(ref));
    for (const path of map.keys()) if (base(path) === wanted) return path;
    return undefined;
  };
  const find = (ref: string, fromPath = ''): string | undefined => {
    const p = findPath(ref, fromPath);
    return p === undefined ? undefined : map.get(p);
  };
  const wantedEntry = entry ? clean(entry) : '';
  const entryPath = wantedEntry && /\.html?$/i.test(wantedEntry) && map.has(wantedEntry) ? wantedEntry : map.has('index.html') ? 'index.html' : files.find((f) => /\.html?$/i.test(f.path))?.path;
  if (!entryPath) return '<!doctype html><html><body><p style="font-family:sans-serif">No HTML file found in this project.</p></body></html>';
  let html = map.get(entryPath) || '';
  const moduleRoots: string[] = [];
  const moduleSources: Record<string, string> = {};
  for (const file of files) if (/\.(m?js)$/i.test(file.path)) moduleSources[clean(file.path)] = file.content;
  const utf8Base64 = (value: string) => {
    const bytes = new TextEncoder().encode(value);
    let binary = ''; for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; let out = '';
    for (let i = 0; i < binary.length; i += 3) { const a = binary.charCodeAt(i), hasB = i + 1 < binary.length, hasC = i + 2 < binary.length, b = hasB ? binary.charCodeAt(i + 1) : 0, c = hasC ? binary.charCodeAt(i + 2) : 0; out += alphabet[a >> 2] + alphabet[((a & 3) << 4) | (b >> 4)] + (hasB ? alphabet[((b & 15) << 2) | (c >> 6)] : '=') + (hasC ? alphabet[c & 63] : '='); }
    return out;
  };
  const dataUrlForLocal = (ref: string, fromPath: string): string | undefined => {
    const path = findPath(ref, fromPath);
    if (path) {
      const content = map.get(path);
      if (content !== undefined && !/\.(html?|css|m?js|tsx?)$/i.test(path)) {
        const ext = path.split('.').pop()?.toLowerCase();
        const mime = ext === 'json' ? 'application/json' : ext === 'svg' ? 'image/svg+xml' : ext === 'txt' || ext === 'md' ? 'text/plain' : ext === 'csv' ? 'text/csv' : 'application/octet-stream';
        return `data:${mime};base64,${utf8Base64(content)}`;
      }
    }
    const asset = assets.find((a) => a.path === clean(ref) || a.path === resolve(ref, fromPath));
    return asset ? `data:${asset.mime};base64,${asset.base64}` : undefined;
  };
  const rewriteLiteralFetches = (code: string, fromPath: string) => code.replace(/\bfetch\(\s*(['"])(\.{1,2}\/[^'"]+|[^'"]+\.(?:json|txt|csv))\1/g, (whole, quote, ref) => {
    const dataUrl = dataUrlForLocal(String(ref), fromPath);
    return dataUrl ? whole.replace(`${quote}${ref}${quote}`, `${quote}${dataUrl}${quote}`) : whole;
  });
  // Image / font file names written inside JavaScript strings (slider arrays, img.src = "...", new FontFace(...)) are embedded too,
  // otherwise the page only works when the real files sit next to it.
  const entryDir = entryPath.includes('/') ? entryPath.slice(0, entryPath.lastIndexOf('/')) : '';
  const JS_ASSET = /(["'])((?:\\.|(?!\1)[^\\\n])*?\.(?:png|jpe?g|webp|gif|svg|avif|ico|bmp|woff2?|ttf|otf)(?:[?#](?:\\.|(?!\1)[^\\\n])*)?)\1/gi;
  const inlineJsAssets = (code: string, fromPath: string): string => {
    if (!assets.length) return code;
    const fromDir = fromPath.includes('/') ? fromPath.slice(0, fromPath.lastIndexOf('/')) : '';
    return code.replace(JS_ASSET, (whole, quote, ref) => {
      const a = findPreviewAsset(String(ref), ['', fromDir], assets);
      return a ? `${quote}${dataUri(a)}${quote}` : whole;
    });
  };
  const rewriteJs = (code: string, fromPath: string) => inlineJsAssets(rewriteLiteralFetches(code, fromPath), fromPath);
  // Inline local stylesheets and nested @import rules while preserving each file's original URL base.
  const inlineCss = (path: string, seen = new Set<string>()): string => {
    if (seen.has(path)) return `/* Pixel2Code: skipped circular CSS import ${path} */`;
    seen.add(path);
    const source = String(map.get(path) || '');
    const expanded = source.replace(/@import\s+(?:url\(\s*)?(['\"]?)([^'\")\s;]+)\1\s*\)?([^;]*);/gi, (whole, _quote, ref, media) => {
      const importedPath = findPath(String(ref), path);
      if (!importedPath || !/\.css$/i.test(importedPath)) return whole;
      const nested = inlineCss(importedPath, new Set(seen));
      return String(media || '').trim() ? `@media ${String(media).trim()} {\n${nested}\n}` : nested;
    });
    return rebaseCss(expanded, path);
  };
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) return tag;
    const href = /href\s*=\s*["']?([^"'\s>]+)/i.exec(tag)?.[1];
    const cssPath = href ? findPath(href, entryPath) : undefined;
    if (cssPath === undefined) return tag;
    const css = inlineCss(cssPath);
    return `<style data-p2c-source="${cssPath.replace(/["<>]/g, '')}">\n${css}\n</style>`;
  });
  // Keep file ordering from HTML. Defer scripts are moved after parsed markup so DOM-dependent
  // hamburger/menu handlers initialize reliably. External scripts remain external when not in ZIP.
  const deferred: string[] = [];
  html = html.replace(/<script\b([^>]*?)\bsrc\s*=\s*["']?([^"'\s>]+)["']?([^>]*)>\s*<\/script>/gi, (tag, a, src, b) => {
    const jsPath = findPath(String(src), entryPath);
    if (jsPath === undefined) return tag;
    const js = String(map.get(jsPath) || '');
    const attrs = `${a} ${b}`;
    const isModule = /type\s*=\s*["']?module/i.test(attrs);
    if (isModule) { moduleRoots.push(jsPath); moduleSources[jsPath] = rewriteJs(js, jsPath); return ''; }
    const preparedJs = rewriteJs(js, jsPath);
    const wantsDefer = !isModule && /\bdefer\b/i.test(attrs);
    const cleaned = attrs.replace(/\b(defer|async)\b(?:\s*=\s*["'][^"']*["'])?/gi, '').replace(/\s+/g, ' ').trim();
    const code = `<script${cleaned ? ' ' + cleaned : ''} data-p2c-source="${jsPath.replace(/["<>]/g, '')}">\n${preparedJs.replace(/<\/script/gi, '<\\/script')}\n//# sourceURL=${jsPath.replace(/[\r\n]/g, '')}\n</script>`;
    if (wantsDefer) { deferred.push(code); return ''; }
    return code;
  });
  if (deferred.length) html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => deferred.join('\n') + '\n</body>') : html + '\n' + deferred.join('\n');
  if (assets.length) {
    // inline <script> blocks (no src): same treatment as the external files above
    html = html.replace(/(<script\b)([^>]*)(>)([\s\S]*?)(<\/script>)/gi, (whole, a, attrs, b, body, c) => {
      if (/\bsrc\s*=/i.test(attrs) || (/\btype\s*=/i.test(attrs) && !/type\s*=\s*["']?(?:module|text\/javascript|application\/javascript)/i.test(attrs))) return whole;
      return a + attrs + b + inlineJsAssets(body, entryPath) + c;
    });
  }
  if (moduleRoots.length) {
    Object.keys(moduleSources).forEach((path) => { moduleSources[path] = rewriteJs(moduleSources[path], path); });
    const sourceJson = JSON.stringify(moduleSources).replace(/</g, '\\u003c');
    const rootsJson = JSON.stringify(moduleRoots);
    const moduleLoader = `<script>/* Pixel2Code local ES-module loader. Local relative imports are mapped to isolated blob URLs. */
(function(){var sources=${sourceJson},roots=${rootsJson},urls=Object.create(null);function resolve(from,spec){var a=from.split('/');a.pop();spec.split('/').forEach(function(s){if(!s||s==='.')return;if(s==='..')a.pop();else a.push(s)});var p=a.join('/');if(sources[p]!==undefined)return p;if(!/\\.(m?js)$/i.test(p)){if(sources[p+'.js']!==undefined)return p+'.js';if(sources[p+'.mjs']!==undefined)return p+'.mjs';if(sources[p+'/index.js']!==undefined)return p+'/index.js'}return p}async function build(path,stack){if(urls[path])return urls[path];if((stack||[]).indexOf(path)>=0)throw new Error('Circular local module import is not supported by the isolated preview loader: '+path);if(sources[path]===undefined)throw new Error('Local module not found: '+path);var next=(stack||[]).concat(path),code=sources[path],re=/((?:\\bfrom\\s*|\\bimport\\s*(?:\\(\\s*)?))(['\"])(\\.{1,2}\\/[^'\"]+)\\2/g,matches=[],m;while((m=re.exec(code)))matches.push({start:m.index,end:re.lastIndex,whole:m[0],prefix:m[1],quote:m[2],spec:m[3]});for(var i=matches.length-1;i>=0;i--){var hit=matches[i],dep=resolve(path,hit.spec);if(sources[dep]!==undefined){var url=await build(dep,next);code=code.slice(0,hit.start)+hit.prefix+hit.quote+url+hit.quote+code.slice(hit.end)}}var url=URL.createObjectURL(new Blob([code+'\\n//# sourceURL='+path],{type:'text/javascript'}));urls[path]=url;return url}roots.forEach(function(path){build(path,[]).then(function(url){return import(url)}).catch(function(e){try{parent.postMessage({p2c:true,m:{type:'error',msg:e.message,source:path,stack:e.stack||''}},'*')}catch(_){}console.error(e)})})})();</script>`;
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => moduleLoader + '\n</body>') : html + moduleLoader;
  }
  // Embed every image / font that a src, srcset, poster, style="" or <style> url(...) points to.
  // Lookup is forgiving (case, folder prefix, unique file name) because the preview cannot read the ZIP's folders.
  html = mapRefs(html, 'html', (ref) => {
    const a = findPreviewAsset(ref, ['', entryDir], assets);
    return a ? dataUri(a) : undefined;
  }, true);
  const reporter = REPORTER.replace("send({type:'error',msg:(e.message||'Error')+(e.lineno?' (line '+e.lineno+')':'')});", "send({type:'error',msg:(e.message||'Error'),source:e.filename||'',line:e.lineno||0,column:e.colno||0,stack:e.error&&e.error.stack||''});")
    .replace("send({type:'error',msg:String(e.reason)});", "var r=e.reason;send({type:'error',msg:String(r&&r.message||r),source:'',line:0,column:0,stack:r&&r.stack||''});");
  return /<head[^>]*>/i.test(html)
    ? html.replace(/<head[^>]*>/i, (m) => m + reporter)
    : reporter + html;
}

/** Removes managed blocks so the AI only sees (and edits) the user's real code. */
export function stripManaged(files: ProjectFile[]): ProjectFile[] {
  return files.map((f) =>
    f.path === 'index.html'
      ? { ...f, content: strip(strip(f.content, HEAD_START, HEAD_END), BODY_START, BODY_END) }
      : f
  );
}