/* ════════════════════════════════════════════════════════════════
   Rallys Equities — Visual Content Editor (admin only; loaded via ?edit=1)
   Phases: 2 Colors · 3 Text · 4 Images/Media. Works with Supabase when
   configured, else a local (localStorage) preview store so it's testable.
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
/* Locked = live/dynamic widgets + the editor's own UI. Everything else (incl. nav labels & logo) is editable. */
const LOCKED='.pcard,#mktTbody,#tickerWrap,#heroStocks,#perfGrid,.ticker,.live-badge,.theme-toggle,#toTop,.wa-fab,.ham,.re-bar,.re-panel,.re-savebar,.re-overlay,.re-fmt,.re-img-btn,.re-coach,.re-toast,.cnt';
function toast(msg){let t=$('.re-toast');if(!t){t=h('div',{class:'re-toast'});document.body.append(t);}t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);}
const debounce=(fn,ms=120)=>{let id;return(...a)=>{clearTimeout(id);id=setTimeout(()=>fn(...a),ms);};};

/* ---------- working state ---------- */
const blank=()=>({text:{},img:{},imgMeta:{},theme:{dark:{},light:{}},calcInfo:{}});
let WORK=blank();          // full working overrides (loaded from draft)
const dirty=new Set();     // "kind:key" changed this session
const undo=[];             // {kind,key,prev}
let editing=false;

function markDirty(id){ dirty.add(id); updateSaveBar(); }
function pendingCount(){ return dirty.size; }

/* ════════ STORE ADAPTERS ════════ */
function localStore(){
  const get=k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}};
  const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){toast('Storage full (image too large for local preview)');}};
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

/* ════════ LOGIN ════════ */
function showLogin(){
  const err=h('div',{class:'re-err'});
  const inputs={};
  const fields=Store.loginFields.map(f=>{const inp=h('input',{class:'re-input',type:f.type,placeholder:f.ph});inputs[f.id]=inp;return h('div',{class:'re-field'},h('label',{},f.label),inp);});
  const submit=()=>{const v={};for(const k in inputs)v[k]=inputs[k].value;err.textContent='';
    Store.login(v).then(()=>{overlay.remove();onAuthed();}).catch(e=>{err.textContent=e.message||'Login failed';});};
  fields.forEach(f=>$('input',f).addEventListener('keydown',e=>{if(e.key==='Enter')submit();}));
  const card=h('div',{class:'re-modal'},
    h('h2',{},'Rallys Equities — Editor'),
    h('p',{}, Store.mode==='supabase'?'Sign in to edit your website.':'Local preview mode (Supabase not configured yet). Enter any passphrase to try the editor — changes save to this browser only.'),
    ...fields, err,
    h('button',{class:'re-btn re-btn-pri',onclick:submit}, Store.mode==='supabase'?'Log in':'Enter editor'));
  const overlay=h('div',{class:'re-overlay'},card);
  document.body.append(overlay);
  setTimeout(()=>{const i=$('input',overlay);i&&i.focus();},50);
}

/* ════════ AFTER LOGIN ════════ */
function onAuthed(){
  document.body.classList.add('re-on');
  buildBar();
  buildSaveBar();
  Store.getDraft().then(d=>{ WORK=normalize(d); API.setOverrides(WORK); API.refreshCalcInfo&&API.refreshCalcInfo(); toast('Loaded your latest draft'); if(INVITE_FLOW)setTimeout(()=>openChangePassword(true),500); else maybeCoach(); })
    .catch(e=>{ console.warn(e); WORK=blank(); if(INVITE_FLOW)setTimeout(()=>openChangePassword(true),500); });
}
function normalize(d){ d=d||{}; return {text:d.text||{},img:d.img||{},imgMeta:d.imgMeta||{},theme:{dark:(d.theme&&d.theme.dark)||{},light:(d.theme&&d.theme.light)||{}},calcInfo:d.calcInfo||{},version:d.version||0}; }

