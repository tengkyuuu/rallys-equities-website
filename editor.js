/* ════════════════════════════════════════════════════════════════
   Rallys Equities — Admin (loaded on /admin or ?edit=1)
   Two surfaces, one mental model:
     · Dashboard app  — overview, submissions, editors (fullscreen)
     · Site editor    — the live site + one toolbar (edit / photos /
                        theme / preview / save·publish)
   Works with Supabase when configured, else a local (localStorage)
   preview store so it's testable.
   ════════════════════════════════════════════════════════════════ */
(function(){
"use strict";
const API = window.RE_API;
if(!API){ console.warn('[editor] RE_API not found'); return; }
/* invitee arriving from an email link → prompt them to set a password after auth */
const INVITE_FLOW = /type=(invite|recovery)/.test(location.hash + location.search);
/* Where invite emails land: the canonical live domain's set-password page (never the *.vercel.app host).
   Falls back to the current origin for local/preview testing. */
const CANON_ORIGIN = /rallysequities\.com$/.test(location.hostname) ? location.origin : 'https://www.rallysequities.com';
const INVITE_REDIRECT = CANON_ORIGIN + '/set-password';
/* The boot narrator lives in index.html (it has to exist before this file loads).
   No-op shim so the editor still runs if it's ever loaded without one. */
const BOOT = window.RE_BOOT || {stage(){},finish(){}};

/* ---------- tiny DOM helpers ---------- */
const h=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const k in attrs){if(k==='class')e.className=attrs[k];else if(k==='html')e.innerHTML=attrs[k];else if(k.startsWith('on')&&typeof attrs[k]==='function')e.addEventListener(k.slice(2),attrs[k]);else if(attrs[k]!=null)e.setAttribute(k,attrs[k]);}kids.flat().forEach(c=>e.append(c&&c.nodeType?c:document.createTextNode(c==null?'':c)));return e;};
const $=(s,r=document)=>r.querySelector(s);
/* Inline SVG icons (Lucide-style) — the admin UI never uses emojis */
const ICONS={
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  palette:'<circle cx="13.5" cy="6.5" r=".8"/><circle cx="17.5" cy="10.5" r=".8"/><circle cx="8.5" cy="7.5" r=".8"/><circle cx="6.5" cy="12.5" r=".8"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.66h1.99c3.05 0 5.55-2.5 5.55-5.55C22 6 17.5 2 12 2z"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  refresh:'<path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.5 12.5 8-8"/><path d="m16 6 2 2"/><path d="m19 3 2 2"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  back:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>',
  chevr:'<path d="m9 18 6-6-6-6"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  clip:'<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  grip:'<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>',
  up:'<path d="m18 15-6-6-6 6"/>',
  sliders:'<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  post:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13H8"/><path d="M16 17H8"/>',
  restore:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  rotate:'<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  flip:'<path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M12 20v2"/><path d="M12 14v2"/><path d="M12 8v2"/><path d="M12 2v2"/>',
  eraser:'<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  circle:'<circle cx="12" cy="12" r="9"/>',
  cloud:'<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 0 0 4.5 12.5 3.5 3.5 0 0 0 5 19z"/><path d="m9 14 3-3 3 3"/><path d="M12 11v6"/>',
  chat:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  userplus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>'
};
function icon(name,size){ size=size||20; return h('span',{class:'re-ic',html:'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[name]||'')+'</svg>'}); }
const iconBtn=(name,label,fn,cls)=>h('button',{class:'re-iconbtn'+(cls?' '+cls:''),type:'button','aria-label':label,title:label,onclick:fn},icon(name,16));
/* ---------- brand mark ----------
   Reuse the site's own logo node so the admin shows whatever logo is actually live
   (the client can replace it from the Photos panel) and so the path is right whether
   we're at /admin, /admin/, or a file:// preview. Height drives the size and the CSS
   locks the real 140:99 aspect — the old fixed 48×48 was what squashed it. */
function logoSrc(){
  const el=document.querySelector('img[data-edit-img="brand.logo"],.lm-img img,.pl-logo img');
  return (el&&el.getAttribute('src'))||'assets/img/logo.png';
}
function brandMark(o){ o=o||{};
  const plate=h('span',{class:'re-brand-plate'},h('img',{class:'re-brand-logo',src:logoSrc(),alt:o.alt||'Rallys Equities',style:o.h?('height:'+o.h+'px'):null}));
  if(!o.label)return h('span',{class:'re-brand'},plate);
  return h('span',{class:'re-brand'},plate,h('span',{class:'re-brand-tx'},
    h('span',{class:'re-brand-name'},'Rallys Equities'),
    h('span',{class:'re-brand-sub'},o.label)));
}
/* One page header for every view: eyebrow · title · sub · optional actions. */
function pageHead(eyebrow,title,sub,acts){
  const tx=h('div',{class:'re-main-head-tx'},
    eyebrow?h('div',{class:'re-eyebrow'},eyebrow):'',
    h('h1',{},title),
    sub?h('p',{},sub):'');
  return h('div',{class:'re-main-head'},tx,acts&&acts.length?h('div',{class:'re-head-acts'},...acts):'');
}
/* Shaped placeholders while a fetch is in flight — an honest "this is loading". */
const skelBar=w=>h('div',{class:'re-skel',style:'width:'+w});
function skelRows(n,withAvatar){
  const box=h('div',{class:'re-skel-rows'});
  for(let i=0;i<(n||3);i++)box.append(h('div',{class:'re-skel-row'},
    withAvatar?skelBar('34px'):'',
    h('div',{style:'flex:1'},skelBar((52+((i*17)%34))+'%'))));
  return box;
}
/* Initials for the avatar: "Sikandar Khan" → SK, else the email's first letters. */
function initials(name,email){
  const src=String(name||'').trim()||String(email||'').split('@')[0].replace(/[._-]+/g,' ');
  const parts=src.split(/\s+/).filter(Boolean);
  return ((parts[0]||'?')[0]+(parts.length>1?parts[parts.length-1][0]:'')).toUpperCase();
}
const dateLong=v=>{ const t=Date.parse(v||''); return t?new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'; };
const dateTime=v=>{ const t=Date.parse(v||''); return t?new Date(t).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'—'; };
/* Locked = live/dynamic widgets + the editor's own UI. Everything else (incl. nav labels & logo) is editable. */
const LOCKED='.pcard,#mktTbody,#tickerWrap,#heroStocks,#perfGrid,.ticker,.live-badge,.theme-toggle,#toTop,.wa-fab,.ham,.re-bar,.re-panel,.re-overlay,.re-fmt,.re-img-btn,.re-coach,.re-toast,.re-dash,.re-login,.cnt';
function toast(msg,type){
  let t=$('.re-toast'); if(!t){t=h('div',{class:'re-toast',role:'status','aria-live':'polite'});document.body.append(t);}
  t.className='re-toast '+(type==='err'?'err':'ok');
  t.replaceChildren(icon(type==='err'?'alert':'check',15),h('span',{},msg));
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2400);
}
const debounce=(fn,ms=120)=>{let id;return(...a)=>{clearTimeout(id);id=setTimeout(()=>fn(...a),ms);};};

/* ════════ LOADING ════════ */
/* The curtain — only for actions that take real seconds AND must not be interrupted
   (publishing, a reset that reloads the page). Deliberately scarce: a modal that
   appears for a 200ms save is worse than no feedback at all. */
function reBusy(title,sub){
  const d=h('div',{class:'re-busy-d'},sub||'');
  const card=h('div',{class:'re-busy-card',role:'status','aria-live':'polite'},
    h('div',{class:'re-busy-stage','aria-hidden':'true'},
      h('span',{class:'re-busy-ring'}),
      h('span',{class:'re-busy-ring re-busy-ring2'}),
      h('span',{class:'re-busy-plate'},brandMark({h:34}))),
    h('div',{class:'re-busy-t'},title||'Working…'),
    d,
    h('div',{class:'re-busy-bar','aria-hidden':'true'},h('i',{})));
  const wrap=h('div',{class:'re-busy re-ui','aria-busy':'true'},card);
  /* swallow stray clicks and Escape so a long write can't be half-interrupted */
  const eat=e=>{ e.stopPropagation(); e.preventDefault(); };
  wrap.addEventListener('click',eat);
  const key=e=>{ if(e.key==='Escape')eat(e); };
  document.addEventListener('keydown',key,true);
  document.body.append(wrap);
  requestAnimationFrame(()=>wrap.classList.add('in'));
  let closed=false;
  return {
    update(t){ if(!closed)d.textContent=t||''; },
    close(){ if(closed)return; closed=true; document.removeEventListener('keydown',key,true);
      wrap.classList.remove('in'); setTimeout(()=>wrap.remove(),340); }
  };
}
/* A gold arc inside the button you just pressed — the right weight for everything
   short. Returns a restore fn that puts the original label back. */
function btnBusy(btn,label){
  if(!btn||btn._busy)return function(){};
  btn._busy=true;
  const prev=[...btn.childNodes], wasDisabled=btn.disabled;
  btn.disabled=true;
  btn.replaceChildren(h('span',{class:'re-spin','aria-hidden':'true'}),h('span',{},label||'Working…'));
  return function(){ btn._busy=false; btn.disabled=wasDisabled; btn.replaceChildren(...prev); };
}

/* ---------- modal system (one factory; ESC + backdrop close, dialog a11y) ---------- */
function reModal(o){
  o=o||{};
  const card=h('div',{class:'re-modal'+(o.cls?' '+o.cls:''),role:'dialog','aria-modal':'true','aria-label':o.title||'Dialog'});
  const head=h('div',{class:'re-modal-head'},h('h2',{},o.title||''));
  if(!o.noX)head.append(iconBtn('x','Close',()=>close()));
  card.append(head);
  if(o.desc)card.append(h('p',{class:'re-modal-desc'},o.desc));
  (o.body||[]).forEach(n=>card.append(n));
  if(o.foot&&o.foot.length)card.append(h('div',{class:'re-modal-foot'},...o.foot));
  const overlay=h('div',{class:'re-overlay re-ui',onclick:e=>{ if(e.target===overlay&&o.dismissible!==false)close(); }},card);
  /* Keep Tab inside the dialog and hand focus back where it came from on close —
     otherwise keyboard users land back at the top of the page after every prompt. */
  const prevFocus=document.activeElement;
  const focusables=()=>[...card.querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])')]
    .filter(n=>!n.disabled&&n.getClientRects().length);
  const key=e=>{
    if(e.key==='Escape'&&o.dismissible!==false){ e.stopPropagation(); close(); return; }
    if(e.key!=='Tab')return;
    const f=focusables(); if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(!card.contains(document.activeElement)){ e.preventDefault(); (e.shiftKey?last:first).focus(); }
    else if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); }
  };
  let closed=false;
  function close(){ if(closed)return; closed=true; document.removeEventListener('keydown',key,true); overlay.remove();
    try{ prevFocus&&prevFocus.focus&&prevFocus.focus(); }catch(e){}
    o.onClose&&o.onClose(); }
  document.addEventListener('keydown',key,true);
  document.body.append(overlay);
  return {overlay,card,close};
}
/* Styled confirm/prompt (replaces native browser dialogs) */
function reConfirm(msg,opts){ opts=opts||{};
  return new Promise(res=>{
    let settled=false;
    const fin=v=>{ if(settled)return; settled=true; document.removeEventListener('keydown',key,true); m.close(); res(v); };
    const key=e=>{ if(e.key==='Enter'){ e.preventDefault(); fin(true); } };
    const ok=h('button',{class:'re-btn '+(opts.danger?'re-btn-danger':'re-btn-pri'),onclick:()=>fin(true)},opts.okLabel||'Confirm');
    const cancel=h('button',{class:'re-btn re-btn-ghost',onclick:()=>fin(false)},opts.cancelLabel||'Cancel');
    const m=reModal({title:opts.title||'Please confirm',desc:msg,foot:[cancel,ok],noX:true,
      onClose:()=>{ if(!settled){ settled=true; document.removeEventListener('keydown',key,true); res(false); } }});
    document.addEventListener('keydown',key,true);
    setTimeout(()=>ok.focus(),50);
  });
}
function rePrompt(msg,opts){ opts=opts||{};
  return new Promise(res=>{
    let settled=false;
    const fin=v=>{ if(settled)return; settled=true; m.close(); res(v); };
    const inp=h('input',{class:'re-input',type:'text',value:opts.value||'',placeholder:opts.placeholder||'','aria-label':opts.title||'Value'});
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter')fin(inp.value.trim()); });
    const ok=h('button',{class:'re-btn re-btn-pri',onclick:()=>fin(inp.value.trim())},opts.okLabel||'OK');
    const cancel=h('button',{class:'re-btn re-btn-ghost',onclick:()=>fin(null)},'Cancel');
    const m=reModal({title:opts.title||'Enter a value',desc:msg||'',body:[h('div',{class:'re-field'},inp)],foot:[cancel,ok],noX:true,
      onClose:()=>{ if(!settled){ settled=true; res(null); } }});
    setTimeout(()=>inp.focus(),50);
  });
}
/* password input + show/hide toggle */
function pwWrap(inp){
  const b=h('button',{class:'re-eye',type:'button','aria-label':'Show password',onclick:()=>{const t=inp.type==='password';inp.type=t?'text':'password';b.textContent=t?'Hide':'Show';b.setAttribute('aria-label',t?'Hide password':'Show password');inp.focus();}},'Show');
  return h('div',{class:'re-pwrow'},inp,b);
}

/* ---------- working state ---------- */
const blank=()=>({text:{},img:{},imgMeta:{},theme:{dark:{},light:{}},calcInfo:{},fonts:{},hidden:{},order:{},posts:[]});
let WORK=blank();          // full working overrides (loaded from draft)
let LIVE=blank();          // last known *published* snapshot — what visitors see right now
/* Seed it from the cache the site itself keeps, so post statuses are right on the
   first paint; the fetch in onAuthed() then confirms it. */
try{ const c=localStorage.getItem('re-content'); if(c)LIVE=normalize(JSON.parse(c)); }catch(e){}
const dirty=new Set();     // "kind:key" changed this session
const undo=[];             // {kind,key,prev}
let editing=false;

function markDirty(id){ dirty.add(id); updateSaveBar(); }

