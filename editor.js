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
  eraser:'<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'
};
function icon(name,size){ size=size||20; return h('span',{class:'re-ic',html:'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[name]||'')+'</svg>'}); }
const iconBtn=(name,label,fn,cls)=>h('button',{class:'re-iconbtn'+(cls?' '+cls:''),type:'button','aria-label':label,title:label,onclick:fn},icon(name,16));
/* Locked = live/dynamic widgets + the editor's own UI. Everything else (incl. nav labels & logo) is editable. */
const LOCKED='.pcard,#mktTbody,#tickerWrap,#heroStocks,#perfGrid,.ticker,.live-badge,.theme-toggle,#toTop,.wa-fab,.ham,.re-bar,.re-panel,.re-overlay,.re-fmt,.re-img-btn,.re-coach,.re-toast,.re-dash,.re-login,.cnt';
function toast(msg,type){
  let t=$('.re-toast'); if(!t){t=h('div',{class:'re-toast'});document.body.append(t);}
  t.className='re-toast '+(type==='err'?'err':'ok');
  t.replaceChildren(icon(type==='err'?'alert':'check',15),h('span',{},msg));
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2400);
}
const debounce=(fn,ms=120)=>{let id;return(...a)=>{clearTimeout(id);id=setTimeout(()=>fn(...a),ms);};};

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
  const key=e=>{ if(e.key==='Escape'&&o.dismissible!==false){ e.stopPropagation(); close(); } };
  let closed=false;
  function close(){ if(closed)return; closed=true; document.removeEventListener('keydown',key,true); overlay.remove(); o.onClose&&o.onClose(); }
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
    inviteEditor(){ return Promise.reject(new Error('Inviting editors works on the live site.')); },
    revokeInvite(){ return Promise.reject(new Error('Works on the live site.')); },
    listInvites(){ return Promise.resolve([]); },
    markInviteAccepted(){ return Promise.resolve(); },
    getDraft(){ return Promise.resolve(get('re-content-draft')||get('re-content')||blank()); },
    saveDraft(data){ set('re-content-draft',data); return Promise.resolve(); },
    publish(data){ set('re-content-draft',data); set('re-content',data); return Promise.resolve(); },
    uploadImage(file){ return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('read failed'));r.readAsDataURL(file);}); }
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
    async listInvites(){ const{data,error}=await sb.from('invites').select('*').order('created_at',{ascending:false}); if(error)throw new Error(error.message); return data||[]; },
    async markInviteAccepted(){ const{data:{user}}=await sb.auth.getUser(); if(!user)return; await sb.from('invites').update({accepted_at:new Date().toISOString()}).eq('email',(user.email||'').toLowerCase()).is('accepted_at',null); },
    async getDraft(){return await rowData('draft');},
    async saveDraft(data){const{error}=await sb.from('site_content').upsert({scope:'draft',data,version:(data.version||0)+1,updated_at:new Date().toISOString()});if(error)throw new Error(error.message);},
    async publish(data){const rec={data,version:(data.version||0)+1,updated_at:new Date().toISOString()};const{error}=await sb.from('site_content').upsert([{scope:'draft',...rec},{scope:'published',...rec}]);if(error)throw new Error(error.message);},
    async uploadImage(file){const ext=(file.name.split('.').pop()||'png').toLowerCase();const name='content/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;const{error}=await sb.storage.from('content-images').upload(name,file,{upsert:true,contentType:file.type});if(error)throw new Error(error.message);return sb.storage.from('content-images').getPublicUrl(name).data.publicUrl;}
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
  const wrap=h('div',{class:'re-login re-ui'},
    h('div',{class:'re-login-card'},
      h('div',{class:'re-login-mark','aria-hidden':'true'},'RE'),
      h('h1',{class:'re-login-brand'},'Rallys Equities'),
      h('div',{class:'re-login-sub'},'Admin portal'),
      isSb?'':h('div',{class:'re-note'},icon('alert',15),h('span',{},'Local preview — Supabase isn’t connected. Any passphrase works; changes save to this browser only.')),
      ...fields, err, btn,
      isSb?h('p',{class:'re-login-hint'},'Trouble signing in? Ask the site owner for a fresh invite link.'):''));
  document.body.append(wrap);
  setTimeout(()=>{const i=$('input',wrap);i&&i.focus();},50);
}