/* ---------- top bar ---------- */
let editToggle;
function buildBar(){
  editToggle=h('div',{class:'re-toggle',onclick:toggleEditing}, h('span',{class:'re-switch'}), 'Edit mode');
  const bar=h('div',{class:'re-bar re-ui'},
    h('span',{class:'re-logo'},'RE Editor'),
    editToggle,
    h('span',{class:'re-spacer'}),
    h('button',{class:'re-btn re-btn-ghost',onclick:openInbox},'📥 Submissions'),
    h('button',{class:'re-btn re-btn-ghost',onclick:openPhotos},'🖼 Photos'),
    h('button',{class:'re-btn re-btn-ghost',onclick:openColors},'🎨 Colors'),
    h('button',{class:'re-btn re-btn-ghost',onclick:()=>{document.body.classList.toggle('re-preview');toast(document.body.classList.contains('re-preview')?'Preview (visitor view)':'Editing view');}},'Preview'),
    h('button',{class:'re-btn re-btn-ghost',onclick:openInvite},'✉️ Invite'),
    h('button',{class:'re-btn re-btn-ghost',onclick:()=>openChangePassword()},'🔑 Password'),
    h('button',{class:'re-btn re-btn-ghost',onclick:doLogout},'Log out'));
  document.body.append(bar);
}
function doLogout(){ Promise.resolve(Store.logout()).then(()=>location.search=location.search.replace(/[?&]edit=1/,'')||''); }

/* Set a password — single field + show toggle. `welcome`=first-time invitee. */
function openChangePassword(welcome){
  const err=h('div',{class:'re-err'});
  const p1=h('input',{class:'re-input',type:'password',placeholder:'At least 8 characters'});
  const show=h('button',{class:'re-eye',type:'button',onclick:()=>{ const t=p1.type==='password'; p1.type=t?'text':'password'; show.textContent=t?'Hide':'Show'; p1.focus(); }},'Show');
  const okBtn=h('button',{class:'re-btn re-btn-pri',style:'width:auto',onclick:()=>submit()},welcome?'Create my account':'Update password');
  const submit=()=>{ err.textContent='';
    const a=p1.value||'';
    if(a.length<8){ err.textContent='Please use at least 8 characters.'; return; }
    okBtn.disabled=true; okBtn.textContent=welcome?'Setting up…':'Saving…';
    Promise.resolve(Store.changePassword(a)).then(()=>{ overlay.remove();
      if(welcome){ try{history.replaceState(null,'',location.pathname);}catch(e){} if(Store.markInviteAccepted)Promise.resolve(Store.markInviteAccepted()).catch(()=>{}); welcomeGuide(); }
      else toast('Password updated — use it next time you log in.');
    }).catch(e=>{ err.textContent=e.message||'Could not set password.'; okBtn.disabled=false; okBtn.textContent=welcome?'Create my account':'Update password'; });
  };
  p1.addEventListener('keydown',e=>{ if(e.key==='Enter')submit(); });
  const foot=[okBtn]; if(!welcome)foot.unshift(h('button',{class:'re-btn re-btn-ghost',onclick:()=>overlay.remove()},'Cancel'));
  const card=h('div',{class:'re-modal'},
    h('h2',{},welcome?'Welcome! 👋':'Change your password'),
    h('p',{},welcome?'You’ve been invited to help manage the Rallys Equities website. Just pick a password below — that’s all it takes to get started.':'Set your own password for this editor account.'),
    h('div',{class:'re-field'},h('label',{},welcome?'Create a password':'New password'),h('div',{class:'re-pwrow'},p1,show)), err,
    h('div',{style:'display:flex;gap:8px;justify-content:flex-end;margin-top:4px'},...foot));
  const overlay=h('div',{class:'re-overlay',onclick:e=>{ if(e.target===overlay&&!welcome)overlay.remove(); }},card);
  document.body.append(overlay);
  setTimeout(()=>p1.focus(),50);
}

