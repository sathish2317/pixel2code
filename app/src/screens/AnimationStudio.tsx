import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Settings as AppSettings } from '../storage';
import { ANIMATION_PRESETS, CATEGORIES, EASINGS, type Category, type Preset, type Trigger } from '../lib/anim/motionPresets';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../components/ui';
import { buildCss, buildColorHoverCss, splitSelectors } from '../lib/anim/cssBuilder';

const SAMPLE_HTML = `<main class="demo-page">\n  <section class="hero-card">\n    <span class="eyebrow">PIXEL2CODE • MOTION LAB</span>\n    <h1 class="hero-title">Design in motion.</h1>\n    <p class="hero-copy">Paste your own HTML and CSS, select any element, and create production-ready effects.</p>\n    <div class="hero-actions"><button class="primary-button">Explore effects <span>↗</span></button><a class="text-link" href="#features">Learn more</a></div>\n    <div class="mini-stats"><div><strong>120+</strong><small>CSS effects</small></div><div><strong>100%</strong><small>Editable code</small></div><div><strong>0</strong><small>Framework lock-in</small></div></div>\n  </section>\n</main>`;
const SAMPLE_CSS = `* { box-sizing: border-box; }\nbody { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #eef2ff; color: #172033; }\n.demo-page { min-height: 100vh; display: grid; place-items: center; padding: 28px; background: radial-gradient(circle at 15% 15%, #dbeafe, transparent 38%), linear-gradient(135deg,#f8fafc,#e0e7ff); }\n.hero-card { width: min(100%, 620px); padding: clamp(28px,5vw,54px); border: 1px solid rgba(255,255,255,.9); border-radius: 28px; background: rgba(255,255,255,.82); box-shadow: 0 24px 70px rgba(44,54,100,.14); }\n.eyebrow { color: #5865d8; font-size: 11px; font-weight: 800; letter-spacing: .16em; }\n.hero-title { margin: 16px 0 12px; font-size: clamp(36px,7vw,62px); line-height: .98; letter-spacing: -.065em; }\n.hero-copy { max-width: 430px; color: #626b80; line-height: 1.7; }\n.hero-actions { display:flex; align-items:center; gap:20px; flex-wrap:wrap; margin-top:26px; }\n.primary-button { border:0; border-radius:12px; padding:14px 18px; background:#4f5ddd; color:white; font-weight:700; cursor:pointer; }\n.primary-button span { margin-left:12px; } .text-link { color:#414cc4; font-weight:700; text-decoration:none; }\n.mini-stats { display:flex; gap:36px; margin-top:36px; padding-top:22px; border-top:1px solid #e5e7f1; }\n.mini-stats div { display:grid; gap:5px; } .mini-stats strong { font-size:20px; } .mini-stats small { color:#7b8296; font-size:11px; }`;

function sanitizeHtml(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '').replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/<base\b[^>]*>/gi, '');
}
function makePreviewDocument(html: string, css: string, generatedCss: string): string {
  const safeHtml = sanitizeHtml(html);
  const doc = /<html[\s>]/i.test(safeHtml) ? safeHtml : `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${safeHtml}</body></html>`;
  const injected = `<style id="p2c-user-css">${css.replace(/<\/style/gi,'<\\/style')}</style><style id="p2c-generated-css">${generatedCss.replace(/<\/style/gi,'<\\/style')}</style><style id="p2c-inspector-css">html.p2c-pick-mode body{cursor:crosshair!important} .p2c-inspected{outline:2px solid #6d7cff!important;outline-offset:3px!important;}</style>`;
  const script = `<script>(function(){var chosen=null;var pickEnabled=true;function selector(el){if(el.id)return '#'+CSS.escape(el.id);var out=[],cur=el;while(cur&&cur.nodeType===1&&cur!==document.body&&out.length<4){var tag=cur.tagName.toLowerCase(),cls=Array.from(cur.classList||[]).filter(function(x){return !x.startsWith('p2c-')}).slice(0,2);var part=tag+(cls.length?'.'+cls.map(CSS.escape).join('.'): '');if(cur.parentElement){var same=Array.from(cur.parentElement.children).filter(function(n){return n.tagName===cur.tagName});if(same.length>1)part+=':nth-of-type('+(same.indexOf(cur)+1)+')';}out.unshift(part);if(cur.parentElement&&cur.parentElement.id){out.unshift('#'+CSS.escape(cur.parentElement.id));break;}cur=cur.parentElement;}return out.join(' ')}document.addEventListener('click',function(e){if(!pickEnabled)return;var el=e.target;if(!el||el===document.body||el===document.documentElement)return;e.preventDefault();e.stopPropagation();if(chosen)chosen.classList.remove('p2c-inspected');chosen=el;chosen.classList.add('p2c-inspected');parent.postMessage({type:'p2c-element-selected',selector:selector(el),tag:el.tagName.toLowerCase(),id:el.id||'',className:typeof el.className==='string'?el.className:'',html:el.outerHTML},'*');},true);window.addEventListener('message',function(e){var d=e.data||{};if(d.type==='p2c-set-css'){document.getElementById('p2c-generated-css').textContent=String(d.css||'');}if(d.type==='p2c-pick-mode'){pickEnabled=!!d.enabled;document.documentElement.classList.toggle('p2c-pick-mode',pickEnabled);}});})();</script>`;
  const headInsert = injected;
  if (/<\/head\s*>/i.test(doc)) return doc.replace(/<\/head\s*>/i, headInsert + '</head>') + script;
  return `<head>${headInsert}</head>` + doc + script;
}

