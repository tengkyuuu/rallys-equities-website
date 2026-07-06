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
const blank=()=>({text:{},img:{},imgMeta:{},theme:{dark:{},light:{}},calcInfo:{},fonts:{}});
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
    async inviteEditor(email){ return await this._fn({email,redirectTo:location.origin+'/admin'}); },
    async revokeInvite(id){ return await this._fn({action:'revoke',id}); },
    async listInvites(){ const{data,error}=await sb.from('invites').select('*').order('created_at',{ascending:false}); if(error)throw new Error(error.message); return data||[]; },
    async markInviteAccepted(){ const{data:{user}}=await sb.auth.getUser(); if(!user)return; await sb.from('invites').update({accepted_at:new Date().toISOString()}).eq('email',(user.email||'').toLowerCase()).is('accepted_at',null); },
    async getDraft(){return await rowData('draft');},
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
function normalize(d){ d=d||{}; return {text:d.text||{},img:d.img||{},imgMeta:d.imgMeta||{},theme:{dark:(d.theme&&d.theme.dark)||{},light:(d.theme&&d.theme.light)||{}},calcInfo:d.calcInfo||{},fonts:d.fonts||{},version:d.version||0}; }
function doLogout(){ Promise.resolve(Store.logout()).then(()=>location.search=location.search.replace(/[?&]edit=1/,'')||''); }

/* ════════ DASHBOARD APP (fullscreen: sidebar + views) ════════ */
let dashEl,dashMain,dashData=[],dashView='overview',dashQuery='',dashFilter='all',dashLoading=false;
const FILTERS=[['all','All'],['unhandled','New'],['contact','Contact'],['complaint','Complaint'],['feedback','Feedback'],['career','Career'],['application','Applications']];
const KIND_LABEL={contact:'Contact',complaint:'Complaint',feedback:'Feedback',career:'Career',application:'Account application'};

function ensureDash(){
  if(dashEl)return;
  const navItem=(id,ic,label,fn,withBadge)=>{
    const badge=withBadge?h('span',{class:'re-nav-badge'}):null;
    return h('button',{class:'re-nav-item','data-nav':id||'',onclick:fn}, icon(ic,18), h('span',{class:'re-nav-lbl'},label), badge||'');
  };
  const side=h('aside',{class:'re-side'},
    h('div',{class:'re-side-brand'},
      h('div',{class:'re-side-logo'},'Rallys Equities'),
      h('div',{class:'re-side-sub'},'Admin')),
    h('nav',{class:'re-side-nav','aria-label':'Admin navigation'},
      navItem('overview','grid','Dashboard',()=>go('overview')),
      navItem('submissions','inbox','Submissions',()=>go('submissions'),true),
      navItem('editors','users','Editors',()=>go('editors')),
      h('div',{class:'re-side-cap'},'Website'),
      navItem('','edit','Edit website',()=>enterStudio({edit:true})),
      navItem('','external','View live site',()=>window.open(location.origin+'/','_blank'))),
    h('div',{class:'re-side-foot'},
      navItem('','key','Change password',()=>openChangePassword()),
      navItem('','logout','Log out',doLogout)));
  dashMain=h('div',{class:'re-main-inner'});
  dashEl=h('div',{class:'re-dash re-ui'},side,h('main',{class:'re-main'},dashMain));
  document.body.append(dashEl);
}
function go(view){ dashView=view; setActiveNav(); renderMain(); dashEl.querySelector('.re-main').scrollTop=0; }
function setActiveNav(){ dashEl&&dashEl.querySelectorAll('.re-nav-item[data-nav]').forEach(b=>{const on=b.getAttribute('data-nav')===dashView;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}); }
async function openDashboard(){
  ensureDash();
  dashEl.style.display='flex'; document.body.classList.add('re-dash-open');
  setActiveNav(); renderMain();
  await reloadSubs();
}
function closeDashboard(){ if(dashEl)dashEl.style.display='none'; document.body.classList.remove('re-dash-open'); }
function dashVisible(){ return dashEl&&dashEl.style.display!=='none'; }
async function reloadSubs(){
  if(Store.mode!=='supabase'){ dashData=[]; updateNavBadge(); renderMain(); return; }
  dashLoading=true; renderMain();
  try{ dashData=await Store.listSubmissions(); }catch(e){ dashData=[]; }
  dashLoading=false; updateNavBadge(); renderMain();
}
function dashStats(){ const wk=Date.now()-7*864e5; let unhandled=0,week=0; const byKind={}; dashData.forEach(r=>{ if(!r.handled)unhandled++; byKind[r.kind]=(byKind[r.kind]||0)+1; const t=Date.parse(r.created_at||''); if(t&&t>=wk)week++; }); return {total:dashData.length,unhandled,week,byKind}; }
function filterCount(k){ const s=dashStats(); if(k==='all')return s.total; if(k==='unhandled')return s.unhandled; return s.byKind[k]||0; }
function filteredSubs(){ const q=dashQuery.trim().toLowerCase(); return dashData.filter(r=>{ if(dashFilter==='unhandled'){ if(r.handled)return false; } else if(dashFilter!=='all' && r.kind!==dashFilter)return false; if(!q)return true; return (JSON.stringify(r.data||{})+' '+(r.reference||'')).toLowerCase().includes(q); }); }
function updateNavBadge(){ const b=dashEl&&dashEl.querySelector('[data-nav="submissions"] .re-nav-badge'); if(!b)return; const n=dashStats().unhandled; b.textContent=n||''; b.style.display=n?'inline-flex':'none'; }
function emptyState(msg){ return h('div',{class:'re-empty'},icon('inbox',30),h('p',{},msg||'No submissions yet. When a visitor sends a form, it appears here.')); }
function skel(n){ const w=h('div',{class:'re-sub-list'}); for(let i=0;i<n;i++)w.append(h('div',{class:'re-skel'})); return w; }

