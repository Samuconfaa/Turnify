/* ============================================================
   TurniUp — Mobile shell JS (admin)
   ============================================================ */
(function(){
  function svg(inner,extra){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"'+(extra||'')+'>'+inner+'</svg>';
  }

  /* nav for drawer + which tab maps to each page */
  const ICONS = {
    dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    shifts:'<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4M7.5 13h3M7.5 16.5h6"/>',
    employees:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M18 19a5 5 0 0 0-3-4.6"/>',
    vacations:'<path d="M3 18s2-7 9-7 9 7 9 7M12 11V3M12 3l3 2.5M12 3 9 5.5"/>',
    businesses:'<path d="M3 9.5 5 4h14l2 5.5M4 9.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5ZM9 21v-5h6v5"/>',
    errors:'<path d="M10.5 3h3l.6 2.5 2.2 1.3 2.4-.8 1.5 2.6-1.8 1.7v2.4l1.8 1.7-1.5 2.6-2.4-.8-2.2 1.3L13.5 21h-3l-.6-2.5-2.2-1.3-2.4.8L1.8 15.4l1.8-1.7v-2.4L1.8 9.6l1.5-2.6 2.4.8 2.2-1.3L10.5 3Z"/><circle cx="12" cy="12" r="2.6"/>',
    more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    settings:'<path d="M10.5 3h3l.6 2.5 2.2 1.3 2.4-.8 1.5 2.6-1.8 1.7v2.4l1.8 1.7-1.5 2.6-2.4-.8-2.2 1.3L13.5 21h-3l-.6-2.5-2.2-1.3-2.4.8L1.8 15.4l1.8-1.7v-2.4L1.8 9.6l1.5-2.6 2.4.8 2.2-1.3L10.5 3Z"/><circle cx="12" cy="12" r="2.6"/>',
    logout:'<path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h10"/>'
  };
  const PAGES = {
    dashboard:{label:'Dashboard', href:'admin-mobile-dashboard.html'},
    shifts:{label:'Turni', href:'admin-mobile-shifts.html'},
    employees:{label:'Dipendenti', href:'admin-mobile-employees.html'},
    vacations:{label:'Ferie e permessi', href:'admin-mobile-vacations.html', count:'7'},
    businesses:{label:'Attività', href:'admin-mobile-businesses.html'},
    errors:{label:'Log errori', href:'admin-mobile-logs.html'}
  };
  /* bottom tabs (Altro groups businesses+errors+settings) */
  const TABS = [
    {key:'dashboard', label:'Dashboard', icon:ICONS.dashboard, href:'admin-mobile-dashboard.html'},
    {key:'shifts',    label:'Turni',     icon:ICONS.shifts,    href:'admin-mobile-shifts.html'},
    {key:'employees', label:'Team',      icon:ICONS.employees, href:'admin-mobile-employees.html'},
    {key:'vacations', label:'Ferie',     icon:ICONS.vacations, href:'admin-mobile-vacations.html'},
    {key:'more',      label:'Altro',     icon:ICONS.more,      sheet:'sheet-more'}
  ];
  const TAB_OF = {dashboard:'dashboard', shifts:'shifts', employees:'employees', vacations:'vacations', businesses:'more', errors:'more'};

  /* ---------- Drawer ---------- */
  function buildDrawer(active){
    const items = Object.keys(PAGES).map(k=>{
      const p=PAGES[k];
      const cnt = p.count?'<span class="cnt">'+p.count+'</span>':'';
      return '<a class="d-item'+(k===active?' on':'')+'" href="'+p.href+'">'+svg(ICONS[k])+p.label+cnt+'</a>';
    });
    const general = items.slice(0,5).join('');
    const system = items.slice(5).join('');
    return '<div class="drawer-backdrop" id="drawer"><div class="drawer">'+
      '<div class="d-brand"><div class="bm"><img src="../image/splash.png" alt="TurniUp"></div>'+
        '<div><div class="nm">TurniUp</div><div class="d-chip">Pannello Admin</div></div></div>'+
      '<div class="d-lbl">Generale</div>'+
      '<nav class="d-nav" style="margin-top:0">'+general+'</nav>'+
      '<div class="d-lbl">Sistema</div>'+
      '<nav class="d-nav" style="margin-top:0">'+system+
        '<a class="d-item" href="#">'+svg(ICONS.settings)+'Impostazioni</a></nav>'+
      '<div class="d-foot">'+
        '<div class="d-theme"><span class="lab">Tema</span>'+window.themeToggleHTML+'</div>'+
        '<div class="d-user"><div class="avatar" style="background:linear-gradient(135deg,var(--primary),oklch(0.72 0.15 65))">ME</div>'+
          '<div><div class="nm">Marco Esposito</div><div class="rl">Datore di lavoro</div></div>'+
          '<a class="lo" href="admin-mobile-login.html" title="Esci">'+svg(ICONS.logout)+'</a></div>'+
      '</div></div></div>';
  }

  /* ---------- Tab bar ---------- */
  function buildTabbar(active){
    const tab = TAB_OF[active] || active;
    const html = TABS.map(t=>{
      const on = t.key===tab ? ' on':'';
      const attr = t.sheet ? 'data-sheet-open="'+t.sheet+'"' : 'href="'+t.href+'"';
      const el = t.sheet ? 'button' : 'a';
      return '<'+el+' class="m-tab'+on+'" '+attr+'>'+svg(t.icon)+'<span>'+t.label+'</span></'+el+'>';
    }).join('');
    return '<nav class="m-tabbar">'+html+'</nav>';
  }

  /* shared theme toggle markup */
  window.themeToggleHTML =
    '<div class="theme-toggle">'+
      '<button data-set="light" title="Tema chiaro">'+svg('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>')+'</button>'+
      '<button data-set="dark" title="Tema scuro">'+svg('<path d="M20 13.5A8 8 0 0 1 10.5 4a7 7 0 1 0 9.5 9.5Z"/>')+'</button>'+
    '</div>';

  /* "Altro" sheet */
  function moreSheet(active){
    const rows = [
      {k:'businesses', d:'Gestisci sedi e orari'},
      {k:'errors', d:'Log errori app mobile'}
    ].map(r=>{
      const p=PAGES[r.k];
      return '<a class="det-row" href="'+p.href+'" style="text-decoration:none">'+
        '<span class="di">'+svg(ICONS[r.k])+'</span>'+
        '<span style="flex:1"><span class="dv" style="display:block">'+p.label+'</span><span class="dl">'+r.d+'</span></span>'+
        svg('<path d="m9 6 6 6-6 6"/>','style="width:18px;height:18px;color:var(--text-faint);stroke-width:2.2"')+'</a>';
    }).join('');
    const settings = '<a class="det-row" href="#" style="text-decoration:none"><span class="di">'+svg(ICONS.settings)+'</span>'+
      '<span style="flex:1"><span class="dv" style="display:block">Impostazioni</span><span class="dl">Account e preferenze</span></span>'+
      svg('<path d="m9 6 6 6-6 6"/>','style="width:18px;height:18px;color:var(--text-faint);stroke-width:2.2"')+'</a>';
    return sheet('sheet-more', ICONS.more, 'Altro', 'Sezioni aggiuntive', rows+settings, null);
  }

  /* ---------- Sheet builder ---------- */
  window.sheet = function(id, icon, title, sub, bodyHtml, footHtml){
    return '<div class="sheet-backdrop" id="'+id+'"><div class="sheet">'+
      '<div class="sheet-handle"></div>'+
      '<div class="sheet-head"><div class="sh-ico">'+svg(icon)+'</div>'+
        '<div><div class="sheet-title">'+title+'</div>'+(sub?'<div class="sheet-sub">'+sub+'</div>':'')+'</div>'+
        '<button class="sh-close" data-sheet-close>'+svg('<path d="M6 6l12 12M18 6 6 18"/>')+'</button></div>'+
      '<div class="sheet-body">'+bodyHtml+'</div>'+
      (footHtml?'<div class="sheet-foot">'+footHtml+'</div>':'')+
    '</div></div>';
  };
  window.mfSelect = function(opts){
    return '<div class="select"><select>'+opts.map(o=>'<option>'+o+'</option>').join('')+'</select>'+
      svg('<path d="m6 9 6 6 6-6"/>')+'</div>';
  };

  /* ---------- Form sheets (shared) ---------- */
  function formSheets(){
    const emp = sheet('sheet-employee',
      '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M19 8v6M22 11h-6"/>',
      'Nuovo dipendente','Aggiungi un membro del team',
      '<div class="mf two"><div><label>Nome</label><input class="input" placeholder="Giulia"></div><div><label>Cognome</label><input class="input" placeholder="Ferrari"></div></div>'+
      '<div class="mf"><label>Email aziendale</label><input class="input" type="email" placeholder="nome@turniup.it"></div>'+
      '<div class="mf"><label>Telefono</label><input class="input" placeholder="+39 333 1234567"></div>'+
      '<div class="mf"><label>Ruolo</label>'+window.mfSelect(['Cameriere/a','Barista','Cuoco/a','Aiuto cuoco','Responsabile sala'])+'</div>'+
      '<div class="mf"><label>Contratto</label>'+window.mfSelect(['Tempo pieno','Part-time','A chiamata'])+'</div>'+
      '<div class="mf"><label>Attività</label>'+window.mfSelect(['Ristorante Centro','Bar Aurora','Bistrot Sud'])+'</div>',
      '<button class="btn-secondary" data-sheet-close>Annulla</button><button class="btn-primary" data-sheet-save data-toast="Dipendente aggiunto">Salva</button>');

    const biz = sheet('sheet-business',
      '<path d="M3 9.5 5 4h14l2 5.5M4 9.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5ZM9 21v-5h6v5"/>',
      'Nuova attività','Aggiungi una nuova sede',
      '<div class="mf"><label>Nome attività</label><input class="input" placeholder="Ristorante Centro"></div>'+
      '<div class="mf"><label>Tipo</label>'+window.mfSelect(['Ristorante','Bar','Bistrot','Pizzeria','Caffetteria'])+'</div>'+
      '<div class="mf"><label>Indirizzo</label><input class="input" placeholder="Via, numero civico, città"></div>'+
      '<div class="mf"><label>Note</label><textarea class="ta" placeholder="Note opzionali…"></textarea></div>',
      '<button class="btn-secondary" data-sheet-close>Annulla</button><button class="btn-primary" data-sheet-save data-toast="Attività creata">Crea</button>');

    const shift = sheet('sheet-shift',
      '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4M12 12v4M10 14h4"/>',
      'Nuovo turno','Assegna un turno',
      '<div class="mf"><label>Dipendente</label>'+window.mfSelect(['Giulia Ferrari','Luca Bianchi','Sara Conti','Davide Greco','Elena Marino'])+'</div>'+
      '<div class="mf"><label>Attività</label>'+window.mfSelect(['Ristorante Centro','Bar Aurora','Bistrot Sud'])+'</div>'+
      '<div class="mf"><label>Data</label><input class="input" type="date" value="2026-06-01"></div>'+
      '<div class="mf two"><div><label>Ora inizio</label><input class="input" type="time" value="09:00"></div><div><label>Ora fine</label><input class="input" type="time" value="15:00"></div></div>'+
      '<div class="mf"><label>Note</label><textarea class="ta" placeholder="Note opzionali sul turno…"></textarea></div>',
      '<button class="btn-secondary" data-sheet-close>Annulla</button><button class="btn-primary" data-sheet-save data-toast="Turno creato">Crea turno</button>');

    return emp+biz+shift;
  }

  /* ---------- Theme ---------- */
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('.theme-toggle button').forEach(b=>b.classList.toggle('on', b.dataset.set===t));
  }
  function initTheme(){
    applyTheme(localStorage.getItem('turniup-theme')||'light');
  }

  /* ---------- Toast ---------- */
  function toast(msg){
    let w=document.querySelector('.toast-wrap');
    if(!w){w=document.createElement('div');w.className='toast-wrap';(document.querySelector('.screen')||document.body).appendChild(w);}
    const t=document.createElement('div');t.className='toast';
    t.innerHTML=svg('<path d="m5 13 4 4L19 7"/>',' style="width:18px;height:18px;stroke-width:2.4;color:var(--green)"')+'<span>'+msg+'</span>';
    w.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),320);},2400);
  }

  /* ---------- Open/close ---------- */
  function openEl(el){if(el){el.classList.add('open');}}
  function closeEl(el){if(el){el.classList.remove('open');}}
  window.openSheet = function(id){openEl(document.getElementById(id));};

  /* ---------- Count up ---------- */
  window.countUp = function(el, target, dur){
    dur=dur||1000;const start=performance.now();const fmt=target>=1000;
    (function step(now){const p=Math.min((now-start)/dur,1);const v=Math.round(target*(1-Math.pow(1-p,3)));
      el.textContent=fmt?v.toLocaleString('it-IT'):v;if(p<1)requestAnimationFrame(step);})(start);
  };

  /* ---------- Swipe actions ---------- */
  function initSwipe(){
    document.querySelectorAll('.swipe').forEach(sw=>{
      const card=sw.querySelector('.swipe-card');if(!card)return;
      let startX=0,dx=0,active=false,open=0;
      const THRESH=70, MAX=96;
      const onDown=e=>{active=true;startX=(e.touches?e.touches[0].clientX:e.clientX);sw.classList.add('dragging');};
      const onMove=e=>{if(!active)return;const x=(e.touches?e.touches[0].clientX:e.clientX);dx=x-startX+open;
        dx=Math.max(-MAX,Math.min(MAX,dx));card.style.transform='translateX('+dx+'px)';};
      const onUp=()=>{if(!active)return;active=false;sw.classList.remove('dragging');
        if(dx>THRESH){card.style.transform='translateX('+MAX+'px)';open=MAX;}
        else if(dx<-THRESH){card.style.transform='translateX(-'+MAX+'px)';open=-MAX;}
        else{card.style.transform='';open=0;}};
      card.addEventListener('touchstart',onDown,{passive:true});
      card.addEventListener('touchmove',onMove,{passive:true});
      card.addEventListener('touchend',onUp);
      card.addEventListener('mousedown',e=>{onDown(e);e.preventDefault();});
      window.addEventListener('mousemove',onMove);
      window.addEventListener('mouseup',onUp);
      // tapping a revealed action resets + toasts
      sw.querySelectorAll('.swipe-bg .sa').forEach(a=>a.addEventListener('click',()=>{
        card.style.transform='';open=0;
        toast(a.classList.contains('sa-approve')?'Richiesta approvata':'Richiesta rifiutata');
      }));
    });
  }

  /* ---------- Global delegated clicks ---------- */
  document.addEventListener('click', function(e){
    const tg=e.target.closest('.theme-toggle button');
    if(tg){applyTheme(tg.dataset.set);localStorage.setItem('turniup-theme',tg.dataset.set);return;}

    const dop=e.target.closest('[data-drawer-open]');
    if(dop){openEl(document.getElementById('drawer'));return;}

    const sop=e.target.closest('[data-sheet-open]');
    if(sop){openEl(document.getElementById(sop.getAttribute('data-sheet-open')));return;}

    const ssave=e.target.closest('[data-sheet-save]');
    if(ssave){closeEl(ssave.closest('.sheet-backdrop'));toast(ssave.getAttribute('data-toast')||'Salvato');return;}

    const scl=e.target.closest('[data-sheet-close]');
    if(scl){closeEl(scl.closest('.sheet-backdrop'));return;}

    // backdrop tap (drawer or sheet)
    if(e.target.classList.contains('drawer-backdrop')||e.target.classList.contains('sheet-backdrop')){closeEl(e.target);return;}

    // chip filters
    const chip=e.target.closest('.chip-rail .chip, .chip');
    if(chip && chip.parentNode.classList.contains('chip-rail')){
      chip.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));chip.classList.add('on');return;}

    // day pills
    const day=e.target.closest('.day-strip .day-pill');
    if(day){day.parentNode.querySelectorAll('.day-pill').forEach(d=>d.classList.remove('on'));day.classList.add('on');
      if(window.onDaySelect)window.onDaySelect(day);return;}

    // expandable search toggle
    const sx=e.target.closest('[data-search-toggle]');
    if(sx){const box=document.getElementById(sx.getAttribute('data-search-toggle'));if(box){box.classList.toggle('open');const i=box.querySelector('input');if(box.classList.contains('open')&&i)setTimeout(()=>i.focus(),60);}return;}
  });

  /* ---------- Mount ---------- */
  window.mountMobileShell = function(active, opts){
    opts=opts||{};
    const screen=document.querySelector('.screen');
    if(!screen)return;
    // drawer + form sheets + more sheet appended to screen
    const holder=document.createElement('div');
    holder.innerHTML = buildDrawer(active) + formSheets() + moreSheet(active);
    screen.appendChild(holder);
    // tab bar (unless suppressed)
    if(!opts.noTabbar){
      const t=document.createElement('div');t.innerHTML=buildTabbar(active);screen.appendChild(t.firstChild);
    }
    // wire theme toggles present anywhere
    initTheme();
    if(window.onShellReady)window.onShellReady();
    setTimeout(initSwipe,0);
  };

  document.addEventListener('DOMContentLoaded', function(){
    const active=document.body.getAttribute('data-page');
    if(active!==null) window.mountMobileShell(active, {noTabbar: document.body.hasAttribute('data-no-tabbar')});
    else initTheme();
  });
})();