/* ════════ STORE ADAPTERS ════════ */
function localStore(){
  const get=k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}};
  const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){toast('Storage full (image too large for local preview)','err');}};
  return {
    mode:'local',
    init(){return Promise.resolve(!!sessionStorage.getItem('re-auth'));},
    loginFields:[{id:'pass',label:'Editor passphrase',type:'password',ph:'Local preview — type any passphrase'}],
    login(v){ if(!v.pass||!v.pass.trim())return Promise.reject(new Error('Enter a passphrase')); sessionStorage.setItem('re-auth','1'); return Promise.resolve(true); },
    logout(){ sessionStorage.removeItem('re-auth'); },
    changePassword(){ return Promise.reject(new Error('Password change works on the live site once you’re signed in.')); },
    verifyPassword(){ return Promise.resolve(true); },   // no real account in local preview
    resetPassword(){ return Promise.reject(new Error('Password reset works on the live site.')); },
    inviteEditor(){ return Promise.reject(new Error('Inviting editors works on the live site.')); },
    revokeInvite(){ return Promise.reject(new Error('Works on the live site.')); },
    myRole(){ return Promise.resolve({owner:true}); },
    listInvites(){ return Promise.resolve([]); },
    subscribeInvites(){ return function(){}; },
    reconcileInvites(){ return Promise.resolve({reconciled:0}); },
    removeEditor(){ return Promise.reject(new Error('Removing editors works on the live site.')); },
    getProfile(){ return Promise.resolve({email:'you@rallysequities.com',name:'',created_at:'',last_sign_in_at:''}); },
    saveProfileName(){ return Promise.resolve(); },
    markInviteAccepted(){ return Promise.resolve(); },
    getDraft(){ return Promise.resolve(get('re-content-draft')||get('re-content')||blank()); },
    getPublished(){ return Promise.resolve(get('re-content')||blank()); },
    saveDraft(data){ set('re-content-draft',data); return Promise.resolve(); },
    publish(data){ set('re-content-draft',data); set('re-content',data); return Promise.resolve(); },
    uploadImage(file){ return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('read failed'));r.readAsDataURL(file);}); },
    listSubmissions(){ return Promise.resolve([]); },
    signedUrl(){ return Promise.resolve(null); },
    setHandled(){ return Promise.resolve(); },
    deleteSubmission(){ return Promise.resolve(); }
  };
}
function supabaseStore(){
  const sb=window.supabase.createClient(window.RE_SUPABASE.url,window.RE_SUPABASE.anonKey);
  const rowData=async scope=>{const{data}=await sb.from('site_content').select('data').eq('scope',scope).maybeSingle();return (data&&data.data)||blank();};
  return {
    mode:'supabase', _sb:sb,
    async init(){const{data}=await sb.auth.getSession();return !!(data&&data.session);},
    loginFields:[{id:'email',label:'Email',type:'email',ph:'you@email.com'},{id:'pass',label:'Password',type:'password',ph:'Your password'}],
    async login(v){const{error}=await sb.auth.signInWithPassword({email:(v.email||'').trim(),password:v.pass||''});if(error)throw new Error(error.message);return true;},
    async logout(){await sb.auth.signOut();},
    async changePassword(pw){const{error}=await sb.auth.updateUser({password:pw});if(error)throw new Error(error.message);},
    /* Supabase lets a signed-in user change their password without proving the old one.
       That's a real hazard on a shared office machine, so we re-authenticate first:
       signInWithPassword against the same account both checks the old password and
       refreshes the session. A wrong password leaves the current session untouched. */
    async verifyPassword(pw){
      const{data:{user}}=await sb.auth.getUser();
      const email=(user&&user.email)||'';
      if(!email)throw new Error('Your session expired — please log in again.');
      const{error}=await sb.auth.signInWithPassword({email,password:pw});
      if(error)throw new Error('That current password isn’t right.');
      return true;
    },
    /* Forgot-password: sends Supabase's recovery link, which lands on the same
       /set-password screen the invite uses (it handles type=recovery too). */
    async resetPassword(email,redirectTo){
      const{error}=await sb.auth.resetPasswordForEmail(String(email||'').trim(),{redirectTo:redirectTo||INVITE_REDIRECT});
      if(error)throw new Error(error.message);
    },
    async _fn(bodyObj){
      const{data:{session}}=await sb.auth.getSession();
      if(!session)throw new Error('Your session expired — please log in again.');
      const res=await fetch(window.RE_SUPABASE.url+'/functions/v1/invite-editor',{method:'POST',
        headers:{Authorization:'Bearer '+session.access_token,apikey:window.RE_SUPABASE.anonKey,'Content-Type':'application/json'},
        body:JSON.stringify(bodyObj)});
      const j=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(j.error||('Request failed ('+res.status+')'));
      return j;
    },
    async inviteEditor(email){ return await this._fn({email,redirectTo:INVITE_REDIRECT}); },
    async revokeInvite(id){ return await this._fn({action:'revoke',id}); },
    async myRole(){ return await this._fn({action:'me'}); },
    async listInvites(){ const{data,error}=await sb.from('invites').select('*').order('created_at',{ascending:false}); if(error)throw new Error(error.message); return data||[]; },
    /* Live updates: fire cb whenever the invites table changes (e.g. someone accepts).
       Needs the invites table in the supabase_realtime publication. Returns an unsubscribe fn. */
    subscribeInvites(cb){ try{ const ch=sb.channel('re-invites-'+Date.now()).on('postgres_changes',{event:'*',schema:'public',table:'invites'},()=>{ try{cb();}catch(e){} }).subscribe(); return ()=>{ try{sb.removeChannel(ch);}catch(e){} }; }catch(e){ return function(){}; } },
    async reconcileInvites(){ return await this._fn({action:'reconcile'}); },
    async removeEditor(inv){ return await this._fn({action:'remove',id:inv&&inv.id,email:inv&&inv.email}); },
    async getProfile(){ const{data:{user}}=await sb.auth.getUser(); const md=(user&&user.user_metadata)||{};
      return {email:(user&&user.email)||'',name:md.name||md.full_name||'',
              created_at:(user&&user.created_at)||'',last_sign_in_at:(user&&user.last_sign_in_at)||''}; },
    async saveProfileName(name){ const{error}=await sb.auth.updateUser({data:{name}}); if(error)throw new Error(error.message); },
    async markInviteAccepted(){ const{data:{user}}=await sb.auth.getUser(); if(!user)return; await sb.from('invites').update({accepted_at:new Date().toISOString()}).eq('email',(user.email||'').toLowerCase()).is('accepted_at',null); },
    async getDraft(){return await rowData('draft');},
    async getPublished(){return await rowData('published');},
    async saveDraft(data){const{error}=await sb.from('site_content').upsert({scope:'draft',data,version:(data.version||0)+1,updated_at:new Date().toISOString()});if(error)throw new Error(error.message);},
    async publish(data){const rec={data,version:(data.version||0)+1,updated_at:new Date().toISOString()};const{error}=await sb.from('site_content').upsert([{scope:'draft',...rec},{scope:'published',...rec}]);if(error)throw new Error(error.message);},
    async uploadImage(file){const ext=(file.name.split('.').pop()||'png').toLowerCase();const name='content/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;const{error}=await sb.storage.from('content-images').upload(name,file,{upsert:true,contentType:file.type});if(error)throw new Error(error.message);return sb.storage.from('content-images').getPublicUrl(name).data.publicUrl;},
    async listSubmissions(){const{data,error}=await sb.from('form_submissions').select('*').order('created_at',{ascending:false}).limit(300);if(error)throw new Error(error.message);return data||[];},
    async signedUrl(path){const{data,error}=await sb.storage.from('form-uploads').createSignedUrl(path,3600);return error?null:data.signedUrl;},
    async setHandled(id,val){await sb.from('form_submissions').update({handled:val}).eq('id',id);},
    async deleteSubmission(id){const{error}=await sb.from('form_submissions').delete().eq('id',id);if(error)throw new Error(error.message);}
  };
}
const Store = (window.RE_SUPABASE_READY && window.supabase) ? supabaseStore() : localStore();

/* ════════ LOGIN (fullscreen, branded) ════════ */
function showLogin(){
  const err=h('div',{class:'re-err',role:'alert'});
  const inputs={};
  const fields=Store.loginFields.map(f=>{
    const inp=h('input',{class:'re-input',type:f.type,placeholder:f.ph,autocomplete:f.type==='password'?'current-password':'email'});
    inputs[f.id]=inp;
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter')submit(); });
    return h('div',{class:'re-field'},h('label',{},f.label),f.type==='password'?pwWrap(inp):inp);
  });
  const isSb=Store.mode==='supabase';
  const btn=h('button',{class:'re-btn re-btn-pri re-btn-block',onclick:()=>submit()},isSb?'Sign in':'Enter editor');
  function submit(){
    const v={}; for(const k in inputs)v[k]=inputs[k].value;
    err.textContent=''; btn.disabled=true; btn.textContent=isSb?'Signing in…':'Opening…';
    Store.login(v).then(()=>{ wrap.remove(); onAuthed(); })
      .catch(e=>{ err.textContent=e.message||'Login failed'; btn.disabled=false; btn.textContent=isSb?'Sign in':'Enter editor'; });
  }
  /* Forgot password: without this an editor who forgets their password has no way
     back in except asking the owner for a whole new invite. */
  function forgot(){
    const typed=(inputs.email&&inputs.email.value||'').trim();
    rePrompt('We’ll email you a link to set a new password.',{title:'Reset your password',placeholder:'you@email.com',value:typed,okLabel:'Send reset link'})
      .then(email=>{
        if(!email)return;
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ toast('That doesn’t look like an email address','err'); return; }
        Promise.resolve(Store.resetPassword(email)).then(()=>toast('Reset link sent to '+email))
          .catch(e=>toast(e.message||'Could not send the reset link','err'));
      });
  }
  const wrap=h('div',{class:'re-login re-ui'},
    h('div',{},
      h('div',{class:'re-login-card'},
        h('div',{class:'re-login-rule'}),h('div',{class:'re-login-rule'}),
        h('div',{class:'re-login-body'},
          h('div',{class:'re-login-mark'},brandMark({h:44})),
          h('h1',{class:'re-login-brand'},'Rallys Equities'),
          h('div',{class:'re-login-sub'},'Website Admin'),
          isSb?'':h('div',{class:'re-note'},icon('alert',15),h('span',{},'Local preview — Supabase isn’t connected. Any passphrase works; changes save to this browser only.')),
          ...fields, err, btn,
          isSb?h('div',{class:'re-login-foot'},h('button',{class:'re-linkbtn',type:'button',onclick:forgot},'Forgot your password?')):'',
          isSb?h('p',{class:'re-login-hint'},'No account yet? Ask the site owner to send you an invite.'):'')),
      h('div',{class:'re-login-cap'},'SECP-licensed brokerage · PSX TREC holder')));
  document.body.append(wrap);
  setTimeout(()=>{const i=$('input',wrap);i&&i.focus();},50);
}

/* ════════ AFTER LOGIN ════════ */
function onAuthed(){
  /* Reconcile: any invited editor who is signed in has accepted — flip their
     invite to accepted (idempotent; no-op for the owner). Self-heals rows that
     were left "Pending". */
  if(Store.markInviteAccepted)Promise.resolve(Store.markInviteAccepted()).catch(()=>{});
  /* Show the admin IMMEDIATELY — never gate it on a network call. If a Supabase
     request stalls, the visitor would otherwise be left staring at the live site. */
  if(INVITE_FLOW)setTimeout(()=>openChangePassword(true),400); else openDashboard();
  /* Then load the saved draft in the background and refresh once it arrives. */
  Promise.resolve(Store.getDraft()).then(d=>{ WORK=normalize(d); API.setOverrides(WORK); API.refreshCalcInfo&&API.refreshCalcInfo(); softRefresh(); })
    .catch(e=>{ console.warn('[editor] could not load draft',e); });
  /* …and the published snapshot, so every screen can say what is actually on the
     website right now vs. what is still only in the draft. */
  if(Store.getPublished)Promise.resolve(Store.getPublished()).then(d=>{ LIVE=normalize(d); softRefresh(); })
    .catch(e=>{ console.warn('[editor] could not load the published snapshot',e); });
}
/* Legacy market-panel hide keys → new column keys (also hide the matching header cell) */
const HIDDEN_MIGRATE={
  'sel:#heroStocks .sprice':'sel:#heroStocks .sprice, .pcard .sh-price',
  'sel:#heroStocks .schg':'sel:#heroStocks .schg, .pcard .sh-chg',
  'sel:#heroStocks .pill':'sel:#heroStocks .spct, .pcard .sh-pct'
};
function migrateHidden(hidden){ hidden=hidden||{};
  for(const oldK in HIDDEN_MIGRATE){ if(oldK in hidden){ const v=hidden[oldK]; delete hidden[oldK]; hidden[HIDDEN_MIGRATE[oldK]]=v; } }
  return hidden;
}
function normalize(d){ d=d||{}; return {text:d.text||{},img:d.img||{},imgMeta:d.imgMeta||{},theme:{dark:(d.theme&&d.theme.dark)||{},light:(d.theme&&d.theme.light)||{}},calcInfo:d.calcInfo||{},fonts:d.fonts||{},hidden:migrateHidden(d.hidden||{}),order:d.order||{},posts:Array.isArray(d.posts)?d.posts:[],version:d.version||0}; }
function doLogout(){
  const busy=reBusy('Signing out','Closing your session on this device…');
  Promise.resolve(Store.logout())
    .then(()=>{ location.search=location.search.replace(/[?&]edit=1/,'')||''; })
    .catch(e=>{ busy.close(); toast(e.message||'Could not sign out','err'); });
}

/* ════════ DASHBOARD APP (fullscreen: sidebar + views) ════════ */
let dashEl,dashMain,dashView='overview',blogEditId=null,viewTeardown=null;
/* ── Submissions state: messages/complaints/feedback/careers/applications from the
   public forms (reSubmit() in index.html writes to form_submissions; RLS lets the
   public only insert, so reads/deletes only happen here). ── */
let subsData=[],subsQuery='',subsFilter='all',subsLoading=false,subsLoadedOnce=false;
const SUB_FILTERS=[['all','All'],['unhandled','New'],['contact','Contact'],['complaint','Complaint'],['feedback','Feedback'],['career','Career'],['application','Applications']];
const SUB_KIND_META={
  contact:{label:'Contact',icon:'mail'},
  complaint:{label:'Complaint',icon:'alert'},
  feedback:{label:'Feedback',icon:'chat'},
  career:{label:'Career',icon:'briefcase'},
  application:{label:'Account application',icon:'userplus'}
};
function teardownView(){ if(viewTeardown){ try{viewTeardown();}catch(e){} viewTeardown=null; } }

/* ── who's signed in ──
   Loaded once and shared by the sidebar and the Profile page, so opening Profile
   doesn't re-fetch what the chrome already knows. `owner` defaults to true if the
   role check fails, matching the server's fail-open behaviour. */
let ME={email:'',name:'',owner:true,owners:[],created_at:'',last_sign_in_at:''},mePromise=null;
function loadMe(force){
  if(mePromise&&!force)return mePromise;
  mePromise=Promise.all([
    Store.getProfile?Promise.resolve(Store.getProfile()).catch(()=>({})):Promise.resolve({}),
    Store.myRole?Promise.resolve(Store.myRole()).catch(()=>({})):Promise.resolve({})
  ]).then(([p,r])=>{
    ME=Object.assign({},ME,p||{},{owner:!(r&&r.owner===false),owners:(r&&r.owners)||[]});
    paintMe(); return ME;
  });
  return mePromise;
}
let sideEls={};
function paintMe(){
  if(!sideEls.meName)return;
  const known=!!(ME.name||ME.email);
  /* Until the identity lands, show its shape — not the word "Loading…" sitting where
     a person's name belongs. */
  sideEls.meName.textContent=known?(ME.name||ME.email):'';
  sideEls.meRole.textContent=known?(ME.owner?'Owner':'Editor'):'';
  sideEls.meName.classList.toggle('re-skel',!known);
  sideEls.meRole.classList.toggle('re-skel',!known);
  sideEls.meAv.textContent=known?initials(ME.name,ME.email):'';
  sideEls.meAv.classList.toggle('re-load',!known);
  sideEls.meAv.classList.toggle('ed',known&&!ME.owner);
  sideEls.me.title=ME.email||'';
}
/* The one fact you should never have to hunt for: is the website up to date? */
function updateSideStatus(){
  if(!sideEls.statusT)return;
  const n=dirty.size;
  const waiting=(WORK.posts||[]).filter(p=>postState(p).act).length;
  const pending=n||waiting;
  sideEls.status.classList.toggle('warn',!!pending);
  sideEls.statusIc.replaceChildren(icon(pending?'clock':'check',15));
  sideEls.statusT.textContent=n?(n+' unsaved change'+(n===1?'':'s'))
    :waiting?(waiting+' post'+(waiting===1?'':'s')+' to publish')
    :'Website up to date';
  sideEls.statusD.textContent=pending?'Not live until you publish':'Everything is published';
}
function ensureDash(){
  if(dashEl)return;
  const navItem=(id,ic,label,fn,badge)=>h('button',{class:'re-nav-item','data-nav':id||'',onclick:fn}, icon(ic,18), h('span',{class:'re-nav-lbl'},label), badge?h('span',{class:'re-nav-badge'}):'');
  sideEls.statusIc=h('span',{},icon('check',15));
  sideEls.statusT=h('span',{class:'re-side-status-t'},'Website up to date');
  sideEls.statusD=h('span',{class:'re-side-status-d'},'Everything is published');
  sideEls.status=h('button',{class:'re-side-status',type:'button',title:'Publishing state — opens Settings',onclick:()=>go('settings')},
    sideEls.statusIc,h('span',{class:'re-side-status-tx'},sideEls.statusT,sideEls.statusD));
  sideEls.meAv=h('span',{class:'re-avatar re-load','aria-hidden':'true'});
  sideEls.meName=h('span',{class:'re-side-me-n re-skel'});
  sideEls.meRole=h('span',{class:'re-side-me-r re-skel'});
  sideEls.me=h('div',{class:'re-side-me'},sideEls.meAv,h('span',{class:'re-side-me-tx'},sideEls.meName,sideEls.meRole));
  const side=h('aside',{class:'re-side'},
    h('div',{class:'re-side-brand'},brandMark({label:'Website Admin'})),
    h('nav',{class:'re-side-nav','aria-label':'Admin navigation'},
      navItem('overview','grid','Dashboard',()=>go('overview')),
      navItem('submissions','inbox','Submissions',()=>go('submissions'),true),
      navItem('blog','post','Blog Posts',()=>{ blogEditId=null; go('blog'); }),
      navItem('editors','users','Editors',()=>go('editors')),
      h('div',{class:'re-side-cap'},'Website'),
      navItem('','edit','Edit website',()=>enterStudio({edit:true})),
      navItem('','sliders','Site settings',()=>enterStudio({edit:false,panel:'site'})),
      navItem('','external','View live site',()=>window.open(location.origin+'/','_blank'))),
    h('div',{class:'re-side-foot'},
      sideEls.status, sideEls.me,
      navItem('profile','user','Profile',()=>go('profile')),
      navItem('settings','gear','Settings',()=>go('settings')),
      navItem('','logout','Log out',doLogout)));
  dashMain=h('div',{class:'re-main-inner'});
  dashEl=h('div',{class:'re-dash re-ui'},side,h('main',{class:'re-main'},dashMain));
  document.body.append(dashEl);
  paintMe(); updateSideStatus(); loadMe();
}
function go(view){ dashView=view; setActiveNav(); renderMain(); dashEl.querySelector('.re-main').scrollTop=0; if(view==='submissions')reloadSubs(); }
function setActiveNav(){ dashEl&&dashEl.querySelectorAll('.re-nav-item[data-nav]').forEach(b=>{const on=b.getAttribute('data-nav')===dashView;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}); }
function openDashboard(){
  ensureDash();
  dashEl.style.display='flex'; document.body.classList.add('re-dash-open');
  setActiveNav(); renderMain();
  reloadSubs();
}
function closeDashboard(){ teardownView(); if(dashEl)dashEl.style.display='none'; document.body.classList.remove('re-dash-open'); }
function dashVisible(){ return dashEl&&dashEl.style.display!=='none'; }
function emptyState(msg,ic,cta){ return h('div',{class:'re-empty'},icon(ic||'post',30),h('p',{},msg),cta||''); }

/* Everything a view actually reads. Redrawing is cheap but *visible* — the page
   repaints — so a background fetch that changes nothing shouldn't cause one. */
function viewSig(){
  return JSON.stringify([dashView,dirty.size,
    (WORK.posts||[]).map(postSig),(LIVE.posts||[]).map(postSig),
    Object.keys(WORK.hidden||{}).length]);
}
let lastViewSig='';
function renderMain(){ if(!dashMain||!dashVisible())return; teardownView(); dashMain.innerHTML=''; updateSideStatus(); lastViewSig=viewSig();
  ({overview:renderOverview,editors:renderEditors,blog:renderBlogAdmin,settings:renderSettings,profile:renderProfile,submissions:renderSubs}[dashView]||renderOverview)(); }
/* Background refresh (a fetch landed, a save finished): never redraw over a half-written
   post — the post form is the one view with unsaved input in the DOM. */
function softRefresh(){
  if(blogEditId)return;
  /* Also never redraw over a field someone is typing into — the profile's name box
     and the invite email box would both lose their input mid-keystroke. */
  const a=document.activeElement;
  if(a&&dashMain&&dashMain.contains(a)&&/^(INPUT|TEXTAREA)$/.test(a.tagName))return;
  /* Boot fires this twice (draft, then the published snapshot) and most saves fire it
     again with identical content — without this guard each one visibly repaints. */
  if(viewSig()===lastViewSig){ updateSideStatus(); return; }
  renderMain();
}
/* ── Profile — the signed-in user's own account ──
   Identity first (who you are, what you can do, since when), then the two things
   you can actually change here: your display name and your password. */
const setRow=(title,desc,ctl)=>h('div',{class:'re-setrow'},
  h('div',{class:'re-setrow-tx'},h('div',{class:'re-setrow-t'},title),desc?h('div',{class:'re-setrow-d'},desc):''),ctl);