/* After an invitee sets their password: turn on edit mode + show a short how-to. */
function welcomeGuide(){
  if(!editing)toggleEditing();
  const c=h('div',{class:'re-coach re-ui',html:'<b>You’re all set! 🎉</b><br>Here’s how to edit the website:<br>• <b>Click any highlighted text</b> to change it.<br>• Use <b>🖼 Photos</b> at the top to swap an image.<br>• Hit <b>Publish</b> when you want your changes to go live.'});
  c.append(h('button',{class:'re-btn re-btn-pri',onclick:()=>c.remove()},'Start editing'));
  document.body.append(c);
}

/* Invite editors: create a shareable link, list existing invites, revoke. */
function inviteStatus(inv){ if(inv.accepted_at)return'Accepted'; if(inv.expires_at&&new Date(inv.expires_at)<=new Date())return'Expired'; return'Pending'; }
function openInvite(){
  const err=h('div',{class:'re-err'});
  const em=h('input',{class:'re-input',type:'email',placeholder:'teammate@gmail.com'});
  const linkBox=h('div',{class:'re-linkbox'});
  const listWrap=h('div',{class:'re-inv-list'});
  const showLink=(url,email)=>{
    linkBox.innerHTML='';
    const inp=h('input',{class:'re-input re-linkinput',value:url,readonly:'readonly'});
    const msg='Hi! You’ve been invited to help manage the Rallys Equities website. Tap this link to set your password and get started (valid ~24 hours):\n\n'+url;
    const cp=(text,label)=>{ if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>toast(label+' copied')).catch(()=>inp.select());}else{inp.select();} };
    linkBox.append(
      h('div',{class:'re-linkbox-h'},'Invite link for '+email),
      h('div',{class:'re-linkbox-note'},'“Copy message” gives you a friendly note + link to paste into WhatsApp or email — easiest for them. Valid ~24 hours.'),
      h('div',{class:'re-linkrow'},inp,
        h('button',{class:'re-btn re-btn-gd',style:'width:auto',onclick:()=>cp(url,'Link')},'Copy link')),
      h('div',{style:'margin-top:8px;text-align:right'},
        h('button',{class:'re-btn re-btn-pri',style:'width:auto',onclick:()=>cp(msg,'Message')},'Copy a ready-to-send message ✉')));
    linkBox.style.display='block';
  };
  const btn=h('button',{class:'re-btn re-btn-pri',style:'width:auto',onclick:()=>create()},'Create invite link');
  const create=()=>{ err.textContent=''; const e=(em.value||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ err.textContent='Enter a valid email address.'; return; }
    btn.disabled=true; btn.textContent='Creating…';
    Promise.resolve(Store.inviteEditor(e)).then(r=>{ btn.disabled=false; btn.textContent='Create invite link'; em.value='';
      if(r&&r.link)showLink(r.link,e); else toast('Invite created'); loadList(); })
      .catch(x=>{ err.textContent=x.message||'Could not create invite.'; btn.disabled=false; btn.textContent='Create invite link'; });
  };
  em.addEventListener('keydown',e=>{ if(e.key==='Enter')create(); });
  const loadList=()=>{ listWrap.innerHTML=''; listWrap.append(h('div',{class:'re-inv-empty'},'Loading…'));
    Promise.resolve(Store.listInvites()).then(rows=>{ listWrap.innerHTML='';
      if(!rows.length){ listWrap.append(h('div',{class:'re-inv-empty'},'No invites yet.')); return; }
      rows.forEach(inv=>{ const st=inviteStatus(inv); const acts=[];
        if(st!=='Accepted')acts.push(h('button',{class:'re-inv-act',title:'Get a fresh link',onclick:()=>{ Promise.resolve(Store.inviteEditor(inv.email)).then(r=>{ if(r&&r.link)showLink(r.link,inv.email); loadList(); }).catch(x=>toast(x.message)); }},'↻ Link'));
        acts.push(h('button',{class:'re-inv-act re-inv-del',onclick:()=>{ if(!confirm('Revoke the invite for '+inv.email+'?'))return; Promise.resolve(Store.revokeInvite(inv.id)).then(()=>{ toast('Invite revoked'); loadList(); }).catch(x=>toast(x.message)); }},'Revoke'));
        listWrap.append(h('div',{class:'re-inv-row'},
          h('span',{class:'re-inv-email',title:inv.email},inv.email),
          h('span',{class:'re-inv-badge re-inv-'+st.toLowerCase()},st),
          h('span',{class:'re-inv-actions'},...acts)));
      });
    }).catch(x=>{ listWrap.innerHTML=''; listWrap.append(h('div',{class:'re-inv-empty'},'Couldn’t load invites: '+x.message)); });
  };
  const card=h('div',{class:'re-modal re-invite'},
    h('h2',{},'Invite editors'),
    h('p',{},'Create a link and send it to your teammate — they set their own password, then can edit the site.'),
    h('div',{class:'re-field'},h('label',{},'Their email'),em), err,
    h('div',{style:'display:flex;justify-content:flex-end'},btn),
    linkBox,
    h('div',{class:'re-inv-head'},'Invites'), listWrap,
    h('div',{style:'display:flex;justify-content:flex-end;margin-top:14px'},h('button',{class:'re-btn re-btn-ghost',onclick:()=>overlay.remove()},'Close')));
  const overlay=h('div',{class:'re-overlay',onclick:e=>{ if(e.target===overlay)overlay.remove(); }},card);
  document.body.append(overlay);
  setTimeout(()=>em.focus(),50); loadList();
}