export default function AnimationStudio({ settings, onBack, onComponentLab, toast }: { settings: AppSettings; onBack: () => void; onComponentLab: () => void; toast: (s: string) => void }) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1180;
  const medium = width >= 760;
  const frameRef = useRef<any>(null);
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [css, setCss] = useState(SAMPLE_CSS);
  const [outputCss, setOutputCss] = useState('');
  const [activePresetId, setActivePresetId] = useState('lift');
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [sourceTab, setSourceTab] = useState<'html'|'css'>('html');
  const [rightTab, setRightTab] = useState<'library'|'controls'|'code'>('library');
  const [selectedSelector, setSelectedSelector] = useState('.hero-card');
  const [parentSelector, setParentSelector] = useState('.hero-card');
  const [trigger, setTrigger] = useState<Trigger>('hover');
  const [duration, setDuration] = useState('350');
  const [delay, setDelay] = useState('0');
  const [easing, setEasing] = useState('cubic-bezier(.22,1,.36,1)');
  const [iteration, setIteration] = useState('1');
  const [direction, setDirection] = useState('normal');
  const [fillMode, setFillMode] = useState('both');
  const [playState, setPlayState] = useState('running');
  const [transitionProperties, setTransitionProperties] = useState('transform, opacity, color, background-color, border-color, box-shadow, filter, border-radius');
  const [customKeyframes, setCustomKeyframes] = useState(false);
  const [customKeyframeName, setCustomKeyframeName] = useState('p2cCustomMotion');
  const [keyframeFrom, setKeyframeFrom] = useState('opacity:0; transform:translateY(12px);');
  const [keyframeMid, setKeyframeMid] = useState('opacity:1; transform:translateY(-3px);');
  const [keyframeTo, setKeyframeTo] = useState('opacity:1; transform:translateY(0);');
  const [translateX, setTranslateX] = useState('8');
  const [translateY, setTranslateY] = useState('-8');
  const [scale, setScale] = useState('1.06');
  const [rotate, setRotate] = useState('5');
  const [skew, setSkew] = useState('6');
  const [perspective, setPerspective] = useState('800');
  const [opacity, setOpacity] = useState('.65');
  const [blur, setBlur] = useState('3');
  const [hoverColor, setHoverColor] = useState('#6366f1');
  const [bgColor, setBgColor] = useState('#e0e7ff');
  const [textColor, setTextColor] = useState('#3730a3');
  const [borderColor, setBorderColor] = useState('#818cf8');
  const [shadow, setShadow] = useState('rgba(99,102,241,.28)');
  const [radius, setRadius] = useState('24');
  const [reducedMotion, setReducedMotion] = useState(true);
  const [previewWidth, setPreviewWidth] = useState<'100%'|390|768>('100%');
  const [pickMode, setPickMode] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [fullView, setFullView] = useState(false);
  const fullFrameRef = useRef<any>(null);
  const [colorTarget, setColorTarget] = useState('');
  const [hoverBgOn, setHoverBgOn] = useState(false);
  const [hoverTextOn, setHoverTextOn] = useState(false);
  const [hoverBg, setHoverBg] = useState('#4f46e5');
  const [hoverText, setHoverText] = useState('#ffffff');
  const [whiteText, setWhiteText] = useState(true);
  const [hasManualCode, setHasManualCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'source'|'preview'|'effects'>('preview');
  const [mobileFocus, setMobileFocus] = useState<'source'|'effects'>('source');

  const activePreset = useMemo(() => ANIMATION_PRESETS.find(p => p.id === activePresetId) || ANIMATION_PRESETS[0], [activePresetId]);
  const filteredPresets = useMemo(() => ANIMATION_PRESETS.filter(p => (category === 'All' || p.category === category) && `${p.name} ${p.category} ${p.description} ${p.id}`.toLowerCase().includes(query.trim().toLowerCase())), [category, query]);
  const options = { duration, delay, easing, iteration: iteration === 'infinite' ? 'infinite' : String(Math.max(1, Number(iteration) || 1)), direction, fillMode, playState, transitionProperties, translateX, translateY, scale, rotate, skew, perspective, opacity, blur, hoverColor, bgColor, textColor, borderColor, shadow, radius, parentSelector, reducedMotion };
  const customFrames = customKeyframes ? `0% { ${keyframeFrom} } 50% { ${keyframeMid} } 100% { ${keyframeTo} }` : '';
  const effectCss = useMemo(() => buildCss(activePreset, selectedSelector, trigger, options, customFrames, customKeyframeName), [activePreset, selectedSelector, trigger, duration, delay, easing, iteration, direction, fillMode, playState, transitionProperties, customFrames, customKeyframeName, translateX, translateY, scale, rotate, skew, perspective, opacity, blur, hoverColor, bgColor, textColor, borderColor, shadow, radius, parentSelector, reducedMotion]);
  const colorCss = useMemo(() => buildColorHoverCss(colorTarget.trim() || selectedSelector, { bgOn: hoverBgOn, textOn: hoverTextOn, bg: hoverBg, text: hoverText, whiteWithBg: whiteText, duration, easing, withTransition: !(splitSelectors(colorTarget.trim() || selectedSelector).join() === splitSelectors(selectedSelector).join() && effectCss.includes('transition:')) }), [effectCss, colorTarget, selectedSelector, hoverBgOn, hoverTextOn, hoverBg, hoverText, whiteText, duration, easing]);
  const generated = useMemo(() => [effectCss, colorCss].filter(Boolean).join('\n'), [effectCss, colorCss]);
  const previewDocument = useMemo(() => makePreviewDocument(html, css, ''), [html, css, previewKey]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (event.source !== frameRef.current?.contentWindow && event.source !== fullFrameRef.current?.contentWindow) return;
      if (!data || data.type !== 'p2c-element-selected') return;
      if (typeof data.selector === 'string') { setSelectedSelector(data.selector); setParentSelector(prev => prev || data.selector); setRightTab('controls'); toast(`Selected ${data.selector}`); }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [toast]);

  useEffect(() => {
    if (!hasManualCode) setOutputCss(generated);
  }, [generated, hasManualCode]);

  useEffect(() => {
    post({ type: 'p2c-set-css', css: outputCss || generated });
  }, [outputCss, generated, previewKey]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !fullView || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullView(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullView]);

  const post = (message: any) => { for (const r of [frameRef, fullFrameRef]) { try { r.current?.contentWindow?.postMessage(message, '*'); } catch {} } };
  const choosePreset = (preset: Preset) => { setActivePresetId(preset.id); setTrigger(preset.defaultTrigger || (preset.kind === 'keyframe' ? 'always' : 'hover')); setHasManualCode(false); setRightTab('controls'); };
  const applyEffect = () => { setOutputCss(generated); setHasManualCode(false); post({ type:'p2c-set-css', css:generated }); setRightTab('code'); toast(`Applied ${activePreset.name} to ${selectedSelector}.`); };
  const previewEffect = (preset: Preset) => { const next = buildCss(preset, selectedSelector, preset.defaultTrigger || trigger, options).replace(/:hover\b/g, ''); post({ type:'p2c-set-css', css:next }); };
  const refreshPreview = () => { setPreviewKey(k => k + 1); setTimeout(() => post({ type:'p2c-pick-mode', enabled:pickMode }), 100); };
  const copyText = async (text: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); toast('Copied to clipboard.'); } catch { toast('Clipboard access was blocked by the browser. Select the code and copy it manually.'); } }
    else toast('Clipboard is available in the web version.');
  };
  const downloadText = (filename: string, value: string, type: string) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') { toast('Download is available in the web version.'); return; }
    const url = URL.createObjectURL(new Blob([value], { type })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 3000); toast(`${filename} downloaded.`);
  };
  const exportBundle = () => downloadText('pixel2code-animation.html', `<!doctype html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>\n${css}\n\n/* Pixel2Code generated animation */\n${outputCss || generated}\n</style></head><body>\n${sanitizeHtml(html)}\n</body></html>`, 'text/html');

  const field = (label: string, value: string, change: (v:string)=>void, placeholder = '') => <View style={{ flex:1, minWidth:100, gap:5 }}><Txt sub size={11}>{label}</Txt><Input value={value} onChangeText={change} placeholder={placeholder} autoCapitalize="none" autoCorrect={false} mono /></View>;
  const colorField = (label: string, value: string, change: (v:string)=>void) => <View style={{ flex:1, minWidth:130, gap:5 }}><Txt sub size={11}>{label}</Txt><View style={[row,{gap:6,flexWrap:'nowrap'}]}>{Platform.OS === 'web' ? React.createElement('input',{type:'color',value:/^#[0-9a-f]{6}$/i.test(value)?value:'#6366f1',onChange:(e:any)=>change(e.target.value),'aria-label':`${label} picker`,style:{width:40,height:40,padding:2,borderRadius:9,border:`1px solid ${t.border}`,background:t.input,cursor:'pointer'}}) : null}<View style={{flex:1}}><Input value={value} onChangeText={change} autoCapitalize="none" autoCorrect={false} placeholder="#6366f1" /></View></View></View>;

  const topBar = <View style={{ paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderColor:t.border,backgroundColor:t.card,gap:12 }}>
    <View style={[row,{justifyContent:'space-between',alignItems:'center',flexWrap:'wrap'}]}>
      <View style={[row,{gap:10}]}><Btn small kind="ghost" label="← Back" onPress={onBack}/><View style={{width:38,height:38,borderRadius:12,backgroundColor:'#6366f1',alignItems:'center',justifyContent:'center'}}><Txt bold size={20} style={{color:'#fff'}}>✳</Txt></View><View><Txt bold size={17}>Pixel2Code <Txt size={17} style={{color:t.primary}}>Motion Lab</Txt></Txt><Txt sub size={11}>CSS animation workbench · live code · zero framework lock-in</Txt></View></View>
      <View style={[row,{gap:6,flexWrap:'wrap'}]}><View style={{paddingHorizontal:10,paddingVertical:7,borderRadius:9,borderWidth:1,borderColor:t.border}}><Txt sub size={11}>{ANIMATION_PRESETS.length} effects · CSS only</Txt></View><Btn small kind="ghost" label="Reset sample" onPress={()=>{setHtml(SAMPLE_HTML);setCss(SAMPLE_CSS);setOutputCss('');setHasManualCode(false);setSelectedSelector('.hero-card');setActivePresetId('lift');setPreviewKey(k=>k+1);toast('Sample restored.')}}/><Btn small kind="ghost" label="UI Components Lab ↗" onPress={onComponentLab}/><Btn small label="Export HTML + CSS" onPress={exportBundle}/></View>
    </View>
    <View style={[row,{gap:6,flexWrap:'wrap'}]}><Txt sub size={11} style={{alignSelf:'center'}}>WORKFLOW</Txt>{['01  Paste code','02  Preview & select','03  Choose effect','04  Customize','05  Export'].map((s,i)=><View key={s} style={[row,{gap:6,paddingHorizontal:9,paddingVertical:6,borderRadius:8,backgroundColor:i===2?'rgba(99,102,241,.14)':t.input,borderWidth:1,borderColor:i===2?t.primary:t.border}]}><Txt size={11} style={{color:i===2?t.primary:t.sub}}>{s}</Txt></View>)}</View>
  </View>;

  const sourcePane = <View style={{flex:1,minHeight:300,backgroundColor:t.card}}>
    <View style={[row,{padding:10,borderBottomWidth:1,borderColor:t.border,justifyContent:'space-between'}]}><View style={row}><Chip label="HTML" active={sourceTab==='html'} onPress={()=>setSourceTab('html')}/><Chip label="CSS" active={sourceTab==='css'} onPress={()=>setSourceTab('css')}/></View><View style={row}><Btn small kind="ghost" label="Sample" onPress={()=>{if(sourceTab==='html')setHtml(SAMPLE_HTML);else setCss(SAMPLE_CSS);}}/><Btn small kind="ghost" label="Clear" onPress={()=>sourceTab==='html'?setHtml(''):setCss('')}/></View></View>
    <View style={{paddingHorizontal:12,paddingTop:10,paddingBottom:4}}><Txt sub size={11}>{sourceTab==='html'?'Paste a complete HTML fragment or document. Inline scripts are disabled in the preview for safety.':'Paste your source CSS here. Your original styles stay separate from generated animation CSS.'}</Txt></View>
    <Input multiline value={sourceTab==='html'?html:css} onChangeText={sourceTab==='html'?setHtml:setCss} autoCapitalize="none" autoCorrect={false} spellCheck={false} textAlignVertical="top" mono style={{flex:1,minHeight:240,margin:10,marginTop:6,fontSize:12,lineHeight:18,borderRadius:12,padding:14}} placeholder={sourceTab==='html'?'<section class="card">...</section>':'.card { transition: all .3s ease; }'}/>
    <View style={[row,{padding:10,borderTopWidth:1,borderColor:t.border,justifyContent:'space-between',flexWrap:'wrap'}]}><Txt sub size={11}>HTML {html.length.toLocaleString()} chars · CSS {css.length.toLocaleString()} chars</Txt><Btn small label="Update preview ↗" onPress={refreshPreview}/></View>
  </View>;

  const previewPane = <View style={{flex:1,minHeight:330,backgroundColor:t.card}}>
    <View style={[row,{padding:10,borderBottomWidth:1,borderColor:t.border,justifyContent:'space-between',flexWrap:'wrap'}]}><View><Txt bold size={13}>Live preview</Txt><Txt sub size={11}>Click an element to target it · selection mode {pickMode?'on':'off'}</Txt></View><View style={[row,{gap:5}]}>{([{label:'Desktop',value:'100%'},{label:'Tablet',value:768},{label:'Mobile',value:390}] as const).map(d=><Btn key={d.label} small kind={previewWidth===d.value?'primary':'ghost'} label={d.label} onPress={()=>setPreviewWidth(d.value)}/>)}<Btn small kind={pickMode?'primary':'ghost'} label={pickMode?'Select: ON':'Select: OFF'} onPress={()=>{setPickMode(v=>!v);post({type:'p2c-pick-mode',enabled:!pickMode});}}/><Btn small kind="ghost" label="⛶ Full view" onPress={()=>setFullView(true)}/><Btn small kind="ghost" label="↻" onPress={refreshPreview}/></View></View>
    <View style={{flex:1,minHeight:280,backgroundColor:'#0d1020',alignItems:'center',justifyContent:'center',padding:10}}>
      {Platform.OS==='web' ? React.createElement('iframe',{key:previewKey,ref:frameRef,title:'Pixel2Code live HTML CSS preview',srcDoc:previewDocument,sandbox:'allow-scripts',style:{width:previewWidth==='100%'?'100%':previewWidth,maxWidth:'100%',height:'100%',minHeight:300,border:0,borderRadius:10,background:'#fff',boxShadow:'0 12px 40px rgba(0,0,0,.24)'},onLoad:()=>{try{frameRef.current?.contentWindow?.postMessage({type:'p2c-pick-mode',enabled:pickMode},'*');frameRef.current?.contentWindow?.postMessage({type:'p2c-set-css',css:outputCss||generated},'*');}catch{}}}) : <View style={{padding:22,gap:8}}><Txt bold>Live preview is available on web</Txt><Txt sub size={12}>Open Pixel2Code in a browser to render HTML/CSS in an isolated preview frame.</Txt></View>}
    </View>
    <View style={{padding:10,borderTopWidth:1,borderColor:t.border,gap:8}}><View style={[row,{justifyContent:'space-between',flexWrap:'wrap'}]}><Txt sub size={11}>SELECTED ELEMENT</Txt><Btn small kind="ghost" label="Use parent as trigger" onPress={()=>{setTrigger('parent-hover');setParentSelector(selectedSelector);setRightTab('controls');}}/></View><Input value={selectedSelector} onChangeText={setSelectedSelector} autoCapitalize="none" autoCorrect={false} mono placeholder=".card, #hero, h1.title"/><View style={[row,{gap:6,flexWrap:'wrap'}]}><Btn small kind="ghost" label="Copy selector" onPress={()=>copyText(selectedSelector)}/><Txt sub size={11}>Target any valid CSS selector; use parent-hover for nested child effects.</Txt></View></View>
  </View>;

  const libraryPane = <View style={{gap:10}}>
    <View><Txt bold size={15}>Effect library</Txt><Txt sub size={11}>Every tile generates real CSS. Hover to preview on desktop or select to configure.</Txt></View>
    <Input value={query} onChangeText={setQuery} placeholder={`⌕ Search ${ANIMATION_PRESETS.length} effects, transforms, filters…`} autoCapitalize="none" autoCorrect={false}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingBottom:2}}>{CATEGORIES.map(c=><Chip key={c} label={c} active={category===c} onPress={()=>setCategory(c)}/>)}</ScrollView>
    <View style={[row,{justifyContent:'space-between'}]}><Txt sub size={11}>{filteredPresets.length} effects shown</Txt><Txt sub size={11}>Selected: {activePreset.name}</Txt></View>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{filteredPresets.map(p=>{
      const active=p.id===activePresetId;
      return <Pressable key={p.id} onPress={()=>choosePreset(p)} onHoverIn={()=>previewEffect(p)} onHoverOut={()=>post({type:'p2c-set-css',css:outputCss||generated})} accessibilityRole="button" accessibilityState={{selected:active}} style={{width:medium?'48%':'100%',minWidth:128,flexGrow:1,maxWidth:wide?'48%':undefined,padding:11,borderRadius:12,borderWidth:1,borderColor:active?t.primary:t.border,backgroundColor:active?'rgba(99,102,241,.13)':t.input,gap:7}}>
        <View style={[row,{justifyContent:'space-between',alignItems:'center'}]}><View style={{width:30,height:30,borderRadius:9,backgroundColor:active?'#6366f1':'rgba(99,102,241,.12)',alignItems:'center',justifyContent:'center'}}><Txt size={15} style={{color:active?'#fff':t.primary}}>{p.kind==='keyframe'?'↻':p.category==='Text'?'T':p.category==='Image'?'▧':p.category==='Background'?'◩':p.category==='Shadow'?'◈':'✳'}</Txt></View><Txt sub size={9}>{p.kind==='keyframe'?'KEYFRAME':'TRANSITION'}</Txt></View>
        <Txt bold size={12}>{p.name}</Txt><Txt sub size={10} numberOfLines={2}>{p.description}</Txt><View style={[row,{justifyContent:'space-between'}]}><Txt size={10} style={{color:t.primary}}>{p.category}</Txt><Txt size={10} style={{color:active?t.primary:t.sub}}>{active?'Selected':'Configure →'}</Txt></View>
      </Pressable>;
    })}</View>
    {!filteredPresets.length&&<Card><Txt bold>No effects found</Txt><Txt sub size={12}>Try another search or choose All.</Txt></Card>}
  </View>;

  const swatches = ['#ffffff', '#000000', '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const hoverColorsCard = <Card style={{gap:10}}>
    <Txt bold>Hover colors (background + text)</Txt>
    <Txt sub size={11}>Applies only while the mouse is over the target. When a hover background is set, the text turns white automatically.</Txt>
    {field('Class / selector (blank = selected element)', colorTarget, setColorTarget, selectedSelector)}
    <View style={[row,{gap:8,flexWrap:'wrap'}]}>
      {colorField('Hover background', hoverBg, (v)=>{ setHoverBg(v); setHoverBgOn(true); })}
      {colorField('Hover text', hoverText, (v)=>{ setHoverText(v); setHoverTextOn(true); })}
    </View>
    <View style={[row,{gap:6,flexWrap:'wrap'}]}>{swatches.map(c=><Pressable key={c} accessibilityLabel={`Use ${c} as hover background`} onPress={()=>{ setHoverBg(c); setHoverBgOn(true); }} style={{width:26,height:26,borderRadius:13,backgroundColor:c,borderWidth:1,borderColor:t.border}}/>)}</View>
    <View style={[row,{flexWrap:'wrap'}]}>
      <Chip label={hoverBgOn?'Background: ON':'Background: OFF'} active={hoverBgOn} onPress={()=>setHoverBgOn(v=>!v)}/>
      <Chip label={hoverTextOn?'Custom text: ON':'Custom text: OFF'} active={hoverTextOn} onPress={()=>setHoverTextOn(v=>!v)}/>
      <Chip label={whiteText?'Auto white text: ON':'Auto white text: OFF'} active={whiteText} onPress={()=>setWhiteText(v=>!v)}/>
      <Btn small kind="ghost" label="Clear colors" onPress={()=>{ setHoverBgOn(false); setHoverTextOn(false); }}/>
    </View>
  </Card>;

  const controlsPane = <View style={{gap:12}}>
    <View><Txt bold size={15}>Animation controls</Txt><Txt sub size={11}>Customize the effect, target and trigger. Changes update generated CSS immediately.</Txt></View>
    <Card style={{gap:10}}><View style={[row,{justifyContent:'space-between'}]}><Txt bold>{activePreset.name}</Txt><View style={{paddingHorizontal:8,paddingVertical:4,borderRadius:8,backgroundColor:'rgba(99,102,241,.13)'}}><Txt size={10} style={{color:t.primary}}>{activePreset.kind}</Txt></View></View><Txt sub size={12}>{activePreset.description}</Txt>
      <Txt sub size={11}>TRIGGER MODE</Txt><View style={[row,{flexWrap:'wrap'}]}>{([{label:'Hover',value:'hover'},{label:'Focus',value:'focus'},{label:'Active',value:'active'},{label:'Always / entrance',value:'always'},{label:'Parent hover → child',value:'parent-hover'}] as const).map(x=><Chip key={x.value} label={x.label} active={trigger===x.value} onPress={()=>setTrigger(x.value)}/>)}</View>
      {trigger==='parent-hover'&&<View style={{gap:5}}><Txt sub size={11}>TRIGGER PARENT SELECTOR</Txt><Input value={parentSelector} onChangeText={setParentSelector} autoCapitalize="none" autoCorrect={false} mono placeholder=".card"/><Txt sub size={10}>CSS output becomes parent:hover target. Your target selector remains separate.</Txt></View>}
      <View style={[row,{gap:8,flexWrap:'wrap'}]}>{field('Duration (ms)',duration,setDuration,'350')}{field('Delay (ms)',delay,setDelay,'0')}{field('Iteration',iteration,setIteration,'1 / infinite')}</View>
      <View style={[row,{gap:8,flexWrap:'wrap'}]}>{field('Animation direction',direction,setDirection,'normal')}{field('Fill mode',fillMode,setFillMode,'both')}{field('Play state',playState,setPlayState,'running')}</View>
      <View style={{gap:5}}><Txt sub size={11}>TIMING FUNCTION / EASING</Txt><ScrollView horizontal showsHorizontalScrollIndicator={false}>{EASINGS.map(e=><Chip key={e} label={e} active={easing===e} onPress={()=>setEasing(e)}/>)}</ScrollView><Input value={easing} onChangeText={setEasing} autoCapitalize="none" autoCorrect={false} mono placeholder="cubic-bezier(.22,1,.36,1)"/></View>
      <View style={{gap:5}}><Txt sub size={11}>TRANSITION PROPERTY</Txt><ScrollView horizontal showsHorizontalScrollIndicator={false}>{['all','transform','opacity','color','background-color','filter','box-shadow','border-color','border-radius','transform, opacity, color, background-color, border-color, box-shadow, filter, border-radius'].map(v=><Chip key={v} label={v==='transform, opacity, color, background-color, border-color, box-shadow, filter, border-radius'?'Common UI properties':v} active={transitionProperties===v} onPress={()=>setTransitionProperties(v)}/>)}</ScrollView><Input value={transitionProperties} onChangeText={setTransitionProperties} autoCapitalize="none" autoCorrect={false} mono placeholder="all"/></View>
    </Card>
    <Card style={{gap:10}}><Txt bold>Transform & motion parameters</Txt><View style={[row,{gap:8,flexWrap:'wrap'}]}>{field('Translate X (px)',translateX,setTranslateX)}{field('Translate Y (px)',translateY,setTranslateY)}{field('Scale',scale,setScale,'1.06')}{field('Rotate (deg)',rotate,setRotate,'5')}{field('Skew (deg)',skew,setSkew,'6')}{field('Perspective (px)',perspective,setPerspective,'800')}{field('Opacity (0–1)',opacity,setOpacity,'.65')}{field('Blur (px)',blur,setBlur,'3')}{field('Border radius (px)',radius,setRadius,'24')}</View><Txt sub size={10}>These controls power compatible presets such as Multi Transform, Perspective, Blur, Opacity and Radius Morph. CSS transform functions are composed into one declaration where required.</Txt></Card>
    {hoverColorsCard}<Card style={{gap:10}}><Txt bold>Preset colors</Txt><Txt sub size={11}>Used only by presets that need a color (Glow, Border Color, Color Wash, Background Color, Text Color…). For plain hover colors use the section above.</Txt><View style={[row,{gap:8,flexWrap:'wrap'}]}>{colorField('Accent / glow',hoverColor,setHoverColor)}{colorField('Preset background',bgColor,setBgColor)}{colorField('Preset text',textColor,setTextColor)}{colorField('Border',borderColor,setBorderColor)}</View>{field('Shadow color (CSS)',shadow,setShadow,'rgba(99,102,241,.28)')}</Card>
    <Card style={{gap:10}}><View style={[row,{justifyContent:'space-between',alignItems:'center'}]}><View><Txt bold>Custom @keyframes editor</Txt><Txt sub size={11}>Build your own from / middle / to animation states.</Txt></View><Chip label={customKeyframes?'Enabled':'Enable'} active={customKeyframes} onPress={()=>{setCustomKeyframes(v=>!v);setHasManualCode(false);}}/></View>{customKeyframes&&<View style={{gap:8}}>{field('Keyframe name',customKeyframeName,setCustomKeyframeName,'p2cCustomMotion')}{[['0% / from',keyframeFrom,setKeyframeFrom],['50% / middle',keyframeMid,setKeyframeMid],['100% / to',keyframeTo,setKeyframeTo]].map(([label,value,change]:any)=><View key={label} style={{gap:5}}><Txt sub size={11}>{label}</Txt><Input multiline value={value} onChangeText={change} autoCapitalize="none" autoCorrect={false} mono style={{minHeight:62,fontSize:11}}/></View>)}<Txt sub size={10}>Enter CSS declarations only, for example: opacity:1; transform:translateY(0);. The generated @keyframes rule is included in the output.</Txt></View>}</Card>
    <Card style={{gap:8}}><View style={[row,{justifyContent:'space-between'}]}><Txt bold>Accessibility</Txt><Chip label={reducedMotion?'Reduced motion: ON':'Reduced motion: OFF'} active={reducedMotion} onPress={()=>setReducedMotion(v=>!v)}/></View><Txt sub size={11}>When enabled, generated CSS includes a prefers-reduced-motion media query.</Txt></Card>
    <View style={[row,{gap:8,flexWrap:'wrap'}]}><Btn label="Apply effect to preview" onPress={applyEffect} style={{flex:1}}/><Btn kind="ghost" label="View generated CSS" onPress={()=>{setOutputCss(generated);setHasManualCode(false);setRightTab('code');}}/></View>
  </View>;

  const codePane = <View style={{gap:10,flex:1}}><View><Txt bold size={15}>Generated CSS</Txt><Txt sub size={11}>This is the exact CSS used for preview/export. Edit it freely; manual changes are preserved until you regenerate.</Txt></View><View style={[row,{gap:6,flexWrap:'wrap'}]}><Btn small label={copied?'Copied ✓':'Copy CSS'} onPress={()=>copyText(outputCss||generated)}/><Btn small kind="ghost" label="Regenerate from controls" onPress={()=>{setOutputCss(generated);setHasManualCode(false);post({type:'p2c-set-css',css:generated});toast('CSS regenerated from current controls.');}}/><Btn small kind="ghost" label="Download .css" onPress={()=>downloadText('pixel2code-animation.css',outputCss||generated,'text/css')}/><Btn small kind="ghost" label="Export full HTML" onPress={exportBundle}/></View><Input multiline value={outputCss||generated} onChangeText={v=>{setOutputCss(v);setHasManualCode(true);post({type:'p2c-set-css',css:v});}} autoCapitalize="none" autoCorrect={false} spellCheck={false} textAlignVertical="top" mono style={{flex:1,minHeight:360,fontSize:12,lineHeight:18,padding:14,...({whiteSpace:'pre',overflowX:'auto',tabSize:2} as any)}}/><View style={[row,{justifyContent:'space-between',flexWrap:'wrap'}]}><Txt sub size={10}>{(outputCss||generated).split('\n').length} lines · { (outputCss||generated).length.toLocaleString()} chars</Txt><Btn small kind="ghost" label="Reset to generated" onPress={()=>{setOutputCss(generated);setHasManualCode(false);post({type:'p2c-set-css',css:generated});}}/></View></View>;

  const fullViewOverlay = fullView ? <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:50,backgroundColor:t.bg} as any}>
    <View style={[row,{padding:8,borderBottomWidth:1,borderColor:t.border,backgroundColor:t.card,justifyContent:'space-between'}]}>
      <View style={row}><Btn small kind="danger" label="Exit full view (Esc)" onPress={()=>setFullView(false)}/><Txt bold size={13}>Full view · {selectedSelector}</Txt></View>
      <View style={row}>
        {([{label:'Desktop',value:'100%'},{label:'Tablet',value:768},{label:'Mobile',value:390}] as const).map(d=><Btn key={d.label} small kind={previewWidth===d.value?'primary':'ghost'} label={d.label} onPress={()=>setPreviewWidth(d.value)}/>)}
        <Btn small kind={pickMode?'primary':'ghost'} label={pickMode?'Select: ON':'Select: OFF'} onPress={()=>{setPickMode(v=>!v);post({type:'p2c-pick-mode',enabled:!pickMode});}}/>
        <Btn small kind="ghost" label="↻ Replay" onPress={refreshPreview}/>
      </View>
    </View>
    <View style={{flex:1,backgroundColor:'#0d1020',alignItems:'center'}}>
      {Platform.OS==='web' ? React.createElement('iframe',{key:`full-${previewKey}`,ref:fullFrameRef,title:'Pixel2Code full view preview',srcDoc:previewDocument,sandbox:'allow-scripts',style:{width:previewWidth==='100%'?'100%':previewWidth,maxWidth:'100%',height:'100%',border:0,background:'#fff'},onLoad:()=>{post({type:'p2c-pick-mode',enabled:pickMode});post({type:'p2c-set-css',css:outputCss||generated});}}) : <View style={{padding:22}}><Txt sub>Full view is available on web.</Txt></View>}
    </View>
  </View> : null;

  const rightPane = <View style={{flex:1,minHeight:0,backgroundColor:t.card}}><View style={[row,{padding:10,borderBottomWidth:1,borderColor:t.border,flexWrap:'wrap'}]}><Chip label={`Library (${ANIMATION_PRESETS.length})`} active={rightTab==='library'} onPress={()=>setRightTab('library')}/><Chip label="Controls" active={rightTab==='controls'} onPress={()=>setRightTab('controls')}/><Chip label="CSS output" active={rightTab==='code'} onPress={()=>{setOutputCss(outputCss||generated);setRightTab('code');}}/></View><ScrollView style={{flex:1}} contentContainerStyle={{padding:12,gap:12}}>{rightTab==='library'?libraryPane:rightTab==='controls'?controlsPane:codePane}</ScrollView></View>;

  return <View style={{flex:1,backgroundColor:t.bg}}>{topBar}{wide?<View style={{flex:1,flexDirection:'row',minHeight:0}}><View style={{width:340,minWidth:300,borderRightWidth:1,borderColor:t.border}}>{sourcePane}</View><View style={{flex:1,minWidth:320,borderRightWidth:1,borderColor:t.border}}>{previewPane}</View><View style={{width:440,minWidth:360}}>{rightPane}</View></View>:medium?<View style={{flex:1,minHeight:0}}><View style={{flex:1,minHeight:0}}>{previewPane}</View><View style={{height:'48%',minHeight:280,borderTopWidth:1,borderColor:t.border}}><View style={[row,{padding:6}]}><Chip label="HTML / CSS" active={mobileSourceTab(sourceTab)} onPress={()=>setMobileFocus('source')}/><Chip label="Effects & Code" active={!mobileSourceTab(sourceTab)} onPress={()=>setMobileFocus('effects')}/></View>{mobileFocus==='source'?sourcePane:rightPane}</View></View>:<View style={{flex:1,minHeight:0}}><View style={[row,{padding:6,flexWrap:'wrap'}]}><Chip label="Source" active={mobilePanel==='source'} onPress={()=>setMobilePanel('source')}/><Chip label="Preview" active={mobilePanel==='preview'} onPress={()=>setMobilePanel('preview')}/><Chip label="Effects" active={mobilePanel==='effects'} onPress={()=>setMobilePanel('effects')}/></View><View style={{flex:1,minHeight:0}}>{mobilePanel==='source'?sourcePane:mobilePanel==='preview'?previewPane:rightPane}</View></View>}{fullViewOverlay}</View>;

  function mobileSourceTab(tab:'html'|'css') { return mobileFocus==='source' && sourceTab===tab; }
}