function renderProfile(){
  dashMain.append(pageHead('Your account','Profile','How you sign in and how your name appears to other editors.'));
  const hero=h('div',{class:'re-prof-hero'},
    h('div',{class:'re-avatar re-avatar-lg re-skel',style:'border-radius:18px'}),
    h('div',{class:'re-prof-id'},skelBar('40%'),h('div',{style:'height:9px'}),skelBar('62%')));
  const card=h('div',{class:'re-card re-set-card'},h('div',{class:'re-set-h'},icon('user',17),'Details'),skelRows(3));
  const sec=h('div',{class:'re-card re-set-card'},h('div',{class:'re-set-h'},icon('shield',17),'Sign-in & security'),skelRows(2));
  dashMain.append(hero,card,sec);

  loadMe(true).then(()=>{
    const owner=!!ME.owner;
    /* hero */
    hero.replaceChildren(
      h('div',{class:'re-avatar re-avatar-lg'+(owner?'':' ed'),'aria-hidden':'true'},initials(ME.name,ME.email)),
      h('div',{class:'re-prof-id'},
        h('div',{class:'re-prof-name'},ME.name||(ME.email||'').split('@')[0]||'Your account'),
        h('div',{class:'re-prof-mail'},ME.email||'—'),
        h('div',{class:'re-prof-tags'},
          h('span',{class:'re-badge '+(owner?'re-inv-accepted':'re-inv-pending')},owner?'Owner':'Editor'),
          h('span',{class:'re-badge'},'Full site access'))));

    /* details: display name, email, role — each says what it's for */
    let saved=ME.name||'';
    const nameInp=h('input',{class:'re-input',value:saved,placeholder:'e.g. James Smith',style:'max-width:230px','aria-label':'Display name'});
    const saveName=h('button',{class:'re-btn re-btn-pri re-btn-sm',disabled:'disabled',onclick:()=>{
      const v=nameInp.value.trim(), restore=btnBusy(saveName,'Saving…');
      Promise.resolve(Store.saveProfileName(v)).then(()=>{
        saved=v; ME.name=v; paintMe(); toast('Name saved');
        restore(); sync();                                  // sync re-disables it: nothing left to save
      }).catch(x=>{ toast(x.message||'Could not save your name','err'); restore(); });
    }},'Save');
    const sync=()=>{ saveName.disabled=(nameInp.value.trim()===saved); };
    nameInp.addEventListener('input',sync);
    nameInp.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!saveName.disabled)saveName.click(); });
    card.replaceChildren(h('div',{class:'re-set-h'},icon('user',17),'Details'),
      setRow('Display name','Shown instead of your email across the admin.',
        h('div',{class:'re-inline-ctl'},nameInp,saveName)),
      setRow('Email address','The address you sign in with. Ask the site owner if it needs to change.',
        h('span',{class:'re-profile-email'},ME.email||'—')),
      setRow('Role',owner?'You can invite and remove editors, and change anything on the site.'
                        :'You can edit and publish the site. Only the owner manages editors.',
        h('span',{class:'re-badge '+(owner?'re-inv-accepted':'re-inv-pending')},owner?'Owner':'Editor')));

    /* security */
    const facts=h('div',{class:'re-facts'},
      h('div',{class:'re-fact'},h('div',{class:'re-fact-l'},'Editor since'),h('div',{class:'re-fact-v'},dateLong(ME.created_at))),
      h('div',{class:'re-fact'},h('div',{class:'re-fact-l'},'Last sign-in'),h('div',{class:'re-fact-v'},dateTime(ME.last_sign_in_at))));
    sec.replaceChildren(h('div',{class:'re-set-h'},icon('shield',17),'Sign-in & security'),
      setRow('Password','Pick a new password for this account. You’ll need your current one.',
        h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>openChangePassword()},icon('key',14),'Change password')),
      setRow('This device','Sign out of the admin on this browser.',
        h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{
          reConfirm('You’ll need your email and password to get back in.',{title:'Log out?',okLabel:'Log out'}).then(ok=>{ if(ok)doLogout(); });
        }},icon('logout',14),'Log out')),
      facts);
  }).catch(()=>{
    hero.replaceChildren(h('p',{class:'re-set-note',style:'margin:0'},'Couldn’t load your profile just now — check your connection and try again.'));
    card.remove(); sec.remove();
  });
}

/* ── Overview ── */
function kpi(label,value,ic,accent){ return h('div',{class:'re-kpi'+(accent?' on':'')}, h('span',{class:'re-kpi-ic'},icon(ic,18)), h('div',{class:'re-kpi-body'}, h('div',{class:'re-kpi-val'},String(value)), h('div',{class:'re-kpi-lbl'},label))); }
function qa(ic,title,desc,fn){ return h('button',{class:'re-qa',onclick:fn},
  h('span',{class:'re-qa-ic'},icon(ic,19)),
  h('span',{class:'re-qa-tx'},h('span',{class:'re-qa-t'},title),h('span',{class:'re-qa-d'},desc)),
  h('span',{class:'re-qa-go'},icon('chevr',16))); }
function renderOverview(){
  const posts=WORK.posts||[];
  const states=posts.map(postState);
  const onSite=states.filter(s=>s.label==='Live'||s.label==='Edited').length;
  const waiting=states.filter(s=>s.act).length;
  const pagesAll=[...document.querySelectorAll('.page')].filter(p=>p.id!=='page-post').length;
  const pagesHidden=Object.keys(WORK.hidden||{}).filter(k=>k.indexOf('page:')===0).length;
  dashMain.append(pageHead('Website overview','Dashboard','What’s on your website right now, and what’s still waiting.',
    [h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>window.open(location.origin+'/','_blank')},icon('external',14),'View live site')]));
  if(dirty.size||waiting)dashMain.append(h('div',{class:'re-banner'},
    icon('alert',18),
    h('span',{class:'re-banner-tx'},h('b',{},waiting&&!dirty.size?(waiting+' post'+(waiting===1?'':'s')+' not on the website yet')
        :(dirty.size+' unsaved change'+(dirty.size===1?'':'s'))),
      ' — nothing reaches visitors until you publish.'),
    h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>enterStudio({edit:true})},'Continue editing'),
    h('button',{class:'re-btn re-btn-gd re-btn-sm',onclick:()=>publishAll()},'Publish now')));
  dashMain.append(h('div',{class:'re-kpis'},
    kpi('Blog posts',posts.length,'post'),
    kpi('On the website',onSite,'check',onSite>0),
    kpi('Waiting to publish',waiting,'clock'),
    kpi('Visible pages',pagesAll-pagesHidden,'grid')));
  dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'Manage the website')));
  dashMain.append(h('div',{class:'re-qas'},
    qa('inbox','Check submissions','See messages, complaints, feedback and applications from visitors.',()=>go('submissions')),
    qa('edit','Edit content','Click text to rewrite it; drag anything to move it; hide what you don’t need.',()=>enterStudio({edit:true})),
    qa('post','Write a blog post','Publish market commentary to the site’s Blogs section.',()=>{ blogEditId='new'; go('blog'); }),
    qa('image','Photos','Swap any photo — click it, or drag one photo onto another.',()=>enterStudio({edit:false,panel:'photos'})),
    qa('sliders','Site settings','Show/hide market widgets, remove pages, restore hidden pieces.',()=>enterStudio({edit:false,panel:'site'})),
    qa('palette','Theme & fonts','Adjust the site’s colors and typography.',()=>enterStudio({edit:false,panel:'theme'}))));
  dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'Recent posts'),
    posts.length?h('button',{class:'re-linkbtn',onclick:()=>{ blogEditId=null; go('blog'); }},'View all'):''));
  const list=h('div',{class:'re-sub-list'});
  const recent=[...posts].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,3);
  if(!recent.length)list.append(emptyState('No posts yet — write your first blog post.'));
  else recent.forEach(p=>list.append(postRow(p)));
  dashMain.append(list);
}

/* ── Submissions — messages, complaints, feedback, careers & applications sent through
   the public site's forms (reSubmit() in index.html inserts into form_submissions;
   RLS lets the public only INSERT, so reading/deleting only happens here). ── */
async function reloadSubs(){
  if(Store.mode!=='supabase'){ subsData=[]; subsLoadedOnce=true; updateNavBadge(); if(dashView==='submissions')renderMain(); return; }
  subsLoading=true; if(dashView==='submissions')renderMain();
  try{ subsData=await Store.listSubmissions(); }catch(e){ console.warn('[submissions] load failed',e); }
  subsLoading=false; subsLoadedOnce=true; updateNavBadge();
  if(dashView==='submissions')renderMain();
}
function subsStats(){ const wk=Date.now()-7*864e5; let unhandled=0,week=0; const byKind={}; subsData.forEach(r=>{ if(!r.handled)unhandled++; byKind[r.kind]=(byKind[r.kind]||0)+1; const t=Date.parse(r.created_at||''); if(t&&t>=wk)week++; }); return {total:subsData.length,unhandled,week,byKind}; }
function subFilterCount(k){ const s=subsStats(); if(k==='all')return s.total; if(k==='unhandled')return s.unhandled; return s.byKind[k]||0; }
function filteredSubs(){ const q=subsQuery.trim().toLowerCase(); return subsData.filter(r=>{ if(subsFilter==='unhandled'){ if(r.handled)return false; } else if(subsFilter!=='all' && r.kind!==subsFilter)return false; if(!q)return true; return (JSON.stringify(r.data||{})+' '+(r.reference||'')).toLowerCase().includes(q); }); }
function updateNavBadge(){ const b=dashEl&&dashEl.querySelector('[data-nav="submissions"] .re-nav-badge'); if(!b)return; const n=subsStats().unhandled; b.textContent=n>99?'99+':(n||''); b.style.display=n?'inline-flex':'none'; }
function prettyLabel(k){return k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());}
/* These get a dedicated spot in the card header/meta/message — leave them out of the
   generic "extra details" list below so nothing is shown twice. */
const SUB_PROMINENT=new Set(['name','firstName','lastName','email','phone','mobile','message','subject','category','reference','source']);
function fieldRows(obj,exclude){
  const order=['name','firstName','lastName','email','phone','mobile','subject','category','position','message','coverLetter','reference','cnic','dob','gender','address','city','province','employment','employer','income','sourceOfFunds','bank','iban','experience','objective','accountType','riskTolerance','language','services','source'];
  const has=k=>obj[k]!=null&&String(obj[k]).trim()!==''&&!(exclude&&exclude.has(k));
  const keys=[...order.filter(has),...Object.keys(obj).filter(k=>order.indexOf(k)<0&&has(k))];
  return keys.map(k=>h('div',{class:'re-sub-row'},h('span',{class:'re-sub-k'},prettyLabel(k)),h('span',{class:'re-sub-v'},String(obj[k]))));
}
/* Relative time in the list ("2h ago"); the exact timestamp is one hover away. */
function timeAgo(iso){
  const t=Date.parse(iso||''); if(!t)return '—';
  const s=Math.max(0,Math.floor((Date.now()-t)/1000));
  if(s<60)return 'just now';
  const m=Math.floor(s/60); if(m<60)return m+'m ago';
  const hh=Math.floor(m/60); if(hh<24)return hh+'h ago';
  const d=Math.floor(hh/24); if(d<7)return d+'d ago';
  return new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
}
function subCard(r){
  const d=r.data||{};
  const meta=SUB_KIND_META[r.kind]||{label:prettyLabel(r.kind||'Other'),icon:'inbox'};
  const name=d.name||[d.firstName,d.lastName].filter(Boolean).join(' ')||d.email||'Anonymous';
  const when=(r.created_at||'').replace('T',' ').slice(0,16);
  const card=h('div',{class:'re-sub2'+(r.handled?' done':' new')});

  let swLbl;
  const sw=h('button',{class:'re-toggle re-sub2-sw'+(r.handled?' on':''),type:'button','aria-pressed':String(!!r.handled),
    onclick:()=>{ const val=!r.handled; Store.setHandled(r.id,val); r.handled=val;
      card.classList.toggle('done',val); card.classList.toggle('new',!val);
      sw.classList.toggle('on',val); swLbl.textContent=val?'Handled':'Mark as handled';
      updateNavBadge(); }},
    swLbl=h('span',{class:'re-siterow-lbl'},r.handled?'Handled':'Mark as handled'),
    h('span',{class:'re-switch'}));

  const metaBits=[];
  if(d.email)metaBits.push(h('a',{class:'re-sub2-metabit',href:'mailto:'+d.email},icon('mail',12),d.email));
  const phone=d.phone||d.mobile;
  if(phone)metaBits.push(h('a',{class:'re-sub2-metabit',href:'tel:'+phone},icon('phone',12),phone));
  if(d.source)metaBits.push(h('span',{class:'re-sub2-metabit re-sub2-src'},'via '+d.source));

  const tags=[];
  if(d.subject)tags.push(h('span',{class:'re-sub2-tag'},d.subject));
  if(d.category)tags.push(h('span',{class:'re-sub2-tag'},d.category));

  const rows=fieldRows(d,SUB_PROMINENT);
  const fields=h('div',{class:'re-sub-fields'});
  if(rows.length>4){
    rows.slice(0,3).forEach(x=>fields.append(x));
    const more=h('div',{class:'re-sub-more'}); rows.slice(3).forEach(x=>more.append(x));
    const lbl=h('span',{},'Show all '+rows.length+' details');
    const tog=h('button',{class:'re-sub-expand',onclick:()=>{ const open=more.classList.toggle('open'); tog.classList.toggle('open',open); lbl.textContent=open?'Show less':'Show all '+rows.length+' details'; }},icon('chevron',14),lbl);
    fields.append(more,tog);
  } else rows.forEach(x=>fields.append(x));
  const files=(r.files||[]).map(f=>h('button',{class:'re-file',onclick:async ev=>{ev.preventDefault();const b=ev.currentTarget;const old=b.textContent;b.textContent='opening…';const u=await Store.signedUrl(f.path);b.textContent=old;if(u)window.open(u,'_blank');else toast('Could not open file','err');}}, icon('download',13), (f.field||'file')));

  card.append(
    h('div',{class:'re-sub2-ic re-k-'+r.kind},icon(meta.icon,18)),
    h('div',{class:'re-sub2-body'},
      h('div',{class:'re-sub2-top'},
        h('span',{class:'re-sub2-name'},name),
        h('span',{class:'re-badge re-k-'+r.kind},meta.label),
        r.reference?h('span',{class:'re-sub-ref',title:'Reference'},r.reference):'',
        h('span',{class:'re-sub2-when',title:when},timeAgo(r.created_at))),
      metaBits.length?h('div',{class:'re-sub2-meta'},...metaBits):'',
      tags.length?h('div',{class:'re-sub2-tags'},...tags):'',
      d.message?h('blockquote',{class:'re-sub2-msg'},d.message):'',
      rows.length?fields:'',
      files.length?h('div',{class:'re-sub-files'},h('span',{class:'re-sub-k'},'Files'),h('span',{},...files)):'',
      h('div',{class:'re-sub2-foot'},
        sw,
        h('div',{class:'re-sub2-foot-r'},
          d.email?h('a',{class:'re-btn re-btn-ghost re-btn-sm',href:'mailto:'+d.email+'?subject='+encodeURIComponent('Re: your message to Rallys Equities')},icon('mail',13),'Reply'):'',
          h('button',{class:'re-sub-del',onclick:async()=>{ if(!(await reConfirm('This permanently deletes this submission.',{title:'Delete submission?',okLabel:'Delete',danger:true})))return; try{ await Store.deleteSubmission(r.id); card.remove(); subsData=subsData.filter(x=>x.id!==r.id); updateNavBadge(); toast('Submission deleted'); }catch(e){ toast('Delete failed: '+e.message,'err'); } }}, icon('trash',13),'Delete')))));
  return card;
}
function renderSubs(){
  const s=subsStats();
  dashMain.append(pageHead('Website inbox','Submissions',
    (subsLoading&&!subsLoadedOnce)?'Loading…':(s.total+' total · '+s.unhandled+' new'),
    [h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:reloadSubs},icon('refresh',14),'Refresh')]));
  if(Store.mode!=='supabase'){
    dashMain.append(h('div',{class:'re-empty'},icon('inbox',30),h('p',{},'Submissions need the live Supabase connection — this local preview has none to show.')));
    return;
  }
  dashMain.append(h('div',{class:'re-kpis'},
    kpi('Total',s.total,'inbox'),
    kpi('New',s.unhandled,'clock',s.unhandled>0),
    kpi('This week',s.week,'refresh')));
  const inp=h('input',{class:'re-search-input',type:'search',placeholder:'Search name, email, message…',value:subsQuery,'aria-label':'Search submissions'});
  inp.addEventListener('input',()=>{ subsQuery=inp.value; drawList(); });
  dashMain.append(h('div',{class:'re-subs-tools'},h('div',{class:'re-search'},icon('search',16),inp)));
  const tabs=h('div',{class:'re-filters'});
  SUB_FILTERS.forEach(([k,lbl])=>{
    const b=h('button',{class:'re-filter'+(subsFilter===k?' on':''),onclick:()=>{ subsFilter=k; tabs.querySelectorAll('.re-filter').forEach(x=>x.classList.remove('on')); b.classList.add('on'); drawList(); }},lbl+' ('+subFilterCount(k)+')');
    tabs.append(b);
  });
  dashMain.append(tabs);
  const listWrap=h('div',{class:'re-sub-list'}); dashMain.append(listWrap);
  function drawList(){
    listWrap.innerHTML='';
    if(subsLoading&&!subsLoadedOnce){ listWrap.append(skelRows(3,false)); return; }
    const rows=filteredSubs();
    if(!rows.length){ listWrap.append(emptyState(subsData.length?'Nothing matches this filter.':'No submissions yet. When a visitor sends a form, it appears here.','inbox')); return; }
    rows.forEach(r=>listWrap.append(subCard(r)));
  }
  drawList();
}