/* ════════ AFTER LOGIN ════════ */
function onAuthed(){
  Store.getDraft().then(d=>{ WORK=normalize(d); API.setOverrides(WORK); API.refreshCalcInfo&&API.refreshCalcInfo(); })
    .catch(e=>{ console.warn(e); WORK=blank(); })
    .then(()=>{ if(INVITE_FLOW)setTimeout(()=>openChangePassword(true),400); else openDashboard(); });
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
function doLogout(){ Promise.resolve(Store.logout()).then(()=>location.search=location.search.replace(/[?&]edit=1/,'')||''); }

/* ════════ DASHBOARD APP (fullscreen: sidebar + views) ════════ */
let dashEl,dashMain,dashView='overview',blogEditId=null;

function ensureDash(){
  if(dashEl)return;
  const navItem=(id,ic,label,fn)=>h('button',{class:'re-nav-item','data-nav':id||'',onclick:fn}, icon(ic,18), h('span',{class:'re-nav-lbl'},label));
  const side=h('aside',{class:'re-side'},
    h('div',{class:'re-side-brand'},
      h('div',{class:'re-side-logo'},'Rallys Equities'),
      h('div',{class:'re-side-sub'},'Admin')),
    h('nav',{class:'re-side-nav','aria-label':'Admin navigation'},
      navItem('overview','grid','Dashboard',()=>go('overview')),
      navItem('blog','post','Blog Posts',()=>{ blogEditId=null; go('blog'); }),
      navItem('editors','users','Editors',()=>go('editors')),
      h('div',{class:'re-side-cap'},'Website'),
      navItem('','edit','Edit website',()=>enterStudio({edit:true})),
      navItem('','sliders','Site settings',()=>enterStudio({edit:false,panel:'site'})),
      navItem('','external','View live site',()=>window.open(location.origin+'/','_blank'))),
    h('div',{class:'re-side-foot'},
      navItem('settings','gear','Settings',()=>go('settings')),
      navItem('','logout','Log out',doLogout)));
  dashMain=h('div',{class:'re-main-inner'});
  dashEl=h('div',{class:'re-dash re-ui'},side,h('main',{class:'re-main'},dashMain));
  document.body.append(dashEl);
}
function go(view){ dashView=view; setActiveNav(); renderMain(); dashEl.querySelector('.re-main').scrollTop=0; }
function setActiveNav(){ dashEl&&dashEl.querySelectorAll('.re-nav-item[data-nav]').forEach(b=>{const on=b.getAttribute('data-nav')===dashView;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}); }
function openDashboard(){
  ensureDash();
  dashEl.style.display='flex'; document.body.classList.add('re-dash-open');
  setActiveNav(); renderMain();
}
function closeDashboard(){ if(dashEl)dashEl.style.display='none'; document.body.classList.remove('re-dash-open'); }
function dashVisible(){ return dashEl&&dashEl.style.display!=='none'; }
function emptyState(msg,ic){ return h('div',{class:'re-empty'},icon(ic||'post',30),h('p',{},msg)); }

function renderMain(){ if(!dashMain||!dashVisible())return; dashMain.innerHTML=''; ({overview:renderOverview,editors:renderEditors,blog:renderBlogAdmin,settings:renderSettings}[dashView]||renderOverview)(); }

/* ── Overview ── */
function kpi(label,value,ic,accent){ return h('div',{class:'re-kpi'+(accent?' on':'')}, h('span',{class:'re-kpi-ic'},icon(ic,18)), h('div',{class:'re-kpi-body'}, h('div',{class:'re-kpi-val'},String(value)), h('div',{class:'re-kpi-lbl'},label))); }
function qa(ic,title,desc,fn){ return h('button',{class:'re-qa',onclick:fn},
  h('span',{class:'re-qa-ic'},icon(ic,19)),
  h('span',{class:'re-qa-tx'},h('span',{class:'re-qa-t'},title),h('span',{class:'re-qa-d'},desc)),
  h('span',{class:'re-qa-go'},icon('chevr',16))); }
function renderOverview(){
  const posts=WORK.posts||[];
  const live=posts.filter(p=>p.published!==false).length;
  const pagesAll=[...document.querySelectorAll('.page')].filter(p=>p.id!=='page-post').length;
  const pagesHidden=Object.keys(WORK.hidden||{}).filter(k=>k.indexOf('page:')===0).length;
  dashMain.append(h('div',{class:'re-main-head'},h('h1',{},'Dashboard'),h('p',{},'Your website at a glance.')));
  if(dirty.size)dashMain.append(h('div',{class:'re-banner'},
    icon('alert',18),
    h('span',{class:'re-banner-tx'},h('b',{},dirty.size+' unsaved change'+(dirty.size===1?'':'s')),' — private until you publish.'),
    h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>enterStudio({edit:true})},'Continue editing'),
    h('button',{class:'re-btn re-btn-gd re-btn-sm',onclick:publish},'Publish now')));
  dashMain.append(h('div',{class:'re-kpis'},
    kpi('Blog posts',posts.length,'post'),
    kpi('Live on the site',live,'check',live>0),
    kpi('Drafts',posts.length-live,'edit'),
    kpi('Visible pages',pagesAll-pagesHidden,'grid')));
  dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'Manage the website')));
  dashMain.append(h('div',{class:'re-qas'},
    qa('edit','Edit content','Click text to rewrite it; drag anything to move it; hide what you don’t need.',()=>enterStudio({edit:true})),
    qa('post','Write a blog post','Publish market insights to the site’s Insights section.',()=>{ blogEditId='new'; go('blog'); }),
    qa('image','Photos','Swap any photo — click it, or drag one photo onto another.',()=>enterStudio({edit:false,panel:'photos'})),
    qa('sliders','Site settings','Show/hide market widgets, remove pages, restore hidden pieces.',()=>enterStudio({edit:false,panel:'site'})),
    qa('palette','Theme & fonts','Adjust the site’s colors and typography.',()=>enterStudio({edit:false,panel:'theme'}))));
  dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'Recent posts'),
    posts.length?h('button',{class:'re-linkbtn',onclick:()=>{ blogEditId=null; go('blog'); }},'View all'):''));
  const list=h('div',{class:'re-sub-list'});
  const recent=[...posts].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,3);
  if(!recent.length)list.append(emptyState('No posts yet — write your first market insight.'));
  else recent.forEach(p=>list.append(postRow(p)));
  dashMain.append(list);
}