function toggleEditing(){
  editing=!editing;
  document.body.classList.toggle('re-editing',editing);
  editToggle.classList.toggle('on',editing);
  if(editing){ toast('Click any text to edit · hover an image to replace it'); }
  else { clearImgBtn(); clearHoverText(); }
}

/* ════════ PHASE 3: TEXT EDITING ════════ */
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
  if(e.target.closest('.re-ui,.re-fmt,.re-img-btn,.re-panel,.re-savebar,.re-overlay,.re-bar'))return;
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
  fmtBar=h('div',{class:'re-fmt re-ui'},
    h('button',{title:'Bold',onmousedown:e=>{e.preventDefault();cmd('bold');},html:'<b>B</b>'}),
    h('button',{title:'Italic',onmousedown:e=>{e.preventDefault();cmd('italic');},html:'<i>I</i>'}),
    h('button',{title:'Underline',onmousedown:e=>{e.preventDefault();cmd('underline');},html:'<u>U</u>'}),
    h('button',{title:'Link',onmousedown:e=>{e.preventDefault();const u=prompt('Link URL (https://...)');if(u)document.execCommand('createLink',false,u);el.focus();},html:'🔗'}),
    h('button',{title:'Clear formatting',onmousedown:e=>{e.preventDefault();document.execCommand('removeFormat',false);document.execCommand('unlink',false);el.focus();},html:'✕'}));
  document.body.append(fmtBar);
  const r=el.getBoundingClientRect();
  fmtBar.style.left=Math.max(8,r.left)+'px';
  fmtBar.style.top=Math.max(54,r.top+window.scrollY-40)+'px';
}
function hideFmtBar(){ if(fmtBar){fmtBar.remove();fmtBar=null;} }

/* ════════ PHASE 4: IMAGE / MEDIA ════════ */
let imgBtn,imgHoverEl;
document.addEventListener('mousemove',e=>{
  if(!editing||document.body.classList.contains('re-preview'))return;
  const img=e.target.closest('img');                 // ANY image is replaceable
  if(img&&!img.closest(LOCKED)&&!img.closest('.re-ui')){ if(img!==imgHoverEl){imgHoverEl=img;positionImgBtn(img);} }
  else if(!img&&imgHoverEl&&!e.target.closest('.re-img-btn')){ clearImgBtn(); }
});
function positionImgBtn(img){
  if(!imgBtn){imgBtn=h('button',{class:'re-img-btn re-ui',onclick:()=>openMedia(imgHoverEl)},'📷 Change image');document.body.append(imgBtn);}
  const r=img.getBoundingClientRect();
  imgBtn.style.left=(r.left+r.width/2)+'px';
  imgBtn.style.top=(r.top+window.scrollY+r.height/2)+'px';
  imgBtn.style.display='block';
}
function clearImgBtn(){ if(imgBtn)imgBtn.style.display='none'; imgHoverEl=null; }