function renderMain(){ if(!dashMain||!dashVisible())return; dashMain.innerHTML=''; ({overview:renderOverview,submissions:renderSubs,editors:renderEditors}[dashView]||renderOverview)(); }

/* ── Overview ── */
function kpi(label,value,ic,accent){ return h('div',{class:'re-kpi'+(accent?' on':'')}, h('span',{class:'re-kpi-ic'},icon(ic,18)), h('div',{class:'re-kpi-body'}, h('div',{class:'re-kpi-val'},String(value)), h('div',{class:'re-kpi-lbl'},label))); }
function qa(ic,title,desc,fn){ return h('button',{class:'re-qa',onclick:fn},
  h('span',{class:'re-qa-ic'},icon(ic,19)),
  h('span',{class:'re-qa-tx'},h('span',{class:'re-qa-t'},title),h('span',{class:'re-qa-d'},desc)),
  h('span',{class:'re-qa-go'},icon('chevr',16))); }
function renderOverview(){
  const s=dashStats();
  dashMain.append(h('div',{class:'re-main-head'},h('h1',{},'Dashboard'),h('p',{},'Your website and incoming leads at a glance.')));
  if(dirty.size)dashMain.append(h('div',{class:'re-banner'},
    icon('alert',18),
    h('span',{class:'re-banner-tx'},h('b',{},dirty.size+' unsaved change'+(dirty.size===1?'':'s')),' — private until you publish.'),
    h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>enterStudio({edit:true})},'Continue editing'),
    h('button',{class:'re-btn re-btn-gd re-btn-sm',onclick:publish},'Publish now')));
  dashMain.append(h('div',{class:'re-kpis'},
    kpi('Total submissions',s.total,'inbox'),
    kpi('New / unread',s.unhandled,'clock',s.unhandled>0),
    kpi('Last 7 days',s.week,'refresh'),
    kpi('Applications',s.byKind.application||0,'users')));
  dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'Manage the website')));
  dashMain.append(h('div',{class:'re-qas'},
    qa('edit','Edit content','Click any text or image on the page and change it in place.',()=>enterStudio({edit:true})),
    qa('image','Photos','See every photo on the page and swap it in one click.',()=>enterStudio({edit:false,panel:'photos'})),
    qa('palette','Theme & fonts','Adjust the site’s colors and typography.',()=>enterStudio({edit:false,panel:'theme'}))));
  dashMain.append(h('div',{class:'re-sec-head'},h('h2',{},'Recent submissions'),
    dashData.length?h('button',{class:'re-linkbtn',onclick:()=>go('submissions')},'View all'):''));
  if(dashLoading){ dashMain.append(skel(2)); return; }
  const list=h('div',{class:'re-sub-list'});
  const recent=dashData.slice(0,4);
  if(!recent.length)list.append(emptyState()); else recent.forEach(r=>list.append(subCard(r)));
  dashMain.append(list);
}