/* ── Editors (invite by email via Resend; the shareable link stays as a fallback) ── */
function inviteStatus(inv){ if(inv.accepted_at)return'Accepted'; if(inv.expires_at&&new Date(inv.expires_at)<=new Date())return'Expired'; return'Pending'; }
function renderEditors(){
  dashMain.append(pageHead('Team access','Editors','Invite a teammate by email, or remove someone who no longer needs access.'));
  const err=h('div',{class:'re-err',role:'alert'});
  const em=h('input',{class:'re-input',type:'email',placeholder:'teammate@gmail.com','aria-label':'Teammate email'});
  const btn=h('button',{class:'re-btn re-btn-pri',onclick:()=>create()},'Send invite');
  const linkBox=h('div',{class:'re-linkbox'});
  const listWrap=h('div',{class:'re-inv-list'});
  const cpy=(text,label,inp)=>{ if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>toast(label+' copied')).catch(()=>inp&&inp.select());}else if(inp){inp.select();} };
  const showLink=(url,email,res)=>{
    res=res||{}; const emailed=res.emailed;
    linkBox.innerHTML='';
    linkBox.classList.toggle('re-linkbox-warn',!emailed);
    const inp=h('input',{class:'re-input re-linkinput',value:url,readonly:'readonly','aria-label':'Invite link'});
    const msg='Hi! You’ve been invited to help manage the Rallys Equities website. Tap this link to set your password and get started (valid ~24 hours):\n\n'+url;
    linkBox.append(
      emailed
        ? h('div',{class:'re-linkbox-h'},icon('check',14),'Invite emailed to '+email)
        : h('div',{class:'re-linkbox-h'},icon('alert',14),'Email didn’t send — share this link instead'),
      h('div',{class:'re-linkbox-note'}, emailed
        ? 'They’ll receive an email with a “Set my password” button. Prefer to send it yourself? Use the link below (valid ~24 hours).'
        : ('The invite was created but the email couldn’t be sent'+(res.emailError?(' — '+res.emailError):'')+'. Copy the link or message and send it over WhatsApp or email.')),
      h('div',{class:'re-linkrow'},inp,
        h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>cpy(url,'Link',inp)},icon('copy',14),'Copy link'),
        h('button',{class:'re-btn re-btn-pri re-btn-sm',onclick:()=>cpy(msg,'Message',inp)},icon('mail',14),'Copy message')));
    linkBox.style.display='block';
  };
  function create(){ err.textContent=''; const e=(em.value||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ err.textContent='Enter a valid email address.'; return; }
    const restore=btnBusy(btn,'Sending…');
    Promise.resolve(Store.inviteEditor(e)).then(r=>{ restore(); em.value='';
      if(r&&r.link)showLink(r.link,e,r);
      toast(r&&r.emailed?('Invite emailed to '+e):'Invite created — share the link', r&&r.emailed?undefined:'err'); loadList(false,true); })
      .catch(x=>{ err.textContent=x.message||'Could not create invite.'; restore(); });
  }
  em.addEventListener('keydown',e=>{ if(e.key==='Enter')create(); });
  /* readOnly → viewers (non-owners) see the roster but no Resend/Revoke controls.
     quiet → a background refresh (the fallback poll, realtime, or a just-completed
     action): no skeletons, and the DOM is left completely alone unless the data
     actually changed. Without this the poll tore the list down and re-shimmered it
     every 15 seconds, which reads as the page reloading by itself. */
  let listSig='';
  function loadList(readOnly,quiet){
    if(!quiet){ listSig=''; listWrap.innerHTML=''; listWrap.append(skelRows(3,true)); }
    Promise.resolve(Store.listInvites()).then(rows=>{
      rows=rows||[];
      const sig=JSON.stringify(rows.map(r=>[r.id,r.email,inviteStatus(r)]));
      if(quiet&&sig===listSig)return;              // nothing changed → don't touch the DOM
      listSig=sig;
      listWrap.innerHTML='';
      if(!rows.length){ listWrap.append(h('div',{class:'re-inv-empty'},readOnly?'No editors yet.':'No invites yet.')); return; }
      rows.forEach(inv=>{ const st=inviteStatus(inv); const acts=[];
        if(!readOnly && st!=='Accepted'){
          acts.push(h('button',{class:'re-inv-act',onclick:()=>{ Promise.resolve(Store.inviteEditor(inv.email)).then(r=>{ if(r&&r.link)showLink(r.link,inv.email,r); toast(r&&r.emailed?'New invite emailed':'New link ready',r&&r.emailed?undefined:'err'); loadList(false,true); }).catch(x=>{ toast(x.message,'err'); loadList(false,true); }); }},icon('refresh',12),'Resend'));
          acts.push(h('button',{class:'re-inv-act re-inv-del',onclick:()=>{ reConfirm('Revoke the invite for '+inv.email+'? Their link will stop working.',{title:'Revoke invite?',okLabel:'Revoke',danger:true}).then(ok=>{ if(!ok)return; Promise.resolve(Store.revokeInvite(inv.id)).then(()=>{ toast('Invite revoked'); loadList(false,true); }).catch(x=>toast(x.message,'err')); }); }},'Revoke'));
        } else if(!readOnly && st==='Accepted'){
          acts.push(h('button',{class:'re-inv-act re-inv-del',onclick:()=>{ reConfirm('Remove '+inv.email+' as an editor? This deletes their login — they lose access immediately.',{title:'Remove editor?',okLabel:'Remove',danger:true}).then(ok=>{ if(!ok)return; Promise.resolve(Store.removeEditor(inv)).then(()=>{ toast('Editor removed'); loadList(false,true); }).catch(x=>toast(x.message,'err')); }); }},icon('trash',12),'Remove'));
        }
        listWrap.append(h('div',{class:'re-inv-row'},
          h('span',{class:'re-inv-email',title:inv.email},inv.email),
          h('span',{class:'re-badge re-inv-'+st.toLowerCase()},st),
          h('span',{class:'re-inv-actions'},...acts)));
      });
    }).catch(x=>{
      if(quiet)return;                             // a failed background poll must not wipe a good list
      listWrap.innerHTML=''; listWrap.append(h('div',{class:'re-inv-empty'},'Couldn’t load the list: '+x.message));
    });
  }
  const ownerUI=()=>{
    dashMain.append(h('div',{class:'re-card re-set-card'},
      h('div',{class:'re-set-h'},icon('mail',17),'Invite an editor'),
      h('p',{class:'re-set-note'},'They get a branded email with a one-time link to set their own password. It’s valid for about 24 hours.'),
      h('div',{class:'re-field',style:'margin-top:14px'},h('label',{},'Their email address'),h('div',{class:'re-invrow'},em,btn)), err, linkBox));
    dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'People with access'),iconBtn('refresh','Refresh invites',()=>loadList(false))));
    dashMain.append(listWrap);
    loadList(false);
  };
  /* Non-owners: read-only roster — they can see who has access but can't change it.
     Enforced server-side (invite/revoke return 403); the UI just reflects it. */
  const viewerUI=(owners)=>{
    dashMain.append(h('div',{class:'re-card re-set-card'},
      h('div',{class:'re-set-h'},icon('eye',16),' View only'),
      h('p',{class:'re-set-note',style:'margin:0'},'You can see who has access to the website. Only the site owner can add or remove editors.')));
    if(owners&&owners.length){
      const ow=h('div',{class:'re-inv-list'});
      owners.forEach(email=>ow.append(h('div',{class:'re-inv-row'},
        h('span',{class:'re-inv-email',title:email},email),
        h('span',{class:'re-badge re-inv-accepted'},'Owner'))));
      dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'Owners')));
      dashMain.append(ow);
    }
    dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'Editors'),iconBtn('refresh','Refresh',()=>loadList(true))));
    dashMain.append(listWrap);
    loadList(true);
  };
  const gate=h('div',{class:'re-card'},skelBar('30%'),h('div',{style:'height:14px'}),skelRows(2,true)); dashMain.append(gate);
  Promise.resolve(Store.myRole?Store.myRole():{owner:true}).then(r=>{
    gate.remove();
    const ro=!!(r&&r.owner===false);
    if(ro){ viewerUI(r.owners||[]); }
    else { ownerUI();
      /* heal invites that were accepted before we tracked it (e.g. from the old site) */
      if(Store.reconcileInvites)Promise.resolve(Store.reconcileInvites()).then(res=>{ if(res&&res.reconciled)loadList(false,true); }).catch(()=>{});
    }
    /* Live: refresh the roster the instant an invite changes (e.g. someone accepts),
       so the admin never has to reload. Realtime is the fast path, so the poll is only
       a fallback for when the realtime channel didn't connect — 15s was needlessly
       aggressive, and polling a tab nobody is looking at is pure waste. Both paths are
       quiet: they only redraw when something actually changed. */
    const refresh=()=>loadList(ro,true);
    const unsub=Store.subscribeInvites?Store.subscribeInvites(refresh):function(){};
    const poll=setInterval(()=>{ if(!document.hidden)refresh(); },45000);
    const onVis=()=>{ if(!document.hidden)refresh(); };   // catch up on return, without a flash
    document.addEventListener('visibilitychange',onVis);
    viewTeardown=()=>{ try{unsub();}catch(e){} clearInterval(poll); document.removeEventListener('visibilitychange',onVis); };
  }).catch(()=>{ gate.remove(); ownerUI(); });
}

/* ── Blog Posts — written here, shown on the site's “Blogs” page ──
   Three separate facts decide what a visitor sees, and mixing them up is what makes
   publishing confusing. So we always resolve them into one plain status:
     · what the post says in your draft   (p.published)
     · what the website is actually serving (LIVE.posts — the published snapshot)
     · whether the two copies are identical (postSig) */
function postDateFmt(d){ const t=Date.parse(d||''); return t?new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):(d||''); }
const postSig=p=>p?JSON.stringify([p.title||'',p.date||'',p.cover||'',p.excerpt||'',p.body||'',p.published!==false]):'';
function livePost(id){ return (LIVE.posts||[]).find(x=>x.id===id); }
function postState(p){
  const lv=livePost(p.id), onSite=!!(lv&&lv.published!==false), want=p.published!==false;
  if(want&&onSite)return postSig(lv)===postSig(p)
    ? {label:'Live',cls:'re-inv-accepted',hint:'Everyone can read it on the website.'}
    : {label:'Edited',cls:'re-inv-pending',hint:'Your edits aren’t on the website yet.',act:'Publish edits'};
  if(want&&!onSite)return {label:'Not published',cls:'re-inv-pending',hint:'Ready to go — publish to put it on the website.',act:'Publish now'};
  if(!want&&onSite)return {label:'Draft',cls:'re-inv-pending',hint:'Still on the website until you publish.',act:'Publish to remove it'};
  return {label:'Draft',cls:'',hint:'Only visible here in the admin.'};
}
/* Everything shares one draft, so any publish pushes the whole draft live.
   Spell that out instead of surprising the user. */
function pendingEdits(){ return [...dirty].filter(k=>k.indexOf('posts:')!==0).length; }
function otherPending(exceptId){
  const posts=(WORK.posts||[]).filter(p=>p.id!==exceptId&&postState(p).act).length;
  const edits=pendingEdits();
  const bits=[];
  if(posts)bits.push(posts+' other post'+(posts===1?'':'s'));
  if(edits)bits.push(edits+' website edit'+(edits===1?'':'s'));
  if(!bits.length)return '';
  return ' '+bits.join(' and ')+' waiting in your draft '+(posts+edits===1?'goes':'go')+' live at the same time.';
}
/* Same note for actions that clear the posts anyway — only the site edits are worth mentioning. */
function pendingEditsNote(){ const n=pendingEdits();
  return n?(' '+n+' website edit'+(n===1?'':'s')+' waiting in your draft '+(n===1?'goes':'go')+' live too.'):''; }
function renderBlogAdmin(){ if(blogEditId)renderPostEditor(); else renderPostList(); }
function renderPostList(){
  const posts=[...(WORK.posts||[])].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const states=posts.map(postState);
  const onSite=states.filter(s=>s.label==='Live'||s.label==='Edited').length;
  const waiting=states.filter(s=>s.act).length;
  dashMain.append(pageHead('Content','Blog Posts',
    'Shown on the website’s “Blogs” page · '+posts.length+' post'+(posts.length===1?'':'s')+' · '+onSite+' on the website',
    [h('button',{class:'re-btn re-btn-pri re-btn-sm',onclick:()=>{ blogEditId='new'; renderMain(); }},icon('edit',14),'Write a new post')]));
  if(waiting||dirty.size)dashMain.append(h('div',{class:'re-banner'},
    icon('alert',18),
    h('span',{class:'re-banner-tx'},
      h('b',{},waiting?(waiting+' post'+(waiting===1?'':'s')+' not on the website yet')
                     :(dirty.size+' unsaved change'+(dirty.size===1?'':'s'))),
      ' — publishing puts your whole draft live.'),
    h('button',{class:'re-btn re-btn-gd re-btn-sm',onclick:()=>publishAll()},'Publish now')));
  dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},posts.length?'All posts':'Your posts')));
  const list=h('div',{class:'re-sub-list'}); dashMain.append(list);
  if(!posts.length){ list.append(emptyState('No posts yet — write your first blog post.','post',
    h('button',{class:'re-btn re-btn-pri re-btn-sm',onclick:()=>{ blogEditId='new'; renderMain(); }},'Write a new post'))); return; }
  posts.forEach((p,i)=>list.append(postRow(p,states[i])));
}
function postRow(p,st){
  st=st||postState(p);
  const cover=p.cover?h('img',{class:'re-post-cover',src:p.cover,alt:''}):h('span',{class:'re-post-cover'},icon('image',18));
  return h('div',{class:'re-post-row'},cover,
    h('div',{class:'re-post-meta'},
      h('div',{class:'re-post-title'},p.title||'Untitled'),
      h('div',{class:'re-post-sub'},
        h('span',{class:'re-badge '+st.cls},st.label),
        h('span',{},postDateFmt(p.date))),
      h('div',{class:'re-post-hint'},st.hint)),
    st.act?h('button',{class:'re-btn re-btn-gd re-btn-sm',onclick:()=>publishAll(p)},'Publish'):'',
    h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{ blogEditId=p.id; go('blog'); }},'Edit'),
    /* Delete has to mean deleted. A post that's on the website can't just leave the
       draft — the row would vanish and take the only "publish this removal" button
       with it, leaving the post live forever. So deleting a live post publishes the
       removal too. */
    h('button',{class:'re-sub-del','aria-label':'Delete post',onclick:async()=>{
      const lv=livePost(p.id), onSite=!!lv&&lv.published!==false;
      if(!(await reConfirm('Delete “'+(p.title||'Untitled')+'”?'+
          (onSite?(' It comes off the website straight away.'+otherPending(p.id)):' It was never on the website.'),
          {title:'Delete post?',okLabel:'Delete',danger:true})))return;
      WORK.posts=(WORK.posts||[]).filter(x=>x.id!==p.id); markDirty('posts:'+p.id); API.setOverrides(WORK);
      if(onSite)doPublish('Deleted — and taken off the website')
        .catch(e=>toast('Deleted from your draft, but the website still shows it: '+e.message,'err'));
      else saveDraft('Post deleted');
    }},icon('trash',13),'Delete'));
}