/* live "this text is editable" highlight while hovering in edit mode */
let hoverText;
function clearHoverText(){ if(hoverText){hoverText.classList.remove('re-hoverable');hoverText=null;} }
document.addEventListener('mousemove',e=>{
  if(!editing||document.body.classList.contains('re-preview')){ clearHoverText(); return; }
  if(e.target.closest('.re-ui,.re-bar,.re-panel,.re-fmt,.re-img-btn,.re-savebar,.re-overlay,.re-coach')){ clearHoverText(); return; }
  const t=eligibleText(e.target);
  if(t!==hoverText){ clearHoverText(); if(t&&t.getAttribute('contenteditable')!=='true'){ hoverText=t; t.classList.add('re-hoverable'); } }
});

function openMedia(img){
  const key=img.dataset.editImg||API.getEditKey(img);
  if(!img.dataset.editImg)img.dataset.editImg=key;
  const lib=[...new Set([...document.images].map(i=>i.getAttribute('src')).filter(s=>s&&/^assets\//.test(s)))].sort();
  const apply=url=>{ undo.push({kind:'img',key,prev:WORK.img[key]}); WORK.img[key]=url; img.src=url; img.classList.add('re-dirty'); markDirty('img:'+key); overlay.remove(); toast('Image updated'); };
  const fileInp=h('input',{type:'file',accept:'image/png,image/jpeg,image/webp',style:'display:none',onchange:e=>{const f=e.target.files[0];if(!f)return;if(f.size>5e6){toast('Max 5 MB');return;}toast('Uploading…');Store.uploadImage(f).then(apply).catch(err=>toast('Upload failed: '+err.message));}});
  const drop=h('div',{class:'re-drop',onclick:()=>fileInp.click()},'⬆ Click to upload an image (PNG/JPG/WEBP, max 5 MB)');
  const altInp=h('input',{class:'re-input',placeholder:'Alt text (for accessibility)',value:(WORK.imgMeta[key]&&WORK.imgMeta[key].alt)||img.getAttribute('alt')||''});
  altInp.addEventListener('input',()=>{WORK.imgMeta[key]=Object.assign({},WORK.imgMeta[key],{alt:altInp.value});img.alt=altInp.value;markDirty('imgMeta:'+key);});
  const grid=h('div',{class:'re-grid'},lib.map(src=>h('img',{src,loading:'lazy',title:src,onclick:()=>apply(src)})));
  const card=h('div',{class:'re-modal re-media'},
    h('h2',{},'Change image'),
    h('div',{class:'re-field'},fileInp,drop),
    h('div',{class:'re-field'},h('label',{},'Or pick from your media library'),grid),
    h('div',{class:'re-field'},h('label',{},'Alt text'),altInp),
    h('div',{style:'display:flex;gap:8px;justify-content:flex-end'},h('button',{class:'re-btn re-btn-ghost',onclick:()=>overlay.remove()},'Cancel')));
  const overlay=h('div',{class:'re-overlay',onclick:e=>{if(e.target===overlay)overlay.remove();}},card);
  document.body.append(overlay);
}

/* ════════ PHOTOS PANEL — list every changeable image on the page, one-click replace ════════ */
let photosPanel;
function openPhotos(){
  if(!photosPanel){
    const head=h('div',{class:'re-panel-head'},h('h3',{},'Photos'),
      h('div',{},h('button',{class:'re-btn re-btn-ghost',title:'Refresh',onclick:loadPhotos},'↻'),
        h('button',{class:'re-btn re-btn-ghost',onclick:()=>photosPanel.classList.remove('open')},'✕')));
    photosPanel=h('div',{class:'re-panel re-photos re-ui'},head,h('div',{class:'re-panel-body',id:'re-photos-body'}));
    document.body.append(photosPanel);
  }
  photosPanel.classList.add('open'); loadPhotos();
}
function loadPhotos(){
  const body=document.getElementById('re-photos-body'); if(!body)return; body.innerHTML='';
  const imgs=[...document.images].filter(i=>!i.closest(LOCKED)&&!i.closest('.re-ui')&&i.clientWidth>=24&&i.clientHeight>=24);
  if(!imgs.length){ body.append(h('p',{class:'re-ibx-empty'},'No changeable photos on this page. Open the page whose photos you want to change, then reopen Photos.')); return; }
  body.append(h('p',{class:'re-photos-hint'},imgs.length+' photo'+(imgs.length===1?'':'s')+' on this page — click “Change” to replace one, or the thumbnail to jump to it.'));
  imgs.forEach(img=>{
    const name=(img.getAttribute('alt')||img.getAttribute('src')||'image').split('/').pop();
    const change=()=>{ img.scrollIntoView({behavior:'smooth',block:'center'}); openMedia(img); };
    body.append(h('div',{class:'re-photo-row'},
      h('img',{class:'re-photo-thumb',src:img.currentSrc||img.src,loading:'lazy',onclick:change}),
      h('div',{class:'re-photo-meta'},
        h('div',{class:'re-photo-name',title:name},name),
        h('button',{class:'re-btn re-btn-ghost re-photo-btn',onclick:change},'Change'))));
  });
}

/* ════════ PHASE 2: COLORS CUSTOMIZER ════════ */
const GROUPS=[
  {name:'Brand Gold', vars:[['--au','Primary gold'],['--au2','Light gold']]},
  {name:'Emerald', vars:[['--g','Deep green'],['--g2','Mid green'],['--g3','Bright accent']]},
  {name:'Backgrounds', vars:[['--nv','Page background'],['--nv2','Alt sections'],['--nv3','Raised surfaces']]},
  {name:'Text', vars:[['--tx','Text color']]},  /* muted text auto-derives from this */
  {name:'Market Up / Down', vars:[['--up','Gains (up)'],['--dn','Losses (down)']]},
  {name:'Chart lines', vars:[['--chart-grid','Grid lines'],['--chart-axis','Axis labels']]},
];
let colorMode='dark', colorPanel;
function syncTabs(){ const t=colorPanel._tabs.children; t[0].classList.toggle('on',colorMode==='dark'); t[1].classList.toggle('on',colorMode==='light'); }
function openColors(){
  colorMode=document.body.classList.contains('light')?'light':'dark'; // match what the user currently sees
  if(colorPanel){ syncTabs(); renderColorGroups(); colorPanel.classList.add('open'); return; }
  const groups=h('div');
  const tabs=h('div',{class:'re-tabs'},
    h('div',{class:'re-tab',onclick:()=>setMode('dark')},'Dark mode'),
    h('div',{class:'re-tab',onclick:()=>setMode('light')},'Light mode'));
  colorPanel=h('div',{class:'re-panel re-ui'},
    h('div',{class:'re-panel-head'},h('h3',{},'Colors'),h('button',{class:'re-btn re-btn-ghost',onclick:()=>colorPanel.classList.remove('open')},'✕')),
    h('div',{class:'re-panel-body'},tabs,groups));
  document.body.append(colorPanel);
  colorPanel._tabs=tabs;colorPanel._groups=groups;
  syncTabs(); renderColorGroups();
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
      const picker=h('input',{type:'color',value:hex});
      const hexI=h('input',{class:'re-cl-hex',value:val});
      const set=nv=>{ WORK.theme[colorMode][v]=nv; hexI.value=nv; picker.value=toHex(nv);
        API.injectThemeOverrides(WORK.theme); window.dispatchEvent(new Event('re-recolor')); markDirty('theme:'+colorMode+':'+v); };
      picker.addEventListener('input',()=>set(picker.value));
      hexI.addEventListener('change',()=>set(hexI.value.trim()));
      return h('div',{class:'re-color'},picker,h('span',{class:'re-cl-lbl'},lbl),hexI);
    });
    body.append(h('div',{class:'re-group'},
      h('div',{class:'re-group-h'},g.name,h('button',{onclick:()=>{g.vars.forEach(([v])=>{delete WORK.theme[colorMode][v];markDirty('theme:'+colorMode+':'+v);});API.injectThemeOverrides(WORK.theme);window.dispatchEvent(new Event('re-recolor'));renderColorGroups();}},'reset')),
      ...rows));
  });
}