/* ── Editors (invite by email via Resend; the shareable link stays as a fallback) ── */
function inviteStatus(inv){ if(inv.accepted_at)return'Accepted'; if(inv.expires_at&&new Date(inv.expires_at)<=new Date())return'Expired'; return'Pending'; }
function renderEditors(){
  dashMain.append(h('div',{class:'re-main-head'},h('h1',{},'Editors'),h('p',{},'Give a teammate access — they’ll get an email invite to set their own password. You can also copy the link and send it yourself.')));
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
    btn.disabled=true; btn.textContent='Sending…';
    Promise.resolve(Store.inviteEditor(e)).then(r=>{ btn.disabled=false; btn.textContent='Send invite'; em.value='';
      if(r&&r.link)showLink(r.link,e,r);
      toast(r&&r.emailed?('Invite emailed to '+e):'Invite created — share the link', r&&r.emailed?undefined:'err'); loadList(); })
      .catch(x=>{ err.textContent=x.message||'Could not create invite.'; btn.disabled=false; btn.textContent='Send invite'; });
  }
  em.addEventListener('keydown',e=>{ if(e.key==='Enter')create(); });
  function loadList(){ listWrap.innerHTML=''; listWrap.append(h('div',{class:'re-inv-empty'},'Loading…'));
    Promise.resolve(Store.listInvites()).then(rows=>{ listWrap.innerHTML='';
      if(!rows.length){ listWrap.append(h('div',{class:'re-inv-empty'},'No invites yet.')); return; }
      rows.forEach(inv=>{ const st=inviteStatus(inv); const acts=[];
        if(st!=='Accepted'){
          acts.push(h('button',{class:'re-inv-act',onclick:()=>{ Promise.resolve(Store.inviteEditor(inv.email)).then(r=>{ if(r&&r.link)showLink(r.link,inv.email,r); toast(r&&r.emailed?'New invite emailed':'New link ready',r&&r.emailed?undefined:'err'); loadList(); }).catch(x=>toast(x.message,'err')); }},icon('refresh',12),'Resend'));
          acts.push(h('button',{class:'re-inv-act re-inv-del',onclick:()=>{ reConfirm('Revoke the invite for '+inv.email+'? Their link will stop working.',{title:'Revoke invite?',okLabel:'Revoke',danger:true}).then(ok=>{ if(!ok)return; Promise.resolve(Store.revokeInvite(inv.id)).then(()=>{ toast('Invite revoked'); loadList(); }).catch(x=>toast(x.message,'err')); }); }},'Revoke'));
        }
        listWrap.append(h('div',{class:'re-inv-row'},
          h('span',{class:'re-inv-email',title:inv.email},inv.email),
          h('span',{class:'re-badge re-inv-'+st.toLowerCase()},st),
          h('span',{class:'re-inv-actions'},...acts)));
      });
    }).catch(x=>{ listWrap.innerHTML=''; listWrap.append(h('div',{class:'re-inv-empty'},'Couldn’t load invites: '+x.message)); });
  }
  dashMain.append(h('div',{class:'re-card'},
    h('div',{class:'re-field'},h('label',{},'Their email'),h('div',{class:'re-invrow'},em,btn)), err, linkBox));
  dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'Invites'),iconBtn('refresh','Refresh invites',loadList)));
  dashMain.append(listWrap);
  dashMain.append(h('p',{class:'re-footnote'},'Need to remove someone who already accepted? For now that’s done from the Supabase dashboard (Authentication → Users).'));
  loadList();
}