/* ── Settings — publishing, account, and reset-to-default options ── */
function renderSettings(){
  dashMain.append(pageHead('Admin','Settings','Publishing, your account, and a way back if a design change goes wrong.'));
  const row=setRow;
  const n=dirty.size;
  const waiting=(WORK.posts||[]).filter(p=>postState(p).act).length;
  const nLive=(WORK.posts||[]).filter(p=>{ const lv=livePost(p.id); return lv&&lv.published!==false; }).length;
  dashMain.append(h('div',{class:'re-card re-set-card'},
    h('div',{class:'re-set-h'},icon('cloud',17),'Publishing'),
    row('Waiting to go live',
      n?(n+' unsaved change'+(n===1?'':'s')+' — drafts stay private until you publish.')
       :(waiting?(waiting+' blog post'+(waiting===1?'':'s')+' saved but not on the website yet.')
                :'Everything is saved and published. Nothing is waiting.'),
      h('div',{class:'re-setbtns'},
        n?h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>saveDraft()},'Save draft'):'',
        n?h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:discardAll},'Discard'):'',
        h('button',{class:'re-btn re-btn-gd re-btn-sm',onclick:()=>publishAll()},'Publish')))));
  dashMain.append(h('div',{class:'re-card re-set-card'},
    h('div',{class:'re-set-h'},icon('user',17),'Account & admin'),
    row('Appearance','Switch this admin panel between light and dark mode.',(()=>{
      const dark=()=>!document.body.classList.contains('light');
      let lbl;
      const sw=h('button',{class:'re-toggle'+(dark()?' on':''),type:'button','aria-pressed':String(dark()),
        onclick:()=>{ toggleTheme(); const on=dark(); sw.classList.toggle('on',on); lbl.textContent=on?'Dark mode':'Light mode'; }},
        lbl=h('span',{class:'re-siterow-lbl'},dark()?'Dark mode':'Light mode'),
        h('span',{class:'re-switch'}));
      return sw;
    })()),
    row('Your profile','Your name, email, role, and sign-in details.',
      h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>go('profile')},'Open profile')),
    row('Password','Change the password you use to sign in here.',
      h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>openChangePassword()},icon('key',14),'Change password')),
    row('Welcome tips','Show the first-run tips again next time you open the editor.',
      h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{ localStorage.removeItem('re-coached'); toast('Tips will show next time you open the editor'); }},'Show tips again'))));
  /* Resets are saved to the draft and the page reloads, so the preview matches exactly.
     Nothing goes live until Publish. */
  const doReset=(what,desc,mut)=>{
    reConfirm(desc+' This updates your draft and reloads the editor — nothing goes live until you publish.',{title:'Reset '+what+'?',okLabel:'Reset'}).then(ok=>{ if(!ok)return;
      mut();
      /* The curtain stays up through the reload, so the reset never looks like a crash. */
      const busy=reBusy('Restoring',what.charAt(0).toUpperCase()+what.slice(1)+' — putting the original design back.');
      Promise.resolve(Store.saveDraft(cleanWork())).then(()=>{ busy.update('Reloading the editor…'); setTimeout(()=>location.reload(),600); })
        .catch(e=>{ busy.close(); toast('Could not save the reset: '+e.message,'err'); });
    });
  };
  const resets=[
    ['colors & fonts','Back to the original brand palette and typography.',()=>{ WORK.theme={dark:{},light:{}}; WORK.fonts={}; }],
    ['text edits','Every heading and paragraph returns to its original wording.',()=>{ WORK.text={}; }],
    ['images','All photos return to the site’s original images.',()=>{ WORK.img={}; WORK.imgMeta={}; }],
    ['hidden elements & pages','Everything you hid or deleted comes back.',()=>{ WORK.hidden={}; }],
    ['layout & ordering','Dragged sections and elements return to their original positions.',()=>{ WORK.order={}; }],
  ];
  dashMain.append(h('div',{class:'re-card re-set-card re-set-gold'},
    h('div',{class:'re-set-h'},icon('restore',17),'Reset to defaults'),
    h('p',{class:'re-set-note'},'Made a mess? Put any part of the design back the way it started.'),
    ...resets.map(([what,desc,mut])=>row(what.charAt(0).toUpperCase()+what.slice(1),desc,
      h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>doReset(what,desc,mut)},'Reset')))));
  dashMain.append(h('div',{class:'re-card re-set-card re-set-danger'},
    h('div',{class:'re-set-h'},icon('alert',17),'Danger zone'),
    row('Delete all blog posts','Removes all '+(WORK.posts||[]).length+' posts.'+(nLive?(' '+nLive+' of them '+(nLive===1?'is':'are')+' on the website.'):''),
      h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{
        reConfirm('Delete all '+(WORK.posts||[]).length+' blog posts?'+(nLive?(' The '+nLive+' on the website come off straight away.'+pendingEditsNote()):''),{title:'Delete all posts?',okLabel:'Delete all',danger:true}).then(ok=>{ if(!ok)return;
          WORK.posts=[]; markDirty('posts:all'); API.setOverrides(WORK);
          if(nLive)doPublish('All posts deleted — and taken off the website')
            .catch(e=>toast('Deleted from your draft, but the website still shows them: '+e.message,'err'));
          else saveDraft('All posts removed'); });
      }},'Delete all')),
    row('Factory reset','Colors, text, images, layout, and hidden items all reset in one go. Blog posts are kept.',
      h('button',{class:'re-btn re-btn-danger re-btn-sm',onclick:()=>doReset('the whole design','Everything except your blog posts returns to the original website.',()=>{
        const posts=WORK.posts,v=WORK.version; WORK=blank(); WORK.posts=posts; WORK.version=v;
      })},'Factory reset'))));
}
function renderPostEditor(){
  const isNew=blogEditId==='new';
  const p=isNew?{id:'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),title:'',excerpt:'',body:'',cover:'',date:new Date().toISOString().slice(0,10),published:false}
    :(WORK.posts||[]).find(x=>x.id===blogEditId);
  if(!p){ blogEditId=null; renderPostList(); return; }
  dashMain.append(h('button',{class:'re-linkbtn',style:'margin-bottom:10px',onclick:()=>{ blogEditId=null; renderMain(); }},'← All posts'));
  dashMain.append(pageHead('Blogs',isNew?'New post':'Edit post',
    isNew?'Write it here — nothing is public until you publish.':'Changes stay in your draft until you publish.'));
  /* Where this post stands right now — stated, not toggled. The buttons at the
     bottom are what changes it, so there's only ever one way to publish. */
  const st=isNew?{label:'Draft',cls:'',hint:'Nothing is published until you press “Publish”.'}:postState(p);
  const wasOnSite=!isNew&&!!livePost(p.id)&&livePost(p.id).published!==false;
  dashMain.append(h('div',{class:'re-poststat'},
    h('span',{class:'re-badge '+st.cls},st.label),
    h('span',{class:'re-poststat-tx'},st.hint)));
  const title=h('input',{class:'re-input',value:p.title||'',placeholder:'e.g. KSE-100 outlook for Q3','aria-label':'Post title'});
  const date=h('input',{class:'re-input',type:'date',value:(p.date||'').slice(0,10),'aria-label':'Post date',style:'max-width:200px'});
  let coverUrl=p.cover||'';
  const coverImg=h('img',{class:'re-cover-thumb',src:coverUrl||'',alt:'',style:coverUrl?'':'display:none'});
  const coverInp=h('input',{type:'file',accept:'image/png,image/jpeg,image/webp',style:'display:none',onchange:e=>{
    const f=e.target.files[0]; if(!f)return;
    if(f.size>5e6){ toast('Max 5 MB','err'); return; }
    openImageEditor(f,file=>{
      toast('Uploading…');
      Store.uploadImage(file).then(u=>{ coverUrl=u; coverImg.src=u; coverImg.style.display=''; toast('Cover uploaded'); }).catch(x=>toast('Upload failed: '+x.message,'err'));
    },{aspect:16/9});
  }});
  const excerpt=h('textarea',{class:'re-input',rows:'2',placeholder:'One or two lines shown on the Blogs page…','aria-label':'Excerpt'},p.excerpt||'');
  const body=h('div',{class:'re-postbody',contenteditable:'true','aria-label':'Post body'});
  body.innerHTML=API.sanitizePost(p.body||'')||'<p><br></p>';
  const cmd=(c,v)=>{ body.focus(); document.execCommand(c,false,v||null); };
  const fmtRow=h('div',{class:'re-fmtrow'},
    h('button',{class:'re-fmtbtn',type:'button',title:'Heading',onmousedown:e=>{e.preventDefault();cmd('formatBlock','h2');}},'H2'),
    h('button',{class:'re-fmtbtn',type:'button',title:'Paragraph',onmousedown:e=>{e.preventDefault();cmd('formatBlock','p');}},'¶'),
    h('button',{class:'re-fmtbtn',type:'button',title:'Bold',onmousedown:e=>{e.preventDefault();cmd('bold');}},h('b',{},'B')),
    h('button',{class:'re-fmtbtn',type:'button',title:'Italic',onmousedown:e=>{e.preventDefault();cmd('italic');}},h('i',{},'I')),
    h('button',{class:'re-fmtbtn',type:'button',title:'Bullet list',onmousedown:e=>{e.preventDefault();cmd('insertUnorderedList');}},'• List'),
    h('button',{class:'re-fmtbtn',type:'button',title:'Link',onmousedown:e=>{ e.preventDefault(); const sel=window.getSelection(); const range=sel&&sel.rangeCount?sel.getRangeAt(0).cloneRange():null;
      rePrompt('',{title:'Add a link',placeholder:'https://…',okLabel:'Add link'}).then(u=>{ body.focus(); if(!u)return; if(range&&sel){sel.removeAllRanges();sel.addRange(range);} document.execCommand('createLink',false,u); }); }},icon('link',13)),
    h('button',{class:'re-fmtbtn',type:'button',title:'Insert image',onmousedown:e=>{ e.preventDefault(); bodyImgInp.click(); }},icon('image',13)));
  const bodyImgInp=h('input',{type:'file',accept:'image/png,image/jpeg,image/webp',style:'display:none',onchange:e=>{
    const f=e.target.files[0]; if(!f)return;
    if(f.size>5e6){ toast('Max 5 MB','err'); return; }
    openImageEditor(f,file=>{
      toast('Uploading…');
      Store.uploadImage(file).then(u=>{ body.focus(); document.execCommand('insertImage',false,u); toast('Image added'); }).catch(x=>toast('Upload failed: '+x.message,'err'));
    });
  }});
  /* One writer for the record; the caller decides whether it's a draft or goes live. */
  const collect=pub=>{
    if(!title.value.trim()){ toast('Give the post a title','err'); title.focus(); return null; }
    const rec={id:p.id,title:title.value.trim(),date:date.value||p.date,cover:coverUrl,excerpt:excerpt.value.trim(),body:API.sanitizePost(body.innerHTML),published:pub};
    const i=(WORK.posts||[]).findIndex(x=>x.id===p.id);
    if(i<0)WORK.posts.push(rec); else WORK.posts[i]=rec;
    markDirty('posts:'+p.id);
    API.setOverrides(WORK);
    return rec;
  };
  const busy=(b,txt)=>{ b.disabled=true; b._t=b.textContent; b.textContent=txt; };
  const idle=b=>{ b.disabled=false; if(b._t)b.textContent=b._t; };
  /* Save only — stays private. Writes straight to the stored draft so a closed tab
     can never lose the post. Saving a live post keeps it live (the website simply
     keeps serving the older copy) — “Unpublish” is the only way to take it down. */
  const saveBtn=h('button',{class:'re-btn re-btn-ghost',onclick:()=>{
    if(!collect(wasOnSite))return;
    busy(saveBtn,'Saving…');
    saveDraft(wasOnSite?'Saved — the website still shows the published version'
                       :'Draft saved — only you can see it').then(ok=>{
      idle(saveBtn); if(ok){ blogEditId=null; renderMain(); }
    });
  }},wasOnSite?'Save without publishing':'Save as draft');
  /* Publish — saves AND puts it on the website. The one button that "publishes". */
  const pubBtn=h('button',{class:'re-btn re-btn-gd',onclick:()=>{
    if(!collect(true))return;
    reConfirm('“'+title.value.trim()+'” goes on the website’s Blogs page for everyone to read.'+otherPending(p.id),
      {title:wasOnSite?'Publish your edits?':'Publish this post?',okLabel:'Publish'}).then(ok=>{
        if(!ok)return;
        busy(pubBtn,'Publishing…');
        blogEditId=null;
        doPublish(wasOnSite?'Updated — your edits are live':'Published — the post is on the website now')
          .catch(e=>{ toast('Publish failed: '+e.message,'err'); blogEditId=p.id; })
          .then(()=>{ idle(pubBtn); renderMain(); });
      });
  }},wasOnSite?'Publish edits':'Publish');
  /* Take a live post down — needs a publish to reach the website, so do both here. */
  const unpubBtn=wasOnSite?h('button',{class:'re-btn re-btn-ghost',onclick:()=>{
    reConfirm('Readers will no longer see “'+(p.title||'Untitled')+'” on the website. It stays here as a draft.'+otherPending(p.id),
      {title:'Take it off the website?',okLabel:'Unpublish'}).then(ok=>{
        if(!ok)return;
        if(!collect(false))return;
        busy(unpubBtn,'Removing…');
        blogEditId=null;
        doPublish('Removed from the website — kept here as a draft')
          .catch(e=>{ toast('Could not update the website: '+e.message,'err'); blogEditId=p.id; })
          .then(()=>{ idle(unpubBtn); renderMain(); });
      });
  }},'Unpublish'):'';
  dashMain.append(h('div',{class:'re-card re-post-form'},
    h('div',{class:'re-field'},h('label',{},'Title'),title),
    h('div',{class:'re-post-cols'},
      h('div',{class:'re-field'},h('label',{},'Date'),date)),
    h('div',{class:'re-field'},h('label',{},'Cover image'),
      h('div',{class:'re-cover-wrap'},coverImg,coverInp,
        h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>coverInp.click()},icon('upload',14),coverUrl?'Replace':'Upload'),
        coverUrl?h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{ coverUrl=''; coverImg.style.display='none'; }},'Remove'):'')),
    h('div',{class:'re-field'},h('label',{},'Excerpt'),excerpt),
    h('div',{class:'re-field'},h('label',{},'Body'),fmtRow,body,bodyImgInp),
    h('div',{class:'re-post-acts'},
      h('button',{class:'re-btn re-btn-ghost',onclick:()=>{ blogEditId=null; renderMain(); }},'Cancel'),
      h('span',{class:'re-spacer'}),
      unpubBtn, saveBtn, pubBtn)));
}

/* ════════ SITE EDITOR (the live site + one toolbar) ════════ */
let bar,barEls={};
function buildBar(){
  if(bar){ bar.style.display='flex'; return; }
  const tool=(ic,lbl,fn)=>h('button',{class:'re-tool',type:'button',onclick:fn,'aria-label':lbl,title:lbl},icon(ic,16),h('span',{class:'re-tool-lbl'},lbl));
  barEls.editSw=h('button',{class:'re-toggle',type:'button','aria-pressed':'false',onclick:()=>setEditing(!editing)},h('span',{class:'re-switch'}),h('span',{class:'re-toggle-lbl'},'Edit mode'));
  barEls.preview=tool('eye','Preview',togglePreview);
  barEls.chip=h('span',{class:'re-count'});
  barEls.discard=h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:discardAll},'Discard');
  barEls.save=h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{
    const restore=btnBusy(barEls.save,'Saving…');
    saveDraft().then(()=>{ restore(); updateSaveBar(); });   // updateSaveBar re-settles the disabled state
  }},'Save draft');
  barEls.publish=h('button',{class:'re-btn re-btn-gd re-btn-sm',onclick:publish},'Publish');
  bar=h('div',{class:'re-bar re-ui'},
    tool('back','Dashboard',exitStudio),
    h('span',{class:'re-bar-div'}),
    barEls.editSw,
    tool('image','Photos',openPhotos),
    tool('palette','Theme',openColors),
    tool('sliders','Site',openSite),
    barEls.preview,
    h('span',{class:'re-spacer'}),
    barEls.chip, barEls.discard, barEls.save, barEls.publish);
  document.body.append(bar);
}
/* The studio isn't a separate URL (both surfaces live at /admin), but the browser's
   Back button should still leave it — so opening it pushes one history entry that
   exiting consumes. The URL never changes; only the entry does. */
let studioHist=false;
function enterStudio(opts){
  opts=opts||{};
  closeDashboard();
  buildBar();
  document.body.classList.add('re-on');
  document.body.classList.remove('re-preview');
  if(barEls.preview)barEls.preview.classList.remove('on');
  setEditing(opts.edit!==false);
  closePanels();
  if(opts.panel==='photos')openPhotos();
  if(opts.panel==='theme')openColors();
  if(opts.panel==='site')openSite();
  updateSaveBar();
  maybeCoach();
  if(!studioHist){ try{ history.pushState({reStudio:1},''); studioHist=true; }catch(e){} }
}
/* Tear the studio down and show the dashboard. Never let a failing step here strand
   the visitor on the bare site — the dashboard must come back no matter what. */
function closeStudio(){
  try{
    setEditing(false);
    document.body.classList.remove('re-on','re-preview');
    closePanels(); hideFmtBar(); clearImgBtn();
    if(bar)bar.style.display='none';
    clearElBar(); endElDrag();
  }catch(e){ console.warn('[editor] studio teardown',e); }
  if(dirty.size)toast(dirty.size+' unsaved change'+(dirty.size===1?'':'s')+' kept — publish or discard anytime');
  openDashboard();
}
function exitStudio(){
  closeStudio();
  if(studioHist){ studioHist=false; try{ history.back(); }catch(e){} }  // drop our history entry
}
/* Browser Back while the studio is open → back to the dashboard, not off the page. */
window.addEventListener('popstate',()=>{ studioHist=false; if(document.body.classList.contains('re-on'))closeStudio(); });
function closePanels(){ [photosPanel,colorPanel,sitePanel].forEach(p=>p&&p.classList.remove('open')); }
function setEditing(v){
  editing=v;
  document.body.classList.toggle('re-editing',v);
  if(barEls.editSw){ barEls.editSw.classList.toggle('on',v); barEls.editSw.setAttribute('aria-pressed',v?'true':'false'); }
  if(!v){ clearImgBtn(); clearHoverText(); hideFmtBar(); clearElBar(); }
}
function togglePreview(){
  const on=document.body.classList.toggle('re-preview');
  barEls.preview.classList.toggle('on',on);
  if(on){ clearImgBtn(); clearHoverText(); hideFmtBar(); }
  toast(on?'Previewing as a visitor':'Back to editing view');
}
/* first-run coach, shown once when the studio opens */
function maybeCoach(){ if(localStorage.getItem('re-coached'))return; localStorage.setItem('re-coached','1');
  const c=h('div',{class:'re-coach re-ui',html:'<b>Welcome to your editor</b><br>• Flip <b>Edit mode</b> on, then click any highlighted text.<br>• <b>Photos</b> swaps images; <b>Theme</b> recolors the site.<br>• <b>Save draft</b> keeps changes private — <b>Publish</b> makes them live.'});
  c.append(h('button',{class:'re-btn re-btn-pri re-btn-sm',onclick:()=>c.remove()},'Got it'));
  document.body.append(c);
}
/* After an invitee sets their password: drop them straight into editing with a short how-to. */
function welcomeGuide(){
  localStorage.setItem('re-coached','1');
  enterStudio({edit:true});
  const c=h('div',{class:'re-coach re-ui',html:'<b>You’re all set!</b><br>• <b>Click any highlighted text</b> to change it.<br>• Use <b>Photos</b> in the toolbar to swap an image.<br>• Hit <b>Publish</b> when you’re ready to go live.'});
  c.append(h('button',{class:'re-btn re-btn-pri re-btn-sm',onclick:()=>c.remove()},'Start editing'));
  document.body.append(c);
}

/* ════════ PASSWORD STRENGTH ════════ */
/* Four plain checks the user can see themselves passing. Only the length is a hard
   requirement — the rest are guidance, so the meter never blocks a determined user
   with a rule they can't discover. */
const PW_CHECKS=[
  {label:'8 characters or more',test:v=>v.length>=8},
  {label:'Upper and lower case',test:v=>/[a-z]/.test(v)&&/[A-Z]/.test(v)},
  {label:'At least one number',test:v=>/\d/.test(v)},
  {label:'A symbol, like ! ? or @',test:v=>/[^A-Za-z0-9]/.test(v)}
];
const PW_WEAK=/^(password|passw0rd|12345678|123456789|qwerty123|letmein|welcome1|iloveyou|rallys123|admin123)$/i;
function pwScore(v){
  if(!v)return 0;
  let s=PW_CHECKS.filter(c=>c.test(v)).length;
  if(v.length>=14)s++;                      // length beats character-class tricks
  if(v.length<8||PW_WEAK.test(v))s=Math.min(s,1);
  return Math.max(0,Math.min(4,s));
}
const PW_LABEL=['','Too weak','Weak','Good','Strong'];
/* A meter + live checklist bound to one input. */
function pwMeter(input){
  const bars=[0,1,2,3].map(()=>h('div',{class:'re-pwbar'}));
  const lbl=h('div',{class:'re-pwlbl'},'Use at least 8 characters.');
  const items=PW_CHECKS.map(c=>h('li',{class:'re-req'},icon('check',12),h('span',{},c.label)));
  const node=h('div',{class:'re-pwmeter'},h('div',{class:'re-pwbars','aria-hidden':'true'},...bars),
    lbl,h('ul',{class:'re-reqs'},...items));
  const update=()=>{
    const v=input.value||'';
    const s=v?Math.max(1,pwScore(v)):0;   // anything typed shows at least one (red) bar
    bars.forEach((b,i)=>{ b.className='re-pwbar'+(i<s?' on'+s:''); });
    lbl.textContent=v?('Strength: '+PW_LABEL[s]):'Use at least 8 characters.';
    items.forEach((li,i)=>li.classList.toggle('ok',PW_CHECKS[i].test(v)));
  };
  input.addEventListener('input',update); update();
  return node;
}

/* ════════ CHANGE PASSWORD (modal) — `welcome`=first-time invitee ════════ */
/* Two shapes, one flow:
   · welcome — the invitee has no password yet, so there's nothing to verify.
   · normal  — Supabase would happily change the password of whoever is sitting at
     the machine, so we re-authenticate with the current password first. */