/* ════════ SUBMISSIONS INBOX (form leads) ════════ */
let inboxPanel;
const KIND_LABEL={contact:'Contact',complaint:'Complaint',feedback:'Feedback',career:'Career',application:'Account application'};
function openInbox(){
  if(!inboxPanel){
    const head=h('div',{class:'re-panel-head'},h('h3',{},'Submissions'),
      h('div',{},h('button',{class:'re-btn re-btn-ghost',title:'Refresh',onclick:loadInbox},'↻'),
        h('button',{class:'re-btn re-btn-ghost',onclick:()=>inboxPanel.classList.remove('open')},'✕')));
    inboxPanel=h('div',{class:'re-panel re-inbox re-ui'},head,h('div',{class:'re-panel-body',id:'re-ibx-body'}));
    document.body.append(inboxPanel);
  }
  inboxPanel.classList.add('open');
  loadInbox();
}
function prettyLabel(k){return k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());}
function fieldRows(obj){
  const order=['name','firstName','lastName','email','phone','mobile','subject','category','position','message','coverLetter','reference','cnic','dob','gender','address','city','province','employment','employer','income','sourceOfFunds','bank','iban','experience','objective','accountType','riskTolerance','language','services'];
  const has=k=>obj[k]!=null&&String(obj[k]).trim()!=='';
  const keys=[...order.filter(has),...Object.keys(obj).filter(k=>order.indexOf(k)<0&&has(k))];
  return keys.map(k=>h('div',{class:'re-ibx-row'},h('span',{class:'re-ibx-k'},prettyLabel(k)),h('span',{class:'re-ibx-v'},String(obj[k]))));
}
async function loadInbox(){
  const body=document.getElementById('re-ibx-body'); if(!body)return;
  body.innerHTML=''; body.append(h('p',{class:'re-ibx-empty'},'Loading…'));
  if(Store.mode!=='supabase'){ body.innerHTML=''; body.append(h('p',{class:'re-ibx-empty'},'Submissions show up here once your site is connected to Supabase. (You’re currently in local preview mode.)')); return; }
  let rows;
  try{ rows=await Store.listSubmissions(); }
  catch(e){ body.innerHTML=''; body.append(h('p',{class:'re-ibx-empty'},'Couldn’t load submissions: '+e.message+' — has the forms setup SQL been run yet?')); return; }
  body.innerHTML='';
  if(!rows.length){ body.append(h('p',{class:'re-ibx-empty'},'No submissions yet. When a visitor sends a form, it appears here.')); return; }
  rows.forEach(r=>{
    const d=r.data||{};
    const when=(r.created_at||'').replace('T',' ').slice(0,16);
    const name=d.name||[d.firstName,d.lastName].filter(Boolean).join(' ')||d.email||'—';
    const chk=h('input',{type:'checkbox'}); chk.checked=!!r.handled;
    const card=h('div',{class:'re-ibx-card'+(r.handled?' done':'')});
    chk.addEventListener('change',()=>{Store.setHandled(r.id,chk.checked);card.classList.toggle('done',chk.checked);});
    const files=(r.files||[]).map(f=>h('button',{class:'re-ibx-file',onclick:async ev=>{ev.preventDefault();const b=ev.currentTarget;const old=b.textContent;b.textContent='opening…';const u=await Store.signedUrl(f.path);b.textContent=old;if(u)window.open(u,'_blank');else toast('Could not open file');}},'⬇ '+(f.field||'file')));
    card.append(
      h('div',{class:'re-ibx-top'},
        h('span',{class:'re-ibx-badge re-k-'+r.kind},KIND_LABEL[r.kind]||r.kind),
        h('span',{class:'re-ibx-name'},name),
        h('span',{class:'re-ibx-when'},when)),
      h('div',{class:'re-ibx-fields'},...fieldRows(d)),
      files.length?h('div',{class:'re-ibx-files'},h('span',{class:'re-ibx-k'},'Files'),h('span',{},...files)):document.createTextNode(''),
      h('div',{class:'re-ibx-foot'},
        h('label',{class:'re-ibx-handled'},chk,'Mark handled'),
        h('button',{class:'re-ibx-del',onclick:async()=>{ if(!confirm('Delete this submission permanently?'))return; try{ await Store.deleteSubmission(r.id); card.remove(); toast('Submission deleted'); }catch(e){ toast('Delete failed: '+e.message); } }},'🗑 Delete')));
    body.append(card);
  });
}

