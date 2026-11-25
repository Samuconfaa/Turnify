/* ============================================================
   TurniUp — Shared shell (sidebar + theme toggle + helpers)
   ============================================================ */
(function(){
  const NAV = [
    {key:'dashboard',  label:'Dashboard',        href:'TurniUp Dashboard.html',   group:'general',
     icon:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'},
    {key:'employees',  label:'Dipendenti',       href:'TurniUp Dipendenti.html',  group:'general', count:'48',
     icon:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M18 19a5 5 0 0 0-3-4.6"/>'},
    {key:'businesses', label:'Attività',          href:'TurniUp Attività.html',    group:'general',
     icon:'<path d="M3 9.5 5 4h14l2 5.5M4 9.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5ZM9 21v-5h6v5"/>'},
    {key:'shifts',     label:'Turni',            href:'TurniUp Turni.html',       group:'general',
     icon:'<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4M7.5 13h3M7.5 16.5h6"/>'},
    {key:'vacations',  label:'Ferie e permessi', href:'TurniUp Ferie.html',       group:'general', count:'7',
     icon:'<path d="M3 18s2-7 9-7 9 7 9 7M12 11V3M12 3l3 2.5M12 3 9 5.5"/>'},
    {key:'errors',     label:'Log errori',       href:'TurniUp Log Errori.html',  group:'system',
     icon:'<path d="M10.5 3h3l.6 2.5 2.2 1.3 2.4-.8 1.5 2.6-1.8 1.7v2.4l1.8 1.7-1.5 2.6-2.4-.8-2.2 1.3L13.5 21h-3l-.6-2.5-2.2-1.3-2.4.8L1.8 15.4l1.8-1.7v-2.4L1.8 9.6l1.5-2.6 2.4.8 2.2-1.3L10.5 3Z"/><circle cx="12" cy="12" r="2.6"/>'},
  ];

  function svg(inner){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'+inner+'</svg>';
  }
  function navItem(it, active){
    const cnt = it.count ? '<span class="count">'+it.count+'</span>' : '';
    return '<a class="nav-item'+(it.key===active?' active':'')+'" href="'+it.href+'">'+svg(it.icon)+it.label+cnt+'</a>';
  }

  window.buildSidebar = function(active){
    const mount = document.getElementById('sb');
    if(!mount) return;
    const general = NAV.filter(n=>n.group==='general').map(n=>navItem(n,active)).join('');
    const system  = NAV.filter(n=>n.group==='system').map(n=>navItem(n,active)).join('');
    mount.className = 'sidebar';
    mount.innerHTML =
      '<div class="brand">'+
        '<div class="brand-mark"><img src="../image/splash.png" alt="TurniUp"></div>'+
        '<div><div class="brand-name">TurniUp</div><div class="brand-sub">Gestione turni</div></div>'+
      '</div>'+
      '<div class="nav-label">Generale</div>'+
      '<nav class="nav">'+general+'</nav>'+
      '<div class="nav-sep"></div>'+
      '<div class="nav-label">Sistema</div>'+
      '<nav class="nav">'+system+'</nav>'+
      '<div class="side-foot"><div class="user-chip">'+
        '<div class="avatar" style="background:linear-gradient(135deg,var(--primary),oklch(0.72 0.15 65))">MR</div>'+
        '<div><div class="nm">Marco Rossi</div><div class="rl">Datore di lavoro</div></div>'+
        svg('<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>').replace('<svg ','<svg style="margin-left:auto;width:16px;height:16px;color:var(--side-muted)" ')+
      '</div></div>';
  };

  /* ---- Theme ---- */
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('.theme-toggle button').forEach(b=>b.classList.toggle('on', b.dataset.set===t));
  }
  window.initTheme = function(){
    const saved = localStorage.getItem('turniup-theme') || 'light';
    applyTheme(saved);
    document.querySelectorAll('.theme-toggle').forEach(tg=>{
      tg.addEventListener('click', e=>{
        const b = e.target.closest('button'); if(!b) return;
        applyTheme(b.dataset.set);
        localStorage.setItem('turniup-theme', b.dataset.set);
        document.dispatchEvent(new CustomEvent('themechange',{detail:b.dataset.set}));
      });
    });
  };

  /* ---- Count-up helper ---- */
  window.countUp = function(el, target, dur){
    dur = dur||1100; const start = performance.now(); const fmt = target>=1000;
    (function step(now){
      const p = Math.min((now-start)/dur,1);
      const v = Math.round(target*(1-Math.pow(1-p,3)));
      el.textContent = fmt ? v.toLocaleString('it-IT') : v;
      if(p<1) requestAnimationFrame(step);
    })(start);
  };

  /* theme toggle markup (reusable) */
  window.themeToggleHTML =
    '<div class="theme-toggle">'+
      '<button data-set="light" title="Tema chiaro">'+svg('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>')+'</button>'+
      '<button data-set="dark" title="Tema scuro">'+svg('<path d="M20 13.5A8 8 0 0 1 10.5 4a7 7 0 1 0 9.5 9.5Z"/>')+'</button>'+
    '</div>';

  /* ============================================================
     Modals (Nuovo dipendente / attività / turno)
     ============================================================ */
  function selectField(opts){
    return '<div class="select"><select>'+opts.map(o=>'<option>'+o+'</option>').join('')+'</select>'+
      svg('<path d="m6 9 6 6 6-6"/>')+'</div>';
  }
  function ff(label, control, full){
    return '<div class="ff'+(full?' full':'')+'"><label>'+label+'</label>'+control+'</div>';
  }
  function modal(id, icon, title, sub, body, saveLabel, toastMsg, note){
    return '<div class="modal-backdrop" id="'+id+'"><div class="modal" role="dialog" aria-modal="true">'+
      '<div class="modal-head"><div class="mh-ico">'+svg(icon)+'</div>'+
        '<div><div class="modal-title">'+title+'</div><div class="modal-sub">'+sub+'</div></div>'+
        '<button class="modal-close" data-modal-close aria-label="Chiudi">'+svg('<path d="M6 6l12 12M18 6 6 18"/>')+'</button></div>'+
      '<div class="modal-body">'+body+'</div>'+
      '<div class="modal-foot">'+(note?'<span class="grow-note">'+note+'</span>':'')+
        '<button class="btn-secondary" data-modal-close>Annulla</button>'+
        '<button class="btn-primary" data-modal-save data-toast="'+toastMsg+'">'+saveLabel+'</button></div>'+
    '</div></div>';
  }

  const SW = ['var(--primary)','var(--green)','var(--amber)','oklch(0.55 0.12 250)','oklch(0.55 0.13 305)','oklch(0.52 0.1 195)'];
  const swatches = '<div class="swatches" data-swatches>'+
    SW.map((c,i)=>'<div class="swatch'+(i===0?' on':'')+'" style="background:'+c+';color:'+c+'"></div>').join('')+'</div>';

  const empModal = modal('modal-employee',
    '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M19 8v6M22 11h-6"/>',
    'Nuovo dipendente','Aggiungi un membro del team',
    '<div class="form-grid">'+
      ff('Nome','<input class="input" placeholder="Es. Giulia">')+
      ff('Cognome','<input class="input" placeholder="Es. Ferrari">')+
      ff('Email aziendale','<input class="input" type="email" placeholder="nome@turniup.it">',true)+
      ff('Telefono','<input class="input" placeholder="+39 333 1234567">')+
      ff('Ruolo',selectField(['Cameriere/a','Barista','Cuoco/a','Aiuto cuoco','Responsabile sala','Chef de rang']))+
      ff('Contratto',selectField(['Tempo pieno','Part-time','A chiamata']))+
      ff('Attività',selectField(['Ristorante Centro','Bar Aurora','Bistrot Sud']))+
      ff('Ore settimanali','<input class="input" type="number" placeholder="40" min="0" max="60">')+
      ff('Stato',selectField(['Attivo','In ferie','Sospeso']))+
    '</div>',
    'Salva dipendente','Dipendente aggiunto','Riceverà un invito via email');

  const bizModal = modal('modal-business',
    '<path d="M3 9.5 5 4h14l2 5.5M4 9.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5ZM9 21v-5h6v5"/>',
    'Nuova attività','Aggiungi una nuova sede',
    '<div class="form-grid">'+
      ff('Nome attività','<input class="input" placeholder="Es. Ristorante Centro">',true)+
      ff('Tipo',selectField(['Ristorante','Bar','Bistrot','Pizzeria','Caffetteria','Altro']))+
      ff('Telefono','<input class="input" placeholder="+39 02 1234567">')+
      ff('Indirizzo','<input class="input" placeholder="Via, numero civico">',true)+
      ff('Città','<input class="input" placeholder="Milano">')+
      ff('CAP','<input class="input" placeholder="20100">')+
      ff('Orario apertura','<input class="input" type="time" value="08:00">')+
      ff('Orario chiusura','<input class="input" type="time" value="23:00">')+
      ff('Colore identificativo',swatches,true)+
    '</div>',
    'Crea attività','Attività creata');

  const shiftModal = modal('modal-shift',
    '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4M12 12v4M10 14h4"/>',
    'Nuovo turno','Assegna un turno a un dipendente',
    '<div class="form-grid">'+
      ff('Dipendente',selectField(['Giulia Ferrari','Luca Bianchi','Sara Conti','Davide Greco','Elena Marino','Francesca Galli']),true)+
      ff('Attività',selectField(['Ristorante Centro','Bar Aurora','Bistrot Sud']))+
      ff('Mansione',selectField(['Sala','Cucina','Bar','Responsabile']))+
      ff('Data','<input class="input" type="date" value="2026-05-31">',true)+
      ff('Ora inizio','<input class="input" type="time" value="09:00">')+
      ff('Ora fine','<input class="input" type="time" value="15:00">')+
      ff('Note','<textarea class="ta" placeholder="Note opzionali sul turno…"></textarea>',true)+
      '<div class="ff full"><div class="switch-row"><div class="sr-txt"><b>Ripeti ogni settimana</b><span>Crea il turno per le prossime 4 settimane</span></div><label class="switch"><input type="checkbox"><span class="tr"></span></label></div></div>'+
    '</div>',
    'Crea turno','Turno creato');

  window.mountModals = function(){
    if(document.getElementById('modal-employee')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = empModal + bizModal + shiftModal + '<div class="toast-wrap" id="toastWrap"></div>';
    document.body.appendChild(wrap);
  };

  function openModal(id){const m=document.getElementById(id);if(m){m.classList.add('open');document.body.style.overflow='hidden';}}
  function closeModal(m){if(!m)return;m.classList.remove('open');document.body.style.overflow='';}
  window.openModal = openModal;
  function toast(msg){
    const w=document.getElementById('toastWrap');if(!w)return;
    const t=document.createElement('div');t.className='toast';
    t.innerHTML=svg('<path d="m5 13 4 4L19 7"/>')+'<span>'+msg+'</span>';
    w.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),320);},2600);
  }

  document.addEventListener('click', function(e){
    const op=e.target.closest('[data-modal-open]');
    if(op){openModal(op.getAttribute('data-modal-open'));return;}
    const sv=e.target.closest('[data-modal-save]');
    if(sv){closeModal(sv.closest('.modal-backdrop'));toast(sv.getAttribute('data-toast')||'Salvato');return;}
    const cl=e.target.closest('[data-modal-close]');
    if(cl){closeModal(cl.closest('.modal-backdrop'));return;}
    if(e.target.classList && e.target.classList.contains('modal-backdrop')){closeModal(e.target);return;}
    const sw=e.target.closest('[data-swatches] .swatch');
    if(sw){sw.parentNode.querySelectorAll('.swatch').forEach(x=>x.classList.remove('on'));sw.classList.add('on');}
  });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){const o=document.querySelector('.modal-backdrop.open');if(o)closeModal(o);}
  });

  document.addEventListener('DOMContentLoaded', function(){
    const active = document.body.getAttribute('data-page');
    if(active){ buildSidebar(active); mountModals(); }
    document.querySelectorAll('[data-theme-toggle]').forEach(s=> s.innerHTML = window.themeToggleHTML);
    initTheme();
  });
})();