function openChangePassword(welcome){
  const err=h('div',{class:'re-err',role:'alert'});
  const cur=h('input',{class:'re-input',type:'password',placeholder:'Your current password',autocomplete:'current-password'});
  const p1=h('input',{class:'re-input',type:'password',placeholder:'At least 8 characters',autocomplete:'new-password'});
  const p2=h('input',{class:'re-input',type:'password',placeholder:'Type it again',autocomplete:'new-password'});
  const label=welcome?'Create my account':'Update password';
  const okBtn=h('button',{class:'re-btn re-btn-pri',onclick:()=>submit()},label);
  const foot=[okBtn];
  if(!welcome)foot.unshift(h('button',{class:'re-btn re-btn-ghost',onclick:()=>m.close()},'Cancel'));
  const body=[];
  if(welcome)body.push(h('div',{class:'re-modal-note'},icon('shield',15),
    h('span',{},'This password is yours alone — nobody at Rallys Equities can see it. You can change it later from Profile.')));
  else body.push(h('div',{class:'re-field'},h('label',{},'Current password'),pwWrap(cur)));
  body.push(h('div',{class:'re-field'},h('label',{},welcome?'Create a password':'New password'),pwWrap(p1),pwMeter(p1)));
  body.push(h('div',{class:'re-field'},h('label',{},'Confirm password'),pwWrap(p2)));
  body.push(err);
  const m=reModal({
    title:welcome?'Welcome to Rallys Equities':'Change your password',
    desc:welcome?'You’ve been invited to help manage the website. Pick a password and you’re in.'
                :'You’ll use the new password the next time you sign in.',
    body, foot, cls:'re-pwmodal', dismissible:!welcome, noX:welcome});
  let restore=null;
  const busy=on=>{ if(on)restore=btnBusy(okBtn,welcome?'Setting up…':'Saving…'); else if(restore){ restore(); restore=null; } };
  function submit(){
    err.textContent='';
    const a=p1.value||'', b=p2.value||'', c=cur.value||'';
    if(!welcome&&!c){ err.textContent='Enter your current password.'; cur.focus(); return; }
    if(a.length<8){ err.textContent='Please use at least 8 characters.'; p1.focus(); return; }
    if(PW_WEAK.test(a)){ err.textContent='That password is too easy to guess — try something else.'; p1.focus(); return; }
    if(a!==b){ err.textContent='The two passwords don’t match.'; p2.focus(); return; }
    if(!welcome&&a===c){ err.textContent='That’s your current password — pick a different one.'; p1.focus(); return; }
    busy(true);
    const verify=welcome?Promise.resolve(true):Promise.resolve(Store.verifyPassword(c));
    verify.then(()=>Store.changePassword(a)).then(()=>{
      m.close();
      if(welcome){ try{history.replaceState(null,'',location.pathname);}catch(e){} if(Store.markInviteAccepted)Promise.resolve(Store.markInviteAccepted()).catch(()=>{}); welcomeGuide(); }
      else toast('Password updated — use it next time you sign in.');
    }).catch(e=>{ err.textContent=(e&&e.message)||'Could not set your password.'; busy(false); });
  }
  [cur,p1,p2].forEach(i=>i.addEventListener('keydown',e=>{ if(e.key==='Enter')submit(); }));
  setTimeout(()=>(welcome?p1:cur).focus(),50);
}

/* ════════ TEXT EDITING (in-place) ════════ */
/* A text "leaf": contains text, no nested block elements (only inline formatting), no controls/media */
const INLINE=/^(SPAN|EM|STRONG|B|I|A|BR|SUP|SUB|U|SMALL|MARK|WBR|ABBR)$/;
function isTextLeaf(n){
  if(!n||n.nodeType!==1)return false;
  if(/^(INPUT|SELECT|TEXTAREA|SVG|CANVAS|IMG|VIDEO|UL|OL|HR|TABLE|TR|THEAD|TBODY)$/.test(n.tagName))return false;
  if(n.querySelector('input,select,textarea,svg,canvas,img,video'))return false;
  if(!n.textContent.trim())return false;
  if([...n.children].some(c=>!INLINE.test(c.tagName)))return false; // has a block child → not a leaf
  return true;
}
function eligibleText(el){
  if(!el)return null;
  const free=el.closest&&el.closest('[data-edit-free]'); if(free)return free;   // whitelisted labels inside locked widgets
  if(el.closest(LOCKED))return null;
  const tagged=el.closest('[data-edit]'); if(tagged&&!tagged.closest(LOCKED))return tagged;
  let n=el;
  while(n&&n!==document.body){ if(n.closest&&n.closest(LOCKED))return null; if(isTextLeaf(n))return n; n=n.parentElement; }
  return null;
}
document.addEventListener('click',e=>{
  if(!editing||document.body.classList.contains('re-preview'))return;
  if(e.target.closest('.re-ui,.re-fmt,.re-img-btn,.re-panel,.re-overlay,.re-bar'))return;
  const t=eligibleText(e.target);
  if(!t)return;
  if(t.getAttribute('contenteditable')==='true')return;
  e.preventDefault();e.stopPropagation();
  startTextEdit(t);
},true);

let fmtBar;
function startTextEdit(el){
  const key=el.dataset.edit||API.getEditKey(el);
  if(!el.dataset.edit)el.dataset.edit=key;
  const before=el.innerHTML;
  el.setAttribute('contenteditable','true');
  el.classList.add('vis'); // ensure revealed
  el.focus();
  showFmtBar(el);
  const finish=()=>{
    el.removeAttribute('contenteditable');
    hideFmtBar();
    const after=API.sanitizeFragment(el.innerHTML);
    el.innerHTML=after;
    if(after!==API.sanitizeFragment(before)){
      undo.push({kind:'text',key,prev:WORK.text[key]});
      WORK.text[key]=after; el.classList.add('re-dirty'); markDirty('text:'+key);
    }
    el.removeEventListener('blur',finish);
  };
  el.addEventListener('blur',finish);
  el.addEventListener('keydown',ev=>{ if(ev.key==='Escape'){el.innerHTML=before;el.blur();} });
}
function showFmtBar(el){
  hideFmtBar();
  const cmd=c=>{document.execCommand(c,false);el.focus();};
  const fbtn=(label,kids,fn)=>h('button',{type:'button','aria-label':label,title:label,onmousedown:e=>{e.preventDefault();fn();}},kids);
  fmtBar=h('div',{class:'re-fmt re-ui'},
    fbtn('Bold',h('b',{},'B'),()=>cmd('bold')),
    fbtn('Italic',h('i',{},'I'),()=>cmd('italic')),
    fbtn('Underline',h('u',{},'U'),()=>cmd('underline')),
    fbtn('Add link',icon('link',14),()=>{ const sel=window.getSelection(); const range=sel&&sel.rangeCount?sel.getRangeAt(0).cloneRange():null; rePrompt('',{title:'Add a link',placeholder:'https://…',okLabel:'Add link'}).then(u=>{ el.focus(); if(!u)return; if(range&&sel){sel.removeAllRanges();sel.addRange(range);} document.execCommand('createLink',false,u); }); }),
    fbtn('Clear formatting',icon('eraser',14),()=>{document.execCommand('removeFormat',false);document.execCommand('unlink',false);el.focus();}));
  document.body.append(fmtBar);
  const r=el.getBoundingClientRect();
  fmtBar.style.left=Math.max(8,r.left)+'px';
  fmtBar.style.top=Math.max(60,r.top+window.scrollY-40)+'px';
}
function hideFmtBar(){ if(fmtBar){fmtBar.remove();fmtBar=null;} }

/* ════════ IMAGES ════════ */
let imgBtn,imgHoverEl;
document.addEventListener('mousemove',e=>{
  if(!editing||document.body.classList.contains('re-preview'))return;
  const img=e.target.closest('img');                 // ANY image is replaceable
  if(img&&!img.closest(LOCKED)&&!img.closest('.re-ui')){ if(img!==imgHoverEl){imgHoverEl=img;positionImgBtn(img);} }
  else if(!img&&imgHoverEl&&!e.target.closest('.re-img-btn')){ clearImgBtn(); }
});
function positionImgBtn(img){
  if(!imgBtn){imgBtn=h('button',{class:'re-img-btn re-ui',type:'button',onclick:()=>openMedia(imgHoverEl)},icon('image',14),'Change image');document.body.append(imgBtn);}
  const r=img.getBoundingClientRect();
  imgBtn.style.left=(r.left+r.width/2)+'px';
  imgBtn.style.top=(r.top+window.scrollY+r.height/2)+'px';
  imgBtn.style.display='inline-flex';
}
function clearImgBtn(){ if(imgBtn)imgBtn.style.display='none'; imgHoverEl=null; }

/* live "this text is editable" highlight while hovering in edit mode */
let hoverText;
function clearHoverText(){ if(hoverText){hoverText.classList.remove('re-hoverable');hoverText=null;} }
document.addEventListener('mousemove',e=>{
  if(!editing||document.body.classList.contains('re-preview')){ clearHoverText(); return; }
  if(e.target.closest('.re-ui,.re-bar,.re-panel,.re-fmt,.re-img-btn,.re-overlay,.re-coach')){ clearHoverText(); return; }
  const t=eligibleText(e.target);
  if(t!==hoverText){ clearHoverText(); if(t&&t.getAttribute('contenteditable')!=='true'){ hoverText=t; t.classList.add('re-hoverable'); } }
});

/* ════════ CUSTOMIZE: hover toolbar (drag · parent · hide), reorder, image drag ════════ */
/* Curated widgets: their data stays locked, but the whole block can be hidden or moved. */
const WIDGETS=[['.ticker','Ticker tape'],['.pcard','Live market panel'],['#perfGrid','Performance snapshot'],['.live-badge','PSX Live badge'],['.wa-fab','WhatsApp button']];
/* Every piece of the live market panel, individually toggleable (data itself stays locked) */
const PCARD_PARTS=[
  ['sel:.pcard .pstatus','Status bar (Simulated · clock)'],
  ['sel:.pcard .pidxl','Index name'],
  ['sel:.pcard .pidxv','Index value (big price)'],
  ['sel:.pcard .pidxc','Change line (▲ +1.06%)'],
  ['sel:.pcard .pctx','Period caption (e.g. “Past week”)'],
  ['sel:.pcard .pvol','Volume line'],
  ['sel:.pcard .ptabs','Range tabs (1D · 1W · 1M · YTD)'],
  ['sel:.pcard .cw','Chart'],
  ['sel:.pcard .clbl','Chart time labels'],
  ['sel:.pcard .shdr','Company table header'],
  ['sel:#heroStocks','Company list'],
  ['sel:#heroStocks .slogo','Company logos'],
  ['sel:#heroStocks .sprice, .pcard .sh-price','Prices (column)'],
  ['sel:#heroStocks .schg, .pcard .sh-chg','Change values (column)'],
  ['sel:#heroStocks .spct, .pcard .sh-pct','Percent pills (column)'],
  ['sel:.pcard .idxrow','Indices strip (KSE-30 · KMI-30 · ALLSHR)'],
];
function widgetRoot(el){ for(const [sel] of WIDGETS){ const w=el.closest&&el.closest(sel); if(w)return w; } return null; }
function keyFor(el){ for(const [sel] of WIDGETS){ if(el.matches(sel))return 'sel:'+sel; } if(el.id&&el.id.indexOf('page-')===0)return 'page:'+el.id.slice(5); return API.getEditKey(el); }
function labelFor(el){
  for(const [sel,name] of WIDGETS){ if(el.matches(sel))return name; }
  if(el.tagName==='IMG')return 'Image — '+(((el.getAttribute('alt')||el.getAttribute('src')||'photo').split('/').pop())||'photo').slice(0,40);
  const t=(el.textContent||'').trim().replace(/\s+/g,' ');
  return '<'+el.tagName.toLowerCase()+'>'+(t?' '+t.slice(0,46):'');
}
function blockTarget(t){
  if(!t||t.nodeType!==1)return null;
  if(t.closest('.re-ui,.re-fmt,.re-img-btn,.re-elbar,.re-bar,.re-panel,.re-overlay,.re-coach,.re-toast'))return null;
  const w=widgetRoot(t); if(w)return w;
  if(t.closest(LOCKED))return null;
  const el=t.closest('p,h1,h2,h3,h4,h5,h6,img,figure,li,ul,ol,table,blockquote,section,article,a,button,div,span');
  if(!el||el===document.body||el===document.documentElement||el.classList.contains('page'))return null;
  return el;
}
let elBar,elTarget,dragEl=null,dropParent=null,dropRef=null,dropLine=null,swapSrcImg=null;
function ensureElBar(){
  if(elBar)return;
  const grip=h('button',{class:'re-elbar-btn re-elbar-grip',type:'button','aria-label':'Drag to reorder',title:'Drag to move within its area'},icon('grip',14));
  grip.addEventListener('mousedown',e=>{ if(!elTarget)return; e.preventDefault(); e.stopPropagation(); startElDrag(elTarget); });
  elBar=h('div',{class:'re-elbar re-ui'},grip,
    h('button',{class:'re-elbar-btn',type:'button','aria-label':'Select parent block',title:'Select the parent block',onclick:()=>{ const p=elTarget&&elTarget.parentElement; if(p&&p!==document.body&&!p.classList.contains('page')&&!p.closest('.re-ui'))setElTarget(p); }},icon('up',14)),
    h('button',{class:'re-elbar-btn re-elbar-del',type:'button','aria-label':'Hide element',title:'Hide (restore from Site → Hidden elements)',onclick:()=>hideElement(elTarget)},icon('trash',14)));
  document.body.append(elBar);
}
function setElTarget(el){
  if(elTarget)elTarget.classList.remove('re-elsel');
  elTarget=el;
  if(!el){ if(elBar)elBar.style.display='none'; return; }
  ensureElBar();
  el.classList.add('re-elsel');
  const r=el.getBoundingClientRect();
  elBar.style.display='flex';
  elBar.style.left=Math.max(8,Math.min(window.innerWidth-110,r.right-100))+'px';
  elBar.style.top=Math.max(60,r.top+window.scrollY-30)+'px';
}
function clearElBar(){ setElTarget(null); }
document.addEventListener('mousemove',e=>{
  if(!editing||document.body.classList.contains('re-preview')||dragEl){ if(!dragEl&&elTarget)clearElBar(); return; }
  if(e.target.closest&&e.target.closest('.re-elbar'))return;   // keep it while reaching for its buttons
  const t=blockTarget(e.target);
  if(t!==elTarget)setElTarget(t);
});
function hideElement(el){
  if(!el)return;
  const key=keyFor(el);
  WORK.hidden[key]=labelFor(el);
  API.applyHidden(WORK.hidden);
  undo.push({kind:'hidden',key});
  markDirty('hidden:'+key);
  clearElBar();
  if(sitePanel&&sitePanel.classList.contains('open'))renderSite();
  toast('Hidden — restore it in Site → Hidden elements, or Ctrl+Z');
}
/* sibling reorder — pointer-based (native HTML5 DnD on a <button> is unreliable) */
let dropValid=false;
function ensureDropLine(){ if(!dropLine){ dropLine=h('div',{class:'re-dropline re-ui'}); document.body.append(dropLine); } }
function hideDropLine(){ if(dropLine)dropLine.style.display='none'; }
function startElDrag(el){
  dragEl=el; dropParent=el.parentElement; dropRef=null; dropValid=false;
  const pk=keyFor(dropParent); if(pk.indexOf('page:')!==0&&!dropParent.dataset.rekey)dropParent.dataset.rekey=pk;
  API.sigStampKids(dropParent);
  dragEl.classList.add('re-dragging');
  document.body.classList.add('re-dragging-active');
  if(elBar)elBar.style.display='none';
}
function positionDrop(x,y){
  const wasHidden=dragEl.style.pointerEvents; dragEl.style.pointerEvents='none';   // so elementFromPoint sees what's under, not the dragged block
  const under=document.elementFromPoint(x,y);
  dragEl.style.pointerEvents=wasHidden;
  let sib=under;
  while(sib&&sib.parentElement!==dropParent)sib=sib.parentElement;
  if(!sib||sib===dragEl){ hideDropLine(); return; }
  const st=getComputedStyle(dropParent);
  const horiz=(st.display.indexOf('flex')>-1&&st.flexDirection.indexOf('row')===0)||(st.display.indexOf('grid')>-1&&st.gridTemplateColumns.split(' ').length>1);
  const r=sib.getBoundingClientRect();
  const before=horiz?(x<r.left+r.width/2):(y<r.top+r.height/2);
  dropRef=before?sib:sib.nextElementSibling; dropValid=true;
  ensureDropLine(); dropLine.style.display='block';
  if(horiz){ dropLine.style.width='3px'; dropLine.style.height=r.height+'px'; dropLine.style.left=(before?r.left-2:r.right-1)+'px'; dropLine.style.top=(r.top+window.scrollY)+'px'; }
  else{ dropLine.style.height='3px'; dropLine.style.width=r.width+'px'; dropLine.style.left=r.left+'px'; dropLine.style.top=((before?r.top:r.bottom)+window.scrollY-1)+'px'; }
}
function endElDrag(){
  if(dragEl)dragEl.classList.remove('re-dragging');
  document.body.classList.remove('re-dragging-active');
  hideDropLine();
  dragEl=null; dropParent=null; dropRef=null; dropValid=false;
  if(elTarget){ elTarget.classList.remove('re-elsel'); elTarget=null; }  // let the hover toolbar re-show on the next move
}
function commitElDrag(){
  if(dragEl&&dropParent&&dropValid&&dropRef!==dragEl){
    const prevList=[...dropParent.children].map(c=>c.dataset.rekey).filter(Boolean);
    dropParent.insertBefore(dragEl,(dropRef&&dropRef.parentElement===dropParent)?dropRef:null);
    const cur=[...dropParent.children].map(c=>c.dataset.rekey).filter(Boolean);
    if(cur.join('|')!==prevList.join('|')){
      const pkey=keyFor(dropParent);
      const prevSaved=WORK.order[pkey]||null;
      WORK.order[pkey]=cur;
      undo.push({kind:'order',key:pkey,prevSaved,prevList});
      markDirty('order:'+pkey);
      toast('Moved — publish to make it permanent');
    }
  }
  endElDrag();
}
document.addEventListener('mousemove',e=>{ if(dragEl&&dropParent){ e.preventDefault(); positionDrop(e.clientX,e.clientY); } });
document.addEventListener('mouseup',()=>{ if(dragEl)commitElDrag(); });
window.addEventListener('blur',()=>{ if(dragEl)endElDrag(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&dragEl){ e.preventDefault(); endElDrag(); } });