/* ════════ SAVE / PUBLISH BAR ════════ */
let saveBar,countEl;
function buildSaveBar(){
  countEl=h('span',{class:'re-count'});
  saveBar=h('div',{class:'re-savebar re-ui'},
    countEl,
    h('button',{class:'re-btn re-btn-ghost',onclick:discardAll},'Discard'),
    h('button',{class:'re-btn re-btn-ghost',onclick:saveDraft},'Save draft'),
    h('button',{class:'re-btn re-btn-gd',onclick:publish},'Publish'));
  document.body.append(saveBar);
}
function updateSaveBar(){ const n=pendingCount(); countEl.innerHTML='<span>'+n+'</span> change'+(n===1?'':'s'); saveBar.classList.toggle('show',n>0); }
function cleanWork(){ // drop empty theme buckets
  const w=JSON.parse(JSON.stringify(WORK));
  return w;
}
function saveDraft(){ Promise.resolve(Store.saveDraft(cleanWork())).then(()=>{dirty.clear();updateSaveBar();toast('Draft saved (not yet public)');}).catch(e=>toast('Save failed: '+e.message)); }
function publish(){ if(!confirm('Publish your changes? This makes them live for all visitors.'))return;
  Promise.resolve(Store.publish(cleanWork())).then(()=>{ try{localStorage.setItem('re-content',JSON.stringify(cleanWork()));}catch(e){} dirty.clear();updateSaveBar();toast('Published! Your changes are now live.'); }).catch(e=>toast('Publish failed: '+e.message)); }