/* ── Submissions ── */
function renderSubs(){
  const s=dashStats();
  dashMain.append(h('div',{class:'re-main-head'},h('h1',{},'Submissions'),h('p',{},dashLoading?'Loading…':s.total+' total · '+s.unhandled+' new')));
  const inp=h('input',{class:'re-search-input',type:'search',placeholder:'Search name, email, message…',value:dashQuery,'aria-label':'Search submissions'});
  inp.addEventListener('input',()=>{ dashQuery=inp.value; drawList(); });
  dashMain.append(h('div',{class:'re-subs-tools'},
    h('div',{class:'re-search'},icon('search',16),inp),
    iconBtn('refresh','Refresh submissions',reloadSubs)));
  const tabs=h('div',{class:'re-filters'});
  FILTERS.forEach(([k,lbl])=>{
    const b=h('button',{class:'re-filter'+(dashFilter===k?' on':''),onclick:()=>{ dashFilter=k; tabs.querySelectorAll('.re-filter').forEach(x=>x.classList.remove('on')); b.classList.add('on'); drawList(); }},lbl+' ('+filterCount(k)+')');
    tabs.append(b);
  });
  dashMain.append(tabs);
  const listWrap=h('div',{class:'re-sub-list'}); dashMain.append(listWrap);
  function drawList(){
    listWrap.innerHTML='';
    if(dashLoading){ listWrap.append(skel(3)); return; }
    const rows=filteredSubs();
    if(!rows.length){ listWrap.append(emptyState(dashData.length?'Nothing matches this filter.':undefined)); return; }
    rows.forEach(r=>listWrap.append(subCard(r)));
  }
  drawList();
}
function prettyLabel(k){return k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());}
function fieldRows(obj){
  const order=['name','firstName','lastName','email','phone','mobile','subject','category','position','message','coverLetter','reference','cnic','dob','gender','address','city','province','employment','employer','income','sourceOfFunds','bank','iban','experience','objective','accountType','riskTolerance','language','services'];
  const has=k=>obj[k]!=null&&String(obj[k]).trim()!=='';
  const keys=[...order.filter(has),...Object.keys(obj).filter(k=>order.indexOf(k)<0&&has(k))];
  return keys.map(k=>h('div',{class:'re-sub-row'},h('span',{class:'re-sub-k'},prettyLabel(k)),h('span',{class:'re-sub-v'},String(obj[k]))));
}
function subCard(r){
  const d=r.data||{};
  const when=(r.created_at||'').replace('T',' ').slice(0,16);
  const name=d.name||[d.firstName,d.lastName].filter(Boolean).join(' ')||d.email||'—';
  const chk=h('input',{type:'checkbox','aria-label':'Mark handled'}); chk.checked=!!r.handled;
  const card=h('div',{class:'re-sub'+(r.handled?' done':'')});
  chk.addEventListener('change',()=>{ Store.setHandled(r.id,chk.checked); r.handled=chk.checked; card.classList.toggle('done',chk.checked); updateNavBadge(); });
  const rows=fieldRows(d);
  const fields=h('div',{class:'re-sub-fields'});
  if(rows.length>5){
    rows.slice(0,4).forEach(x=>fields.append(x));
    const more=h('div',{class:'re-sub-more'}); rows.slice(4).forEach(x=>more.append(x));
    const lbl=h('span',{},'Show all '+rows.length+' fields');
    const tog=h('button',{class:'re-sub-expand',onclick:()=>{ const open=more.classList.toggle('open'); tog.classList.toggle('open',open); lbl.textContent=open?'Show less':'Show all '+rows.length+' fields'; }},icon('chevron',14),lbl);
    fields.append(more,tog);
  } else rows.forEach(x=>fields.append(x));
  const files=(r.files||[]).map(f=>h('button',{class:'re-file',onclick:async ev=>{ev.preventDefault();const b=ev.currentTarget;const old=b.textContent;b.textContent='opening…';const u=await Store.signedUrl(f.path);b.textContent=old;if(u)window.open(u,'_blank');else toast('Could not open file','err');}}, icon('download',13), (f.field||'file')));
  card.append(
    h('div',{class:'re-sub-top'},
      h('span',{class:'re-badge re-k-'+r.kind},KIND_LABEL[r.kind]||r.kind),
      h('span',{class:'re-sub-name'},name),
      r.reference?h('span',{class:'re-sub-ref',title:'Reference'},r.reference):'',
      h('span',{class:'re-sub-when'},when)),
    fields,
    files.length?h('div',{class:'re-sub-files'},h('span',{class:'re-sub-k'},'Files'),h('span',{},...files)):'',
    h('div',{class:'re-sub-foot'},
      h('label',{class:'re-sub-handled'},chk,'Handled'),
      h('button',{class:'re-sub-del',onclick:async()=>{ if(!(await reConfirm('This permanently deletes this submission.',{title:'Delete submission?',okLabel:'Delete',danger:true})))return; try{ await Store.deleteSubmission(r.id); card.remove(); dashData=dashData.filter(x=>x.id!==r.id); updateNavBadge(); toast('Submission deleted'); }catch(e){ toast('Delete failed: '+e.message,'err'); } }}, icon('trash',13),'Delete')));
  return card;
}