/* image swap / OS file-drop — kept on native DnD (file drops require it) */
document.addEventListener('dragover',e=>{
  if(!editing)return;
  const overImg=e.target.closest&&e.target.closest('img');
  const files=e.dataTransfer&&[...(e.dataTransfer.types||[])].indexOf('Files')>-1;
  document.querySelectorAll('img.re-droptgt').forEach(i=>i.classList.remove('re-droptgt'));
  if(overImg&&!overImg.closest('.re-ui')&&!overImg.closest(LOCKED)&&(swapSrcImg||files)&&overImg!==swapSrcImg){
    overImg.classList.add('re-droptgt');
    e.preventDefault(); e.dataTransfer.dropEffect=files?'copy':'move';
  }
});
document.addEventListener('drop',e=>{
  if(!editing)return;
  const overImg=e.target.closest&&e.target.closest('img');
  document.querySelectorAll('img.re-droptgt').forEach(i=>i.classList.remove('re-droptgt'));
  if(overImg&&!overImg.closest('.re-ui')&&!overImg.closest(LOCKED)){
    const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
    if(f){ e.preventDefault(); replaceImageFile(overImg,f); swapSrcImg=null; return; }
    if(swapSrcImg&&swapSrcImg!==overImg){ e.preventDefault(); swapImages(swapSrcImg,overImg); swapSrcImg=null; return; }
  }
  swapSrcImg=null;
});
document.addEventListener('dragstart',e=>{
  if(!editing||dragEl)return;
  const img=e.target.closest&&e.target.closest('img');
  if(!img||img.closest('.re-ui')||img.closest(LOCKED))return;
  swapSrcImg=img;                                   // native image drag → swap mode
  e.dataTransfer.effectAllowed='move';
  try{ e.dataTransfer.setData('text/re-img','1'); }catch(_){}
});
document.addEventListener('dragend',()=>{ swapSrcImg=null; document.querySelectorAll('img.re-droptgt').forEach(i=>i.classList.remove('re-droptgt')); });
function imgKeyOf(img){ const k=img.dataset.editImg||API.getEditKey(img); if(!img.dataset.editImg)img.dataset.editImg=k; return k; }
function swapImages(a,b){
  const ka=imgKeyOf(a),kb=imgKeyOf(b);
  const sa=a.getAttribute('src'),sb=b.getAttribute('src');
  undo.push({kind:'imgswap',a:ka,b:kb,prevA:WORK.img[ka],prevB:WORK.img[kb],elA:a,elB:b,sa,sb});
  WORK.img[ka]=sb; WORK.img[kb]=sa;
  a.src=sb; b.src=sa;
  a.classList.add('re-dirty'); b.classList.add('re-dirty');
  markDirty('img:'+ka); markDirty('img:'+kb);
  toast('Images swapped');
}
function replaceImageFile(img,f){
  if(!/^image\/(png|jpeg|webp)$/.test(f.type)){ toast('Use a PNG, JPG or WEBP image','err'); return; }
  if(f.size>5e6){ toast('Max 5 MB','err'); return; }
  openImageEditor(f,file=>{
    toast('Uploading…');
    Store.uploadImage(file).then(url=>{
      const k=imgKeyOf(img);
      undo.push({kind:'img',key:k,prev:WORK.img[k]});
      WORK.img[k]=url; img.src=url; img.classList.add('re-dirty');
      markDirty('img:'+k); toast('Image updated');
    }).catch(err=>toast('Upload failed: '+err.message,'err'));
  });
}

/* ════════ SITE PANEL — widget toggles · pages on/off · hidden elements ════════ */
let sitePanel;
function openSite(){
  if(!sitePanel)sitePanel=makePanel('re-site','sliders','Site');
  sitePanel.classList.add('open'); renderSite();
}
function renderSite(){
  const b=sitePanel._body; b.innerHTML='';
  const setHidden=(key,label,hide)=>{ if(hide)WORK.hidden[key]=label; else delete WORK.hidden[key]; API.applyHidden(WORK.hidden); markDirty('hidden:'+key); renderSite(); };
  const sw=(label,on,onch,lock)=>{
    const t=h('button',{class:'re-toggle re-siterow'+(on?' on':''),type:'button','aria-pressed':String(on),onclick:()=>{ if(!lock)onch(!on); }},
      h('span',{class:'re-siterow-lbl'},label),h('span',{class:'re-switch'}));
    if(lock){ t.disabled=true; t.classList.add('re-lockrow'); t.title='The home page can’t be removed'; }
    return t;
  };
  b.append(h('p',{class:'re-panel-hint'},'Show or hide parts of the website. Hidden things aren’t deleted — flip them back on any time.'));
  b.append(h('div',{class:'re-group'},h('div',{class:'re-group-h'},'Live market widgets'),
    ...WIDGETS.map(([sel,name])=>sw(name,!WORK.hidden['sel:'+sel],on=>setHidden('sel:'+sel,name,!on)))));
  if(!WORK.hidden['sel:.pcard'])
    b.append(h('div',{class:'re-group'},h('div',{class:'re-group-h'},'Market panel — details'),
      h('p',{class:'re-panel-hint'},'Fine-tune what the live market panel shows. The data itself stays live.'),
      ...PCARD_PARTS.map(([key,name])=>sw(name,!WORK.hidden[key],on=>setHidden(key,'Market panel — '+name,!on)))));
  const pgName=id=>{
    if(id==='home')return 'Home';
    const links=[...document.querySelectorAll('[onclick*="showPage(\''+id+'\')"]')];
    // top-level nav items open their first child page, so prefer the dropdown entry's own label
    const a=links.find(x=>x.closest('.dd'))||links.find(x=>x.closest('.nav-links'))||links.find(x=>x.closest('footer'))||links.find(x=>x.closest('.mnav'))||links[0];
    const t=a&&a.textContent.trim().replace(/\s+/g,' ');
    if(t)return t.slice(0,34);
    const hd=document.querySelector('#page-'+id+' h1');
    return (hd&&hd.textContent.trim().replace(/\s+/g,' ').slice(0,34))||id;
  };
  const pages=[...document.querySelectorAll('.page')].map(p=>p.id.replace('page-','')).filter(id=>id!=='post');
  b.append(h('div',{class:'re-group'},h('div',{class:'re-group-h'},'Pages'),
    ...pages.map(id=>sw(pgName(id),!WORK.hidden['page:'+id],on=>setHidden('page:'+id,'Page — '+pgName(id),!on),id==='home'))));
  const els=Object.keys(WORK.hidden).filter(k=>k.indexOf('sel:')!==0&&k.indexOf('page:')!==0);
  b.append(h('div',{class:'re-group'},h('div',{class:'re-group-h'},'Hidden elements'),
    els.length
      ?h('div',{},...els.map(k=>h('div',{class:'re-hidrow'},
          h('span',{class:'re-hidlbl',title:k},WORK.hidden[k]||k),
          h('button',{class:'re-inv-act',onclick:()=>{ delete WORK.hidden[k]; API.applyHidden(WORK.hidden); markDirty('hidden:'+k); renderSite(); toast('Restored'); }},icon('restore',12),'Restore'))))
      :h('p',{class:'re-panel-hint'},'Nothing hidden yet. In Edit mode, hover any element and use the trash button to hide it.')));
}

/* ════════ IMAGE EDITOR — crop · stretch · rotate/flip · filters ════════
   Runs before any image upload. src = File/Blob or a URL (same-origin or CORS-enabled).
   onDone receives the edited File. */
const CAN_FILTER=(()=>{ try{ const c=document.createElement('canvas').getContext('2d'); c.filter='blur(1px)'; return c.filter==='blur(1px)'; }catch(e){ return false; } })();
function openImageEditor(src,onDone,opts){
  opts=opts||{};
  const isBlob=(typeof Blob!=='undefined')&&(src instanceof Blob);
  const img=new Image();
  if(!isBlob)img.crossOrigin='anonymous';
  const objUrl=isBlob?URL.createObjectURL(src):null;
  const bail=()=>{ if(objUrl)URL.revokeObjectURL(objUrl);
    if(isBlob){ toast('Editor unavailable — using the original image'); onDone(src); }
    else toast('This image can’t be opened for editing','err'); };
  img.onload=()=>{ try{ build(); }catch(e){ console.warn('[image editor]',e); bail(); } };
  img.onerror=bail;
  img.src=objUrl||src;

  function build(){
    let rot=0,flip=false,bright=100,contrast=100,sat=100,preset='none',stretch=false,aspect=opts.aspect||null;
    let crop,dw,dh,drag=null,applyBtn;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const cv=h('canvas',{class:'re-imged-cv'}), ctx=cv.getContext('2d');
    const srcW=()=>rot%180?img.naturalHeight:img.naturalWidth;
    const srcH=()=>rot%180?img.naturalWidth:img.naturalHeight;
    function fit(){
      const maxW=Math.min(660,window.innerWidth-96), maxH=Math.min(380,Math.max(220,window.innerHeight-360));
      const s=Math.min(maxW/srcW(),maxH/srcH(),1);
      dw=Math.max(60,Math.round(srcW()*s)); dh=Math.max(60,Math.round(srcH()*s));
      cv.width=dw; cv.height=dh;
      setAspect(aspect);
    }
    function setAspect(a){
      aspect=a;
      if(!a)crop={x:0,y:0,w:dw,h:dh};
      else{ let w=dw,hh=w/a; if(hh>dh){ hh=dh; w=hh*a; } crop={x:(dw-w)/2,y:(dh-hh)/2,w,h:hh}; }
      drawAll(); renderControls();
    }
    function filterStr(){
      let f='brightness('+bright/100+') contrast('+contrast/100+') saturate('+sat/100+')';
      if(preset==='bw')f+=' grayscale(1)';
      if(preset==='sepia')f+=' sepia(.85)';
      if(preset==='vivid')f+=' saturate(1.35) contrast(1.08)';
      if(preset==='soft')f+=' brightness(1.05) contrast(.92) saturate(.92)';
      return f;
    }
    function paintImage(x,w,hh){
      x.save();
      if(CAN_FILTER)x.filter=filterStr();
      x.translate(w/2,hh/2);
      x.rotate(rot*Math.PI/180);
      if(flip)x.scale(-1,1);
      const iw=rot%180?hh:w, ih=rot%180?w:hh;
      x.drawImage(img,-iw/2,-ih/2,iw,ih);
      x.restore();
    }
    const handles=()=>[{x:crop.x,y:crop.y},{x:crop.x+crop.w,y:crop.y},{x:crop.x,y:crop.y+crop.h},{x:crop.x+crop.w,y:crop.y+crop.h}];
    function drawAll(){
      ctx.clearRect(0,0,dw,dh);
      paintImage(ctx,dw,dh);
      ctx.fillStyle='rgba(2,8,14,.58)';
      ctx.fillRect(0,0,dw,crop.y);
      ctx.fillRect(0,crop.y+crop.h,dw,dh-crop.y-crop.h);
      ctx.fillRect(0,crop.y,crop.x,crop.h);
      ctx.fillRect(crop.x+crop.w,crop.y,dw-crop.x-crop.w,crop.h);
      ctx.strokeStyle='#1ed49a'; ctx.lineWidth=1.5;
      ctx.strokeRect(crop.x+.75,crop.y+.75,crop.w-1.5,crop.h-1.5);
      ctx.strokeStyle='rgba(30,212,154,.35)'; ctx.lineWidth=1;
      for(let i=1;i<3;i++){ ctx.beginPath(); ctx.moveTo(crop.x+crop.w*i/3,crop.y); ctx.lineTo(crop.x+crop.w*i/3,crop.y+crop.h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(crop.x,crop.y+crop.h*i/3); ctx.lineTo(crop.x+crop.w,crop.y+crop.h*i/3); ctx.stroke(); }
      ctx.fillStyle='#1ed49a';
      handles().forEach(p=>ctx.fillRect(p.x-4,p.y-4,8,8));
    }
    const pos=e=>{ const r=cv.getBoundingClientRect(); return {x:(e.clientX-r.left)*(cv.width/r.width),y:(e.clientY-r.top)*(cv.height/r.height)}; };
    cv.addEventListener('mousedown',e=>{
      const p=pos(e); let hi=-1;
      handles().forEach((q,i)=>{ if(Math.abs(p.x-q.x)<11&&Math.abs(p.y-q.y)<11)hi=i; });
      if(hi>-1)drag={mode:'resize',corner:hi,c0:{...crop}};
      else if(p.x>crop.x&&p.x<crop.x+crop.w&&p.y>crop.y&&p.y<crop.y+crop.h)drag={mode:'move',start:p,c0:{...crop}};
      e.preventDefault();
    });
    function onMove(e){
      if(!drag)return;
      const p=pos(e);
      if(drag.mode==='move'){
        crop.x=clamp(drag.c0.x+(p.x-drag.start.x),0,dw-drag.c0.w);
        crop.y=clamp(drag.c0.y+(p.y-drag.start.y),0,dh-drag.c0.h);
      }else{
        const c0=drag.c0;
        const ax=(drag.corner===0||drag.corner===2)?c0.x+c0.w:c0.x;   // anchor = opposite corner
        const ay=(drag.corner<2)?c0.y+c0.h:c0.y;
        const nx=clamp(p.x,0,dw), ny=clamp(p.y,0,dh);
        let w=Math.max(24,Math.abs(nx-ax)), hh=Math.max(24,Math.abs(ny-ay));
        if(aspect){ hh=w/aspect; const maxH=(ny<ay)?ay:dh-ay; if(hh>maxH){ hh=maxH; w=hh*aspect; } }
        crop.x=(nx<ax)?ax-w:ax; crop.y=(ny<ay)?ay-hh:ay; crop.w=w; crop.h=hh;
        if(crop.x<0){ crop.w+=crop.x; crop.x=0; if(aspect)crop.h=crop.w/aspect; }
        if(crop.x+crop.w>dw){ crop.w=dw-crop.x; if(aspect)crop.h=crop.w/aspect; }
      }
      drawAll();
    }
    const onUp=()=>{ drag=null; };
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onUp);
    function cleanup(){ document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); if(objUrl)URL.revokeObjectURL(objUrl); }

    const controls=h('div',{class:'re-imged-controls'});
    function renderControls(){
      controls.innerHTML='';
      const chip=(lbl,on,fn,title)=>h('button',{class:'re-chip2'+(on?' on':''),type:'button',title:title||lbl,onclick:fn},lbl);
      controls.append(h('div',{class:'re-imged-row'},h('span',{class:'re-imged-lbl'},'Crop'),
        chip('Free',!aspect,()=>setAspect(null)),
        chip('1:1',aspect===1,()=>setAspect(1)),
        chip('4:3',aspect===4/3,()=>setAspect(4/3)),
        chip('16:9',aspect===16/9,()=>setAspect(16/9)),
        chip('Banner',aspect===3,()=>setAspect(3))));
      controls.append(h('div',{class:'re-imged-row'},h('span',{class:'re-imged-lbl'},'Fit'),
        chip('Crop',!stretch,()=>{ stretch=false; renderControls(); },'Keep proportions — trims to the box'),
        chip('Stretch',stretch,()=>{ stretch=true; renderControls(); },'Squeeze the whole image into the box (may distort)'),
        h('span',{class:'re-imged-gap'}),
        h('button',{class:'re-chip2',type:'button',title:'Rotate 90°',onclick:()=>{ rot=(rot+90)%360; fit(); }},icon('rotate',13),'Rotate'),
        h('button',{class:'re-chip2'+(flip?' on':''),type:'button',title:'Flip horizontally',onclick:()=>{ flip=!flip; drawAll(); renderControls(); }},icon('flip',13),'Flip')));
      if(CAN_FILTER){
        controls.append(h('div',{class:'re-imged-row'},h('span',{class:'re-imged-lbl'},'Filter'),
          chip('None',preset==='none',()=>{ preset='none'; drawAll(); renderControls(); }),
          chip('B&W',preset==='bw',()=>{ preset='bw'; drawAll(); renderControls(); }),
          chip('Sepia',preset==='sepia',()=>{ preset='sepia'; drawAll(); renderControls(); }),
          chip('Vivid',preset==='vivid',()=>{ preset='vivid'; drawAll(); renderControls(); }),
          chip('Soft',preset==='soft',()=>{ preset='soft'; drawAll(); renderControls(); })));
        const slider=(lbl,get,set)=>{ const inp=h('input',{type:'range',min:'50',max:'150',value:String(get()),'aria-label':lbl});
          inp.addEventListener('input',()=>{ set(+inp.value); drawAll(); });
          return h('div',{class:'re-imged-sl'},h('span',{},lbl),inp); };
        controls.append(h('div',{class:'re-imged-row'},h('span',{class:'re-imged-lbl'},'Adjust'),
          h('div',{class:'re-imged-sliders'},
            slider('Brightness',()=>bright,v=>bright=v),
            slider('Contrast',()=>contrast,v=>contrast=v),
            slider('Saturation',()=>sat,v=>sat=v)),
          h('button',{class:'re-chip2',type:'button',onclick:()=>{ bright=contrast=sat=100; preset='none'; drawAll(); renderControls(); }},'Reset')));
      }
    }
    function apply(){
      applyBtn.disabled=true; applyBtn.textContent='Processing…';
      const fail=()=>{ applyBtn.disabled=false; applyBtn.textContent='Apply'; toast('Couldn’t process this image (it may be protected)','err'); };
      try{
        const k=Math.min(1,2400/Math.max(srcW(),srcH()));
        const full=document.createElement('canvas');
        full.width=Math.max(1,Math.round(srcW()*k)); full.height=Math.max(1,Math.round(srcH()*k));
        paintImage(full.getContext('2d'),full.width,full.height);
        const s=full.width/dw;
        const out=document.createElement('canvas');
        out.width=Math.max(1,Math.round(crop.w*s)); out.height=Math.max(1,Math.round(crop.h*s));
        const octx=out.getContext('2d');
        if(stretch)octx.drawImage(full,0,0,full.width,full.height,0,0,out.width,out.height);
        else octx.drawImage(full,Math.round(crop.x*s),Math.round(crop.y*s),Math.round(crop.w*s),Math.round(crop.h*s),0,0,out.width,out.height);
        const type=(isBlob&&(src.type==='image/png'||src.type==='image/webp'))?src.type:'image/jpeg';
        out.toBlob(b=>{
          if(!b){ fail(); return; }
          const base=(isBlob&&src.name)?src.name.replace(/\.[a-z0-9]+$/i,''):'image';
          const ext=type==='image/png'?'png':type==='image/webp'?'webp':'jpg';
          m.close();
          onDone(new File([b],base+'-edited.'+ext,{type}));
        },type,.9);
      }catch(e){ console.warn('[image editor]',e); fail(); }
    }
    applyBtn=h('button',{class:'re-btn re-btn-pri',onclick:apply},'Apply');
    const foot=[h('button',{class:'re-btn re-btn-ghost',onclick:()=>m.close()},'Cancel')];
    if(isBlob)foot.push(h('button',{class:'re-btn re-btn-ghost',onclick:()=>{ m.close(); onDone(src); }},'Use original'));
    foot.push(applyBtn);
    const m=reModal({title:'Edit image',cls:'re-imged',
      body:[h('div',{class:'re-imged-cvwrap'},cv),controls],
      foot,onClose:cleanup});
    fit();
  }
}