/* ── Blog Posts — written here, shown on the site's “Insights” page. Go live on Publish. ── */
function postDateFmt(d){ const t=Date.parse(d||''); return t?new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):(d||''); }
function renderBlogAdmin(){ if(blogEditId)renderPostEditor(); else renderPostList(); }
function renderPostList(){
  const posts=[...(WORK.posts||[])].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const nPub=posts.filter(p=>p.published!==false).length;
  dashMain.append(h('div',{class:'re-main-head'},h('h1',{},'Blog Posts'),
    h('p',{},'Shown on the website’s “Insights” page · '+posts.length+' post'+(posts.length===1?'':'s')+' · '+nPub+' live')));
  dashMain.append(h('div',{class:'re-blog-tools'},
    h('button',{class:'re-btn re-btn-pri',onclick:()=>{ blogEditId='new'; renderMain(); }},icon('plus',15),'New post'),
    dirty.size?h('button',{class:'re-btn re-btn-gd re-btn-sm',onclick:publish},'Publish changes'):''));
  const list=h('div',{class:'re-sub-list'}); dashMain.append(list);
  if(!posts.length){ list.append(emptyState('No posts yet — write your first market insight.')); return; }
  posts.forEach(p=>list.append(postRow(p)));
}
function postRow(p){
  const cover=p.cover?h('img',{class:'re-post-cover',src:p.cover,alt:''}):h('span',{class:'re-post-cover'},icon('image',18));
  return h('div',{class:'re-post-row'},cover,
    h('div',{class:'re-post-meta'},
      h('div',{class:'re-post-title'},p.title||'Untitled'),
      h('div',{class:'re-post-sub'},
        h('span',{class:'re-badge '+(p.published!==false?'re-inv-accepted':'re-inv-pending')},p.published!==false?'Live':'Draft'),
        h('span',{},postDateFmt(p.date)))),
    h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{ blogEditId=p.id; go('blog'); }},'Edit'),
    h('button',{class:'re-sub-del','aria-label':'Delete post',onclick:async()=>{
      if(!(await reConfirm('Delete “'+(p.title||'Untitled')+'”? This removes it from the website on your next publish.',{title:'Delete post?',okLabel:'Delete',danger:true})))return;
      WORK.posts=WORK.posts.filter(x=>x.id!==p.id); markDirty('posts:'+p.id); API.setOverrides(WORK); renderMain(); toast('Post deleted — publish to update the site');
    }},icon('trash',13),'Delete'));
}