/* ── Editors (invite by link; Resend email needs a verified domain, so links are the flow) ── */
function inviteStatus(inv){ if(inv.accepted_at)return'Accepted'; if(inv.expires_at&&new Date(inv.expires_at)<=new Date())return'Expired'; return'Pending'; }
function renderEditors(){
  dashMain.append(h('div',{class:'re-main-head'},h('h1',{},'Editors'),h('p',{},'Give a teammate access — create an invite link and send it over WhatsApp or email.')));
  const err=h('div',{class:'re-err',role:'alert'});
  const em=h('input',{class:'re-input',type:'email',placeholder:'teammate@gmail.com','aria-label':'Teammate email'});
  const btn=h('button',{class:'re-btn re-btn-pri',onclick:()=>create()},'Create invite link');
  const linkBox=h('div',{class:'re-linkbox'});
  const listWrap=h('div',{class:'re-inv-list'});
  const cpy=(text,label,inp)=>{ if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>toast(label+' copied')).catch(()=>inp&&inp.select());}else if(inp){inp.select();} };
  const showLink=(url,email)=>{
    linkBox.innerHTML='';
    const inp=h('input',{class:'re-input re-linkinput',value:url,readonly:'readonly','aria-label':'Invite link'});
    const msg='Hi! You’ve been invited to help manage the Rallys Equities website. Tap this link to set your password and get started (valid ~24 hours):\n\n'+url;
    linkBox.append(
      h('div',{class:'re-linkbox-h'},icon('check',14),'Invite link ready for '+email),
      h('div',{class:'re-linkbox-note'},'Send it however you like — “Copy message” gives a friendly note plus the link, ready for WhatsApp or email. Valid ~24 hours.'),
      h('div',{class:'re-linkrow'},inp,
        h('button',{class:'re-btn re-btn-ghost re-btn-sm',onclick:()=>cpy(url,'Link',inp)},icon('copy',14),'Copy link'),
        h('button',{class:'re-btn re-btn-pri re-btn-sm',onclick:()=>cpy(msg,'Message',inp)},icon('mail',14),'Copy message')));
    linkBox.style.display='block';
  };
  function create(){ err.textContent=''; const e=(em.value||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ err.textContent='Enter a valid email address.'; return; }
    btn.disabled=true; btn.textContent='Creating…';
    Promise.resolve(Store.inviteEditor(e)).then(r=>{ btn.disabled=false; btn.textContent='Create invite link'; em.value='';
      if(r&&r.link)showLink(r.link,e); else toast('Invite created'); loadList(); })
      .catch(x=>{ err.textContent=x.message||'Could not create invite.'; btn.disabled=false; btn.textContent='Create invite link'; });
  }
  em.addEventListener('keydown',e=>{ if(e.key==='Enter')create(); });
  function loadList(){ listWrap.innerHTML=''; listWrap.append(h('div',{class:'re-inv-empty'},'Loading…'));
    Promise.resolve(Store.listInvites()).then(rows=>{ listWrap.innerHTML='';
      if(!rows.length){ listWrap.append(h('div',{class:'re-inv-empty'},'No invites yet.')); return; }
      rows.forEach(inv=>{ const st=inviteStatus(inv); const acts=[];
        if(st!=='Accepted'){
          acts.push(h('button',{class:'re-inv-act',onclick:()=>{ Promise.resolve(Store.inviteEditor(inv.email)).then(r=>{ if(r&&r.link)showLink(r.link,inv.email); loadList(); }).catch(x=>toast(x.message,'err')); }},icon('refresh',12),'New link'));
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
  updateSaveBar();
  maybeCoach();
}
function exitStudio(){
  setEditing(false);
  document.body.classList.remove('re-on','re-preview');
  closePanels(); hideFmtBar(); clearImgBtn();
  if(bar)bar.style.display='none';
  if(dirty.size)toast(dirty.size+' unsaved change'+(dirty.size===1?'':'s')+' kept — publish or discard anytime');
  openDashboard();
}
function closePanels(){ [photosPanel,colorPanel].forEach(p=>p&&p.classList.remove('open')); }
function setEditing(v){
  editing=v;
  document.body.classList.toggle('re-editing',v);
  if(barEls.editSw){ barEls.editSw.classList.toggle('on',v); barEls.editSw.setAttribute('aria-pressed',v?'true':'false'); }
  if(!v){ clearImgBtn(); clearHoverText(); hideFmtBar(); }
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
  if(!el||el.closest(LOCKED))return null;
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

function openMedia(img){
  const key=img.dataset.editImg||API.getEditKey(img);
  if(!img.dataset.editImg)img.dataset.editImg=key;
  const lib=[...new Set([...document.images].map(i=>i.getAttribute('src')).filter(s=>s&&/^assets\//.test(s)))].sort();
  const apply=url=>{ undo.push({kind:'img',key,prev:WORK.img[key]}); WORK.img[key]=url; img.src=url; img.classList.add('re-dirty'); markDirty('img:'+key); m.close(); toast('Image updated'); };
  const handleFile=f=>{ if(!f)return; if(!/^image\/(png|jpeg|webp)$/.test(f.type)){toast('Use a PNG, JPG or WEBP image','err');return;} if(f.size>5e6){toast('Max 5 MB','err');return;} toast('Uploading…'); Store.uploadImage(f).then(apply).catch(err=>toast('Upload failed: '+err.message,'err')); };
  const fileInp=h('input',{type:'file',accept:'image/png,image/jpeg,image/webp',style:'display:none',onchange:e=>handleFile(e.target.files[0])});
  const drop=h('div',{class:'re-drop',role:'button',tabindex:'0','aria-label':'Upload an image',onclick:()=>fileInp.click(),
    onkeydown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInp.click();}},
    ondragover:e=>{e.preventDefault();drop.classList.add('over');},
    ondragleave:()=>drop.classList.remove('over'),
    ondrop:e=>{e.preventDefault();drop.classList.remove('over');handleFile(e.dataTransfer.files&&e.dataTransfer.files[0]);}},
    icon('upload',22),h('span',{class:'re-drop-t'},'Drop an image here, or click to upload'),h('span',{class:'re-drop-sub'},'PNG · JPG · WEBP · max 5 MB'));
  const altInp=h('input',{class:'re-input',placeholder:'Describe the image (for accessibility)',value:(WORK.imgMeta[key]&&WORK.imgMeta[key].alt)||img.getAttribute('alt')||''});
  altInp.addEventListener('input',()=>{WORK.imgMeta[key]=Object.assign({},WORK.imgMeta[key],{alt:altInp.value});img.alt=altInp.value;markDirty('imgMeta:'+key);});
  const grid=h('div',{class:'re-grid'},lib.map(src=>h('img',{src,loading:'lazy',title:src,alt:src.split('/').pop(),onclick:()=>apply(src)})));
  const m=reModal({title:'Change image',cls:'re-media',
    body:[fileInp,drop,
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
    body.append(h('div',{class:'re-photo-row'},
      h('img',{class:'re-photo-thumb',src:img.currentSrc||img.src,loading:'lazy',alt:name,onclick:change}),
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
  Store.getDraft().then(d=>{ WORK=normalize(d); API.setOverrides(WORK); API.refreshCalcInfo&&API.refreshCalcInfo(); document.querySelectorAll('.re-dirty').forEach(n=>n.classList.remove('re-dirty')); dirty.clear();afterSaveRefresh();toast('Changes discarded'); }); }); }

/* global undo (Ctrl/Cmd-Z) */
document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&editing){ const u=undo.pop(); if(!u)return; e.preventDefault();
  if(u.kind==='text'){ if(u.prev==null)delete WORK.text[u.key];else WORK.text[u.key]=u.prev; }
  if(u.kind==='img'){ if(u.prev==null)delete WORK.img[u.key];else WORK.img[u.key]=u.prev; }
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