function openMedia(img){
  const key=img.dataset.editImg||API.getEditKey(img);
  if(!img.dataset.editImg)img.dataset.editImg=key;
  const lib=[...new Set([...document.images].map(i=>i.getAttribute('src')).filter(s=>s&&/^assets\//.test(s)))].sort();
  const apply=url=>{ undo.push({kind:'img',key,prev:WORK.img[key]}); WORK.img[key]=url; img.src=url; img.classList.add('re-dirty'); markDirty('img:'+key); m.close(); toast('Image updated'); };
  const uploadFile=f=>{ toast('Uploading…'); Store.uploadImage(f).then(apply).catch(err=>toast('Upload failed: '+err.message,'err')); };
  const handleFile=f=>{ if(!f)return; if(!/^image\/(png|jpeg|webp)$/.test(f.type)){toast('Use a PNG, JPG or WEBP image','err');return;} if(f.size>5e6){toast('Max 5 MB','err');return;} openImageEditor(f,uploadFile); };
  const fileInp=h('input',{type:'file',accept:'image/png,image/jpeg,image/webp',style:'display:none',onchange:e=>handleFile(e.target.files[0])});
  const drop=h('div',{class:'re-drop',role:'button',tabindex:'0','aria-label':'Upload an image',onclick:()=>fileInp.click(),
    onkeydown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInp.click();}},
    ondragover:e=>{e.preventDefault();drop.classList.add('over');},
    ondragleave:()=>drop.classList.remove('over'),
    ondrop:e=>{e.preventDefault();drop.classList.remove('over');handleFile(e.dataTransfer.files&&e.dataTransfer.files[0]);}},
    icon('upload',22),h('span',{class:'re-drop-t'},'Drop an image here, or click to upload'),h('span',{class:'re-drop-sub'},'PNG · JPG · WEBP · max 5 MB — crop & filters next'));
  const adjustBtn=h('button',{class:'re-btn re-btn-ghost re-btn-sm',style:'align-self:flex-start;margin:-6px 0 14px',
    onclick:()=>openImageEditor(img.currentSrc||img.src,uploadFile)},icon('sliders',14),'Adjust current image (crop / filters)');
  const altInp=h('input',{class:'re-input',placeholder:'Describe the image (for accessibility)',value:(WORK.imgMeta[key]&&WORK.imgMeta[key].alt)||img.getAttribute('alt')||''});
  altInp.addEventListener('input',()=>{WORK.imgMeta[key]=Object.assign({},WORK.imgMeta[key],{alt:altInp.value});img.alt=altInp.value;markDirty('imgMeta:'+key);});
  const grid=h('div',{class:'re-grid'},lib.map(src=>h('img',{src,loading:'lazy',title:src,alt:src.split('/').pop(),onclick:()=>apply(src)})));
  const m=reModal({title:'Change image',cls:'re-media',
    body:[fileInp,drop,adjustBtn,
      h('div',{class:'re-field'},h('label',{},'Or pick from your media library'),grid),
      h('div',{class:'re-field'},h('label',{},'Alt text'),altInp)],
    foot:[h('button',{class:'re-btn re-btn-ghost',onclick:()=>m.close()},'Done')]});
}

/* ════════ PHOTOS PANEL — every changeable image on the page, one-click replace ════════ */
let photosPanel;
function makePanel(cls,titleIcon,title,onRefresh){
  const acts=[]; if(onRefresh)acts.push(iconBtn('refresh','Refresh',onRefresh));
  let panel;
  acts.push(iconBtn('x','Close',()=>panel.classList.remove('open')));
  const body=h('div',{class:'re-panel-body'});
  panel=h('div',{class:'re-panel '+cls+' re-ui'},
    h('div',{class:'re-panel-head'},h('h3',{},icon(titleIcon,16),title),h('div',{class:'re-panel-acts'},...acts)),
    body);
  panel._body=body;
  document.body.append(panel);
  return panel;
}
function openPhotos(){
  if(!photosPanel)photosPanel=makePanel('re-photos','image','Photos',loadPhotos);
  photosPanel.classList.add('open'); loadPhotos();
}
function loadPhotos(){
  const body=photosPanel._body; body.innerHTML='';
  const imgs=[...document.images].filter(i=>!i.closest(LOCKED)&&!i.closest('.re-ui')&&i.clientWidth>=24&&i.clientHeight>=24);
  if(!imgs.length){ body.append(h('p',{class:'re-panel-empty'},'No changeable photos on this page. Open the page whose photos you want to change, then reopen Photos.')); return; }
  body.append(h('p',{class:'re-panel-hint'},imgs.length+' photo'+(imgs.length===1?'':'s')+' on this page — click “Change” to replace one, or the thumbnail to jump to it.'));
  imgs.forEach(img=>{
    const name=(img.getAttribute('alt')||img.getAttribute('src')||'image').split('/').pop();
    const change=()=>{ img.scrollIntoView({behavior:'smooth',block:'center'}); openMedia(img); };
    const thumb=h('img',{class:'re-photo-thumb',src:img.currentSrc||img.src,loading:'lazy',alt:name,title:'Click to change, or drag onto any photo on the page',draggable:'true',onclick:change});
    thumb.addEventListener('dragstart',e=>{ swapSrcImg=img; e.dataTransfer.effectAllowed='move'; try{e.dataTransfer.setData('text/re-img','1');}catch(_){} });
    body.append(h('div',{class:'re-photo-row'},
      thumb,
      h('div',{class:'re-photo-meta'},
        h('div',{class:'re-photo-name',title:name},name),
        h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:change},'Change'))));
  });
}

/* ════════ THEME PANEL (fonts + colors) ════════ */
const GROUPS=[
  {name:'Brand Gold', vars:[['--au','Primary gold'],['--au2','Light gold']]},
  {name:'Emerald', vars:[['--g','Deep green'],['--g2','Mid green'],['--g3','Bright accent']]},
  {name:'Backgrounds', vars:[['--nv','Page background'],['--nv2','Alt sections'],['--nv3','Raised surfaces']]},
  {name:'Text', vars:[['--tx','Text color']]},  /* muted text auto-derives from this */
  {name:'Market Up / Down', vars:[['--up','Gains (up)'],['--dn','Losses (down)']]},
  {name:'Chart lines', vars:[['--chart-grid','Grid lines'],['--chart-axis','Axis labels']]},
];
const FONTS={
  display:[
    ["Cormorant Garamond","'Cormorant Garamond',serif","Cormorant Garamond (default)"],
    ["Playfair Display","'Playfair Display',serif","Playfair Display"],
    ["Merriweather","'Merriweather',serif","Merriweather"],
    ["Lora","'Lora',serif","Lora"],
    ["EB Garamond","'EB Garamond',serif","EB Garamond"],
    ["Libre Baskerville","'Libre Baskerville',serif","Libre Baskerville"],
    ["Poppins","'Poppins',sans-serif","Poppins (sans)"],
    ["Montserrat","'Montserrat',sans-serif","Montserrat (sans)"],
  ],
  body:[
    ["Plus Jakarta Sans","'Plus Jakarta Sans',sans-serif","Plus Jakarta Sans (default)"],
    ["Inter","'Inter',sans-serif","Inter"],
    ["Poppins","'Poppins',sans-serif","Poppins"],
    ["Work Sans","'Work Sans',sans-serif","Work Sans"],
    ["Nunito Sans","'Nunito Sans',sans-serif","Nunito Sans"],
    ["Manrope","'Manrope',sans-serif","Manrope"],
    ["Lato","'Lato',sans-serif","Lato"],
    ["Source Sans 3","'Source Sans 3',sans-serif","Source Sans"],
  ]
};
function renderFonts(box){
  box.innerHTML='';
  const mk=(which,label)=>{
    const sel=h('select',{class:'re-input re-font-sel','aria-label':label+' font'});
    FONTS[which].forEach(([fam,stack,lbl])=>sel.append(h('option',{value:stack},lbl)));
    sel.value=WORK.fonts[which]||FONTS[which][0][1];
    sel.addEventListener('change',()=>{ WORK.fonts[which]=sel.value; API.applyFonts(WORK.fonts); markDirty('fonts:'+which); });
    return h('div',{class:'re-fontrow'},h('span',{class:'re-cl-lbl'},label),sel);
  };
  box.append(h('div',{class:'re-group'},
    h('div',{class:'re-group-h'},'Fonts',h('button',{type:'button',onclick:()=>{ WORK.fonts={}; API.applyFonts({}); markDirty('fonts:display'); markDirty('fonts:body'); renderFonts(box); }},'reset')),
    mk('display','Headings'), mk('body','Body text')));
}
let colorMode='dark', colorPanel;
function syncTabs(){ const t=colorPanel._tabs.children; t[0].classList.toggle('on',colorMode==='dark'); t[1].classList.toggle('on',colorMode==='light'); }
function openColors(){
  colorMode=document.body.classList.contains('light')?'light':'dark'; // match what the user currently sees
  if(colorPanel){ syncTabs(); renderColorGroups(); colorPanel.classList.add('open'); return; }
  colorPanel=makePanel('re-theme','palette','Theme');
  const fontsBox=h('div');
  const groups=h('div');
  const tabs=h('div',{class:'re-tabs'},
    h('button',{class:'re-tab',type:'button',onclick:()=>setMode('dark')},'Dark mode'),
    h('button',{class:'re-tab',type:'button',onclick:()=>setMode('light')},'Light mode'));
  colorPanel._body.append(fontsBox,h('div',{class:'re-tabs-lbl'},'Colors'),tabs,groups);
  colorPanel._tabs=tabs; colorPanel._groups=groups;
  renderFonts(fontsBox); syncTabs(); renderColorGroups();
  requestAnimationFrame(()=>colorPanel.classList.add('open'));
}
function setMode(m){
  colorMode=m;
  document.body.classList.toggle('light',m==='light'); // live-preview the edited mode
  syncTabs(); renderColorGroups();
}
function toHex(v){ // normalize a css color to #rrggbb for <input type=color>
  v=(v||'').trim(); if(/^#([0-9a-f]{6})$/i.test(v))return v;
  if(/^#([0-9a-f]{3})$/i.test(v))return '#'+v.slice(1).split('').map(c=>c+c).join('');
  const m=v.match(/rgba?\(([^)]+)\)/i); if(m){const[r,g,b]=m[1].split(',').map(n=>parseInt(n));return '#'+[r,g,b].map(n=>(n||0).toString(16).padStart(2,'0')).join('');}
  return '#000000';
}
function curVal(name){ const m=WORK.theme[colorMode]; if(m&&m[name]!=null)return m[name]; return API.defaultVar(name,colorMode==='light'); }
function renderColorGroups(){
  const body=colorPanel._groups; body.innerHTML='';
  GROUPS.forEach(g=>{
    const rows=g.vars.map(([v,lbl])=>{
      const val=curVal(v); const hex=toHex(val);
      const picker=h('input',{type:'color',value:hex,'aria-label':lbl});
      const hexI=h('input',{class:'re-cl-hex',value:val,'aria-label':lbl+' value'});
      const set=nv=>{ WORK.theme[colorMode][v]=nv; hexI.value=nv; picker.value=toHex(nv);
        API.injectThemeOverrides(WORK.theme); window.dispatchEvent(new Event('re-recolor')); markDirty('theme:'+colorMode+':'+v); };
      picker.addEventListener('input',()=>set(picker.value));
      hexI.addEventListener('change',()=>set(hexI.value.trim()));
      return h('div',{class:'re-color'},picker,h('span',{class:'re-cl-lbl'},lbl),hexI);
    });
    body.append(h('div',{class:'re-group'},
      h('div',{class:'re-group-h'},g.name,h('button',{type:'button',onclick:()=>{g.vars.forEach(([v])=>{delete WORK.theme[colorMode][v];markDirty('theme:'+colorMode+':'+v);});API.injectThemeOverrides(WORK.theme);window.dispatchEvent(new Event('re-recolor'));renderColorGroups();}},'reset')),
      ...rows));
  });
}

/* ════════ SAVE / PUBLISH (lives in the toolbar) ════════ */
function updateSaveBar(){
  updateSideStatus();               // the sidebar chip tracks the same state as the toolbar
  if(!barEls.chip)return;
  const n=dirty.size;
  barEls.chip.textContent=n?(n+' unsaved change'+(n===1?'':'s')):'All changes saved';
  barEls.chip.classList.toggle('on',n>0);
  barEls.discard.style.display=n?'':'none';
  barEls.save.disabled=!n;
}
function cleanWork(){ return JSON.parse(JSON.stringify(WORK)); }
function afterSaveRefresh(){ updateSaveBar(); softRefresh(); }
/* Save the draft (private). Resolves true/false so callers can react. */
function saveDraft(msg){
  if(typeof msg!=='string')msg=null;   // guard: also wired to a click handler
  return Promise.resolve(Store.saveDraft(cleanWork())).then(()=>{ dirty.clear(); afterSaveRefresh(); toast(msg||'Draft saved (not yet public)'); return true; })
    .catch(e=>{ toast('Save failed: '+e.message,'err'); return false; });
}
/* Push the whole draft live. LIVE tracks it so every screen can show what's on the
   website without another round-trip. Rejects on failure — callers report it. */
function doPublish(msg){
  const snap=cleanWork();
  /* The one action worth a curtain: it's the slowest, it's what visitors see, and a
     second click mid-write would push a half-formed draft. */
  const busy=reBusy('Publishing','Putting your changes on the website — this takes a moment.');
  return Promise.resolve(Store.publish(snap)).then(()=>{
    try{localStorage.setItem('re-content',JSON.stringify(snap));}catch(e){}
    LIVE=normalize(snap); dirty.clear(); afterSaveRefresh();
    busy.close();
    toast(msg||'Published! Your changes are now live.');
  },e=>{ busy.close(); throw e; });
}
/* Publish, optionally framed around one post the user pointed at. The message has to
   match what that post's pending change actually does — putting it up, updating it,
   or taking it down. */
function publishAll(p){
  const t='“'+((p&&p.title)||'Untitled')+'”';
  const act=p?postState(p).act:null;
  const what=!p?'Everything waiting in your draft goes on the website for everyone to see.'
    :(act==='Publish edits'?('Your edits to '+t+' replace the version readers see now.')
     :act==='Publish to remove it'?(t+' comes off the website. It stays here as a draft.')
     :(t+' goes on the website’s Blogs page for everyone to read.'))+otherPending(p.id);
  const done=!p?null:(act==='Publish edits'?'Updated — your edits are live'
    :act==='Publish to remove it'?'Removed from the website':'Published — it’s on the website now');
  reConfirm(what,{title:'Publish now?',okLabel:'Publish'}).then(ok=>{ if(!ok)return;
    doPublish(done).catch(e=>toast('Publish failed: '+e.message,'err')); });
}
function publish(){ reConfirm('This makes your changes live for everyone visiting the website.',{title:'Publish changes?',okLabel:'Publish'}).then(ok=>{ if(!ok)return;
  doPublish().catch(e=>toast('Publish failed: '+e.message,'err')); }); }
function discardAll(){ reConfirm('This throws away every change since your last save.',{title:'Discard changes?',okLabel:'Discard',danger:true}).then(ok=>{ if(!ok)return;
  const structural=[...dirty].some(k=>k.indexOf('order:')===0||k.indexOf('hidden:')===0);
  if(structural){ location.reload(); return; }   // reordered/hidden DOM needs a clean slate
  Store.getDraft().then(d=>{ WORK=normalize(d); API.setOverrides(WORK); API.refreshCalcInfo&&API.refreshCalcInfo(); document.querySelectorAll('.re-dirty').forEach(n=>n.classList.remove('re-dirty')); dirty.clear();afterSaveRefresh();toast('Changes discarded'); }); }); }

/* global undo (Ctrl/Cmd-Z) */
document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&editing){ const u=undo.pop(); if(!u)return; e.preventDefault();
  if(u.kind==='text'){ if(u.prev==null)delete WORK.text[u.key];else WORK.text[u.key]=u.prev; }
  if(u.kind==='img'){ if(u.prev==null)delete WORK.img[u.key];else WORK.img[u.key]=u.prev; }
  if(u.kind==='hidden'){ delete WORK.hidden[u.key]; API.applyHidden(WORK.hidden); if(sitePanel&&sitePanel.classList.contains('open'))renderSite(); }
  if(u.kind==='order'){ if(u.prevSaved)WORK.order[u.key]=u.prevSaved; else delete WORK.order[u.key]; if(u.prevList&&u.prevList.length)API.applyOrder({[u.key]:u.prevList}); }
  if(u.kind==='imgswap'){
    if(u.prevA==null)delete WORK.img[u.a];else WORK.img[u.a]=u.prevA;
    if(u.prevB==null)delete WORK.img[u.b];else WORK.img[u.b]=u.prevB;
    if(u.elA)u.elA.src=u.sa; if(u.elB)u.elB.src=u.sb;
  }
  API.setOverrides(WORK); toast('Undo'); }});
/* ESC closes an open side panel (when no dialog is open and not editing text) */
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||$('.re-overlay'))return;
  const a=document.activeElement; if(a&&a.isContentEditable)return;
  const p=$('.re-panel.open'); if(p)p.classList.remove('open');
});

/* ════════ start ════════ */
let booted=false;
function boot(authed){
  if(booted)return; booted=true;
  BOOT.stage(authed?'Opening your dashboard':'Almost ready',88);
  if(authed)onAuthed(); else showLogin();
  /* Lift the branded curtain only once the admin is genuinely painted — one frame
     after the login card or dashboard is in the DOM, so there's no flash of the
     public site underneath. */
  requestAnimationFrame(()=>requestAnimationFrame(()=>BOOT.finish()));
}
BOOT.stage('Checking your sign-in',68);
Promise.resolve(Store.init()).then(boot).catch(function(){ boot(false); });
/* Safety net: if the session check ever stalls (flaky network / token refresh),
   still show the login within a few seconds instead of leaving the bare site. */
setTimeout(function(){ if(!booted)boot(false); }, 6000);
})();
