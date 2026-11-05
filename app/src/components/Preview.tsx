import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, View } from 'react-native';
import { ProjectAsset, ProjectFile } from '../types';
import { bundleForPreview } from '../lib/managed';

export interface PreviewMsg {
  type: 'error' | 'asset' | 'log' | 'network';
  msg: string;
  level?: 'log' | 'info' | 'warn' | 'error' | 'debug';
  source?: string;
  line?: number;
  column?: number;
  stack?: string;
}

interface Props {
  files: ProjectFile[];
  assets?: ProjectAsset[];
  width: number | 'full';
  reloadKey: number;
  highlightId?: string | null;
  onMessage: (m: PreviewMsg) => void;
  inspectMode?: boolean;
  onInspect?: (item: PreviewElement) => void;
  /** HTML file to render. Defaults to index.html (or the first HTML file). */
  entry?: string;
}

export interface PreviewElement {
  selector: string; tag: string; text: string; outerHTML: string;
  color: string; backgroundColor: string; fontSize: string; padding: string;
  borderRadius: string; width: string; height: string;
}

/**
 * Renders the REAL generated project.
 * Web: sandboxed iframe (allow-scripts + allow-forms, NO allow-same-origin, so generated code cannot touch the app's storage/cookies).
 * Phone: react-native-webview with navigation locked.
 */
export default function Preview(props: Props) {
  const { files, assets, width, reloadKey, highlightId, onMessage, inspectMode, entry } = props;
  const html = useMemo(() => {
    const source = bundleForPreview(files, assets ?? [], entry);
    const inspector = `<script>(function(){
      var active=false, hover=null;
      function send(item){try{var msg={p2cInspect:item};if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(msg));else parent.postMessage(msg,'*');}catch(e){}}
      function selector(el){if(el.id)return '#'+CSS.escape(el.id);var parts=[];while(el&&el.nodeType===1&&el!==document.body){var part=el.tagName.toLowerCase();if(el.classList&&el.classList.length)part+='.'+Array.from(el.classList).slice(0,2).map(CSS.escape).join('.');else if(el.parentElement){var same=Array.from(el.parentElement.children).filter(x=>x.tagName===el.tagName);if(same.length>1)part+=':nth-of-type('+(same.indexOf(el)+1)+')';}parts.unshift(part);el=el.parentElement;}return 'body > '+parts.join(' > ');}
      function pick(el){if(!el||el===document.documentElement||el===document.body)return;var c=getComputedStyle(el);send({selector:selector(el),tag:el.tagName.toLowerCase(),text:(el.innerText||el.textContent||'').trim().slice(0,1200),outerHTML:el.outerHTML.slice(0,4000),color:c.color,backgroundColor:c.backgroundColor,fontSize:c.fontSize,padding:c.padding,borderRadius:c.borderRadius,width:c.width,height:c.height});}
      window.addEventListener('message',function(e){if(e.data&&typeof e.data.p2cInspectMode==='boolean'){active=e.data.p2cInspectMode;document.documentElement.style.cursor=active?'crosshair':'';}});
      document.addEventListener('mouseover',function(e){if(!active)return;var el=e.target;if(hover&&hover!==el)hover.style.outline='';hover=el;el.style.outline='2px solid #5865f2';el.style.outlineOffset='2px';},true);
      document.addEventListener('mouseout',function(e){if(!active)return;if(e.target&&e.target.style)e.target.style.outline='';},true);
      var dragStart=null,suppressClick=false;
      document.addEventListener('pointerdown',function(e){if(active){dragStart={x:e.clientX,y:e.clientY};suppressClick=false;e.preventDefault();}},true);
      document.addEventListener('pointerup',function(e){if(!active||!dragStart)return;var dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;var dragged=Math.abs(dx)+Math.abs(dy)>12;var target=dragged?document.elementFromPoint(dragStart.x+dx/2,dragStart.y+dy/2):e.target;if(dragged&&target&&target.closest)target=target.closest('section,article,header,footer,main,nav,aside')||target;suppressClick=true;pick(target);dragStart=null;setTimeout(function(){suppressClick=false;},80);e.preventDefault();e.stopPropagation();},true);
      document.addEventListener('click',function(e){if(!active)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(!suppressClick)pick(e.target);},true);
    })();</script>`;
    return /<\/body>/i.test(source) ? source.replace(/<\/body>/i, inspector+'</body>') : source+inspector;
  }, [files, assets, reloadKey, entry]);
  const iframeRef = useRef<any>(null);
  const webRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const h = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return; // only our own iframe
      if (e.data?.p2c && e.data.m) onMessage(e.data.m);
      if (e.data?.p2cInspect) props.onInspect?.(e.data.p2cInspect);
    };
    window.addEventListener('message', h);
    return () => window.removeEventListener('message', h);
  }, [onMessage, props.onInspect]);

  useEffect(() => {
    if (inspectMode === undefined) return;
    if (Platform.OS === 'web') iframeRef.current?.contentWindow?.postMessage({ p2cInspectMode: inspectMode }, '*');
    else webRef.current?.injectJavaScript(`window.postMessage({p2cInspectMode:${JSON.stringify(inspectMode)}}, '*');true;`);
  }, [inspectMode, reloadKey]);

  useEffect(() => {
    if (highlightId === undefined) return;
    if (Platform.OS === 'web') iframeRef.current?.contentWindow?.postMessage({ p2cHighlight: highlightId || '' }, '*');
    else webRef.current?.injectJavaScript(`window.__p2cHighlight&&window.__p2cHighlight(${JSON.stringify(highlightId || '')});true;`);
  }, [highlightId]);

  const boxStyle = { width: width === 'full' ? '100%' : width, alignSelf: 'center' as const, flex: 1, backgroundColor: '#fff' };

  if (Platform.OS === 'web') {
    return (
      <View style={boxStyle as any}>
        {React.createElement('iframe', {
          key: reloadKey,
          ref: iframeRef,
          title: 'Preview',
          srcDoc: html,
          onLoad: () => iframeRef.current?.contentWindow?.postMessage({ p2cInspectMode: !!inspectMode }, '*'),
          // allow-forms: without it the browser never fires a form's "submit" event, so every Continue / Send / Sign in button of a generated page is dead.
          // Still no allow-same-origin (storage stays private) and the preview script blocks real form navigation.
          sandbox: 'allow-scripts allow-forms',
          style: { position: 'absolute', top: 0, left: 0, border: 0, width: '100%', height: '100%', background: '#fff' },
        })}
      </View>
    );
  }

  const { WebView } = require('react-native-webview');
  return (
    <View style={boxStyle as any}>
      <WebView
        key={reloadKey}
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled={false}
        allowFileAccess={false}
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={(r: any) => r.url === 'about:blank' || r.isTopFrame === false || r.url.startsWith('data:')}
        onLoadEnd={() => webRef.current?.injectJavaScript(`window.postMessage({p2cInspectMode:${JSON.stringify(!!inspectMode)}}, '*');true;`)}
        onMessage={(e: any) => {
          try { const m=JSON.parse(e.nativeEvent.data); if(m.p2cInspect) props.onInspect?.(m.p2cInspect); else onMessage(m); } catch {}
        }}
      />
    </View>
  );
}