/* ── Settings — publishing, account, and reset-to-default options ── */
function renderSettings(){
  dashMain.append(h('div',{class:'re-main-head'},h('h1',{},'Settings'),h('p',{},'Publishing, your account, and reset options if things get messy.')));
  const row=(title,desc,ctl)=>h('div',{class:'re-setrow'},h('div',{class:'re-setrow-tx'},h('div',{class:'re-setrow-t'},title),h('div',{class:'re-setrow-d'},desc)),ctl);
  const n=dirty.size;
  dashMain.append(h('div',{class:'re-card re-set-card'},
    h('div',{class:'re-set-h'},'Publishing'),
    row('Unsaved changes',n?(n+' change'+(n===1?'':'s')+' waiting — drafts stay private until you publish.'):'Everything is saved. Publishing pushes your latest draft live.',
      h('div',{class:'re-setbtns'},
        n?h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{saveDraft();setTimeout(renderMain,400);}},'Save draft'):'',
        n?h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:discardAll},'Discard'):'',
        h('button',{class:'re-btn re-btn-gd re-btn-sm',onclick:publish},'Publish')))));
  dashMain.append(h('div',{class:'re-card re-set-card'},
    h('div',{class:'re-set-h'},'Account & admin'),
    row('Password','Change the password you use to sign in here.',
      h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>openChangePassword()},'Change password')),
    row('Welcome tips','Show the first-run tips again next time you open the editor.',
      h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{ localStorage.removeItem('re-coached'); toast('Tips will show next time you open the editor'); }},'Show tips again'))));
  /* Resets are saved to the draft and the page reloads, so the preview matches exactly.
     Nothing goes live until Publish. */
  const doReset=(what,desc,mut)=>{
    reConfirm(desc+' This updates your draft and reloads the editor — nothing goes live until you publish.',{title:'Reset '+what+'?',okLabel:'Reset'}).then(ok=>{ if(!ok)return;
      mut();
      Promise.resolve(Store.saveDraft(cleanWork())).then(()=>{ toast('Reset saved — reloading…'); setTimeout(()=>location.reload(),500); })
        .catch(e=>toast('Could not save the reset: '+e.message,'err'));
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
    h('div',{class:'re-set-h'},'Reset to defaults'),
    h('p',{class:'re-set-note'},'Made a mess? Put any part of the design back the way it started.'),
    ...resets.map(([what,desc,mut])=>row(what.charAt(0).toUpperCase()+what.slice(1),desc,
      h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>doReset(what,desc,mut)},'Reset')))));
  dashMain.append(h('div',{class:'re-card re-set-card re-set-danger'},
    h('div',{class:'re-set-h'},'Danger zone'),
    row('Delete all blog posts','Removes all '+(WORK.posts||[]).length+' posts from your draft.',
      h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{
        reConfirm('Delete all '+(WORK.posts||[]).length+' blog posts? They disappear from the website on your next publish.',{title:'Delete all posts?',okLabel:'Delete all',danger:true}).then(ok=>{ if(!ok)return;
          WORK.posts=[]; markDirty('posts:all'); API.setOverrides(WORK); renderMain(); toast('All posts removed from the draft'); });
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
  dashMain.append(h('div',{class:'re-main-head'},
    h('button',{class:'re-linkbtn',onclick:()=>{ blogEditId=null; renderMain(); }},'← All posts'),
    h('h1',{},isNew?'New post':'Edit post')));
  const title=h('input',{class:'re-input',value:p.title||'',placeholder:'e.g. KSE-100 outlook for Q3','aria-label':'Post title'});
  const date=h('input',{class:'re-input',type:'date',value:(p.date||'').slice(0,10),'aria-label':'Post date',style:'max-width:200px'});
  let published=p.published!==false&&!isNew;
  const pubSw=h('button',{class:'re-toggle re-siterow'+(published?' on':''),type:'button','aria-pressed':String(published),
    onclick:()=>{ published=!published; pubSw.classList.toggle('on',published); pubSw.setAttribute('aria-pressed',String(published));
      pubLbl.textContent=published?'Live on the website (after you publish)':'Draft — only visible here'; }},
    pubLbl=h('span',{class:'re-siterow-lbl'},published?'Live on the website (after you publish)':'Draft — only visible here'),
    h('span',{class:'re-switch'}));
  var pubLbl;
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
  const excerpt=h('textarea',{class:'re-input',rows:'2',placeholder:'One or two lines shown on the Insights page…','aria-label':'Excerpt'},p.excerpt||'');
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
  const save=h('button',{class:'re-btn re-btn-pri',onclick:()=>{
    if(!title.value.trim()){ toast('Give the post a title','err'); title.focus(); return; }
    const rec={id:p.id,title:title.value.trim(),date:date.value||p.date,cover:coverUrl,excerpt:excerpt.value.trim(),body:API.sanitizePost(body.innerHTML),published};
    const i=(WORK.posts||[]).findIndex(x=>x.id===p.id);
    if(i<0)WORK.posts.push(rec); else WORK.posts[i]=rec;
    markDirty('posts:'+p.id);
    API.setOverrides(WORK);
    blogEditId=null; renderMain();
    toast(published?'Saved — hit Publish to put it on the website':'Draft saved');
  }},'Save post');
  dashMain.append(h('div',{class:'re-card re-post-form'},
    h('div',{class:'re-field'},h('label',{},'Title'),title),
    h('div',{class:'re-post-cols'},
      h('div',{class:'re-field'},h('label',{},'Date'),date),
      h('div',{class:'re-field re-field-grow'},h('label',{},'Status'),pubSw)),
    h('div',{class:'re-field'},h('label',{},'Cover image'),
      h('div',{class:'re-cover-wrap'},coverImg,coverInp,
        h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>coverInp.click()},icon('upload',14),coverUrl?'Replace':'Upload'),
        coverUrl?h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>{ coverUrl=''; coverImg.style.display='none'; }},'Remove'):'')),
    h('div',{class:'re-field'},h('label',{},'Excerpt'),excerpt),
    h('div',{class:'re-field'},h('label',{},'Body'),fmtRow,body,bodyImgInp),
    h('div',{class:'re-modal-foot'},h('button',{class:'re-btn re-btn-ghost',onclick:()=>{ blogEditId=null; renderMain(); }},'Cancel'),save)));
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
  barEls.save=h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:saveDraft},'Save draft');
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
}
function exitStudio(){
  setEditing(false);
  document.body.classList.remove('re-on','re-preview');
  closePanels(); hideFmtBar(); clearImgBtn();
  if(bar)bar.style.display='none';
  clearElBar(); finishDrag();
  if(dirty.size)toast(dirty.size+' unsaved change'+(dirty.size===1?'':'s')+' kept — publish or discard anytime');
  openDashboard();
}
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