function discardAll(){ if(!confirm('Discard all unsaved changes?'))return;
  Store.getDraft().then(d=>{ WORK=normalize(d); API.setOverrides(WORK); API.refreshCalcInfo&&API.refreshCalcInfo(); document.querySelectorAll('.re-dirty').forEach(n=>n.classList.remove('re-dirty')); dirty.clear();updateSaveBar();toast('Changes discarded'); }); }

/* global undo (Ctrl/Cmd-Z) */
document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&editing){ const u=undo.pop(); if(!u)return; e.preventDefault();
  if(u.kind==='text'){ if(u.prev==null)delete WORK.text[u.key];else WORK.text[u.key]=u.prev; }
  if(u.kind==='img'){ if(u.prev==null)delete WORK.img[u.key];else WORK.img[u.key]=u.prev; }
  API.setOverrides(WORK); toast('Undo'); }});

/* ════════ first-run coachmark ════════ */
function maybeCoach(){ if(localStorage.getItem('re-coached'))return;
  const c=h('div',{class:'re-coach re-ui',html:'<b>Welcome to your editor!</b><br>• Turn on <b>Edit mode</b>, then <b>click any highlighted text</b> to change it.<br>• Use <b>🖼 Photos</b> to swap any image (or hover an image → <b>Change</b>).<br>• Open <b>🎨 Colors</b> to recolor the site.<br>• <b>Save draft</b> keeps changes private; <b>Publish</b> makes them live.'},);
  c.append(h('button',{class:'re-btn re-btn-pri',onclick:()=>{c.remove();localStorage.setItem('re-coached','1');}},'Got it'));
  document.body.append(c);
}

/* ════════ start ════════ */
Promise.resolve(Store.init()).then(authed=>{ if(authed)onAuthed(); else showLogin(); });
})();