/* ════════ CHANGE PASSWORD (modal) — `welcome`=first-time invitee ════════ */
function openChangePassword(welcome){
  const err=h('div',{class:'re-err',role:'alert'});
  const p1=h('input',{class:'re-input',type:'password',placeholder:'At least 8 characters',autocomplete:'new-password'});
  const okBtn=h('button',{class:'re-btn re-btn-pri',onclick:()=>submit()},welcome?'Create my account':'Update password');
  const foot=[okBtn];
  if(!welcome)foot.unshift(h('button',{class:'re-btn re-btn-ghost',onclick:()=>m.close()},'Cancel'));
  const m=reModal({
    title:welcome?'Welcome to Rallys Equities':'Change your password',
    desc:welcome?'You’ve been invited to help manage the website. Pick a password below — that’s all it takes to get started.':'Set your own password for this editor account.',
    body:[h('div',{class:'re-field'},h('label',{},welcome?'Create a password':'New password'),pwWrap(p1)),err],
    foot, dismissible:!welcome, noX:welcome});
  function submit(){ err.textContent='';
    const a=p1.value||'';
    if(a.length<8){ err.textContent='Please use at least 8 characters.'; return; }
    okBtn.disabled=true; okBtn.textContent=welcome?'Setting up…':'Saving…';
    Promise.resolve(Store.changePassword(a)).then(()=>{ m.close();
      if(welcome){ try{history.replaceState(null,'',location.pathname);}catch(e){} if(Store.markInviteAccepted)Promise.resolve(Store.markInviteAccepted()).catch(()=>{}); welcomeGuide(); }
      else toast('Password updated — use it next time you log in.');
    }).catch(e=>{ err.textContent=e.message||'Could not set password.'; okBtn.disabled=false; okBtn.textContent=welcome?'Create my account':'Update password'; });
  }
  p1.addEventListener('keydown',e=>{ if(e.key==='Enter')submit(); });
  setTimeout(()=>p1.focus(),50);
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
  const grip=h('button',{class:'re-elbar-btn re-elbar-grip',draggable:'true',type:'button','aria-label':'Drag to reorder',title:'Drag to move within its area'},icon('grip',14));
  grip.addEventListener('dragstart',e=>{
    if(!elTarget){ e.preventDefault(); return; }
    dragEl=elTarget; dropParent=dragEl.parentElement;
    const pk=keyFor(dropParent); if(pk.indexOf('page:')!==0&&!dropParent.dataset.rekey)dropParent.dataset.rekey=pk;
    API.sigStampKids(dropParent);
    dragEl.classList.add('re-dragging');
    e.dataTransfer.setData('text/re-move','1'); e.dataTransfer.effectAllowed='move';
    try{ e.dataTransfer.setDragImage(dragEl,12,12); }catch(_){}
    elBar.style.display='none';
  });
  grip.addEventListener('dragend',()=>finishDrag());
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
/* sibling reorder while dragging via the grip */
function ensureDropLine(){ if(!dropLine){ dropLine=h('div',{class:'re-dropline re-ui'}); document.body.append(dropLine); } }
function finishDrag(){
  if(dragEl)dragEl.classList.remove('re-dragging');
  dragEl=null; dropParent=null; dropRef=null;
  if(dropLine)dropLine.style.display='none';
}
document.addEventListener('dragover',e=>{
  /* element reorder */
  if(dragEl&&dropParent){
    e.preventDefault(); e.dataTransfer.dropEffect='move';
    const under=document.elementFromPoint(e.clientX,e.clientY);
    let sib=under;
    while(sib&&sib.parentElement!==dropParent)sib=sib.parentElement;
    if(!sib||sib===dragEl){ if(dropLine)dropLine.style.display='none'; dropRef=sib===dragEl?dropRef:null; return; }
    const st=getComputedStyle(dropParent);
    const horiz=(st.display.indexOf('flex')>-1&&st.flexDirection.indexOf('row')===0)||(st.display.indexOf('grid')>-1&&st.gridTemplateColumns.split(' ').length>1);
    const r=sib.getBoundingClientRect();
    const before=horiz?(e.clientX<r.left+r.width/2):(e.clientY<r.top+r.height/2);
    dropRef=before?sib:sib.nextElementSibling;
    ensureDropLine();
    dropLine.style.display='block';
    if(horiz){ dropLine.style.width='3px'; dropLine.style.height=r.height+'px'; dropLine.style.left=(before?r.left-2:r.right-1)+'px'; dropLine.style.top=(r.top+window.scrollY)+'px'; }
    else{ dropLine.style.height='3px'; dropLine.style.width=r.width+'px'; dropLine.style.left=r.left+'px'; dropLine.style.top=((before?r.top:r.bottom)+window.scrollY-1)+'px'; }
    return;
  }
  /* image swap / file-drop targets */
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
  /* commit element reorder */
  if(dragEl&&dropParent){
    e.preventDefault();
    const prevList=[...dropParent.children].map(c=>c.dataset.rekey).filter(Boolean);
    dropParent.insertBefore(dragEl,dropRef||null);
    const pkey=keyFor(dropParent);
    const prevSaved=WORK.order[pkey]||null;
    WORK.order[pkey]=[...dropParent.children].map(c=>c.dataset.rekey).filter(Boolean);
    undo.push({kind:'order',key:pkey,prevSaved,prevList});
    markDirty('order:'+pkey);
    finishDrag();
    toast('Moved — publish to make it permanent');
    return;
  }
  /* image drop: swap with another image, or replace with a dropped file */
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
  if(!barEls.chip)return;
  const n=dirty.size;
  barEls.chip.textContent=n?(n+' unsaved change'+(n===1?'':'s')):'All changes saved';
  barEls.chip.classList.toggle('on',n>0);
  barEls.discard.style.display=n?'':'none';
  barEls.save.disabled=!n;
}
function cleanWork(){ return JSON.parse(JSON.stringify(WORK)); }
function afterSaveRefresh(){ updateSaveBar(); if(dashVisible())renderMain(); }
function saveDraft(){ Promise.resolve(Store.saveDraft(cleanWork())).then(()=>{dirty.clear();afterSaveRefresh();toast('Draft saved (not yet public)');}).catch(e=>toast('Save failed: '+e.message,'err')); }
function publish(){ reConfirm('This makes your changes live for everyone visiting the website.',{title:'Publish changes?',okLabel:'Publish'}).then(ok=>{ if(!ok)return;
  Promise.resolve(Store.publish(cleanWork())).then(()=>{ try{localStorage.setItem('re-content',JSON.stringify(cleanWork()));}catch(e){} dirty.clear();afterSaveRefresh();toast('Published! Your changes are now live.'); }).catch(e=>toast('Publish failed: '+e.message,'err')); }); }
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
Promise.resolve(Store.init()).then(authed=>{ if(authed)onAuthed(); else showLogin(); });
})();
