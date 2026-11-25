/* ============================================================
   TurniUp — Pannello Dipendente
   Sidebar injector + comportamenti condivisi
   (gemello del pannello datore: stessa struttura div#sb + script)
   ============================================================ */
(function () {
  "use strict";

  /* ---- icone (line icons, 24x24) ---- */
  var I = {
    dashboard: '<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>',
    turni:     '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    timbra:    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    ferie:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    dispo:     '<path d="M4 6h12M4 12h16M4 18h9"/><circle cx="18" cy="6" r="2.4"/><circle cx="9" cy="18" r="2.4"/>',
    notifiche: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    profilo:   '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    logout:    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'
  };

  var NAV = [
    { id: "dashboard",  label: "Dashboard",        href: "dashboard.html",     icon: "dashboard" },
    { id: "turni",      label: "I miei turni",      href: "turni.html",         icon: "turni" },
    { id: "timbratura", label: "Timbratura",        href: "timbratura.html",    icon: "timbra" },
    { id: "ferie",      label: "Ferie & permessi",  href: "ferie.html",         icon: "ferie" },
    { id: "disponibilita", label: "Disponibilità",  href: "disponibilita.html", icon: "dispo" },
    { id: "notifiche",  label: "Notifiche",         href: "notifiche.html",     icon: "notifiche", dot: true },
    { id: "profilo",    label: "Profilo",           href: "profilo.html",       icon: "profilo" }
  ];

  var USER = { name: "Sara Ricci", role: "Cassa Nord", initials: "SR" };

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }

  function buildSidebar() {
    var active = document.documentElement.getAttribute("data-page");
    var el = document.getElementById("sb");
    if (!el) return;
    el.className = "sidebar";

    var items = NAV.map(function (n) {
      var dot = n.dot ? '<span class="sb-dot"></span>' : "";
      return '<a class="sb-item' + (n.id === active ? " active" : "") + '" href="' + n.href + '">' +
        svg(I[n.icon]) + '<span>' + n.label + '</span>' + dot + '</a>';
    }).join("");

    el.innerHTML =
      '<div class="sb-head">' +
        '<img class="sb-logo" src="../image/splash.png" alt="TurniUp">' +
        '<div class="sb-brand">' +
          '<span class="sb-brand-name">TurniUp</span>' +
          '<span class="sb-chip" data-role="employee">Dipendente</span>' +
        '</div>' +
      '</div>' +
      '<nav class="sb-nav">' +
        '<div class="sb-section-label">Area personale</div>' +
        items +
      '</nav>' +
      '<div class="sb-foot">' +
        '<div class="sb-avatar">' + USER.initials + '</div>' +
        '<div class="sb-user">' +
          '<div class="sb-user-name">' + USER.name + '</div>' +
          '<div class="sb-user-role">' + USER.role + '</div>' +
        '</div>' +
        '<a class="sb-logout" href="#" title="Esci" aria-label="Esci">' + svg(I.logout) + '</a>' +
      '</div>';
  }

  /* ---- tema ---- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("tu-theme", t); } catch (e) {}
  }
  function initTheme() {
    var saved;
    try { saved = localStorage.getItem("tu-theme"); } catch (e) {}
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(cur === "dark" ? "light" : "dark");
  }

  /* ---- hamburger / scrim mobile ---- */
  function initMobile() {
    var ham = document.querySelector(".hamburger");
    var sb = document.getElementById("sb");
    var scrim = document.querySelector(".scrim");
    function open() { sb && sb.classList.add("open"); scrim && scrim.classList.add("open"); }
    function close() { sb && sb.classList.remove("open"); scrim && scrim.classList.remove("open"); }
    if (ham) ham.addEventListener("click", open);
    if (scrim) scrim.addEventListener("click", close);
  }

  /* ---- helper pubblici ---- */
  window.TU = {
    user: USER,
    toggleTheme: toggleTheme,
    toast: function (msg, kind) {
      var wrap = document.querySelector(".toast-wrap");
      if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
      var t = document.createElement("div");
      t.className = "toast" + (kind ? " toast-" + kind : "");
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>' + msg + '</span>';
      wrap.appendChild(t);
      requestAnimationFrame(function () { t.classList.add("show"); });
      setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 300); }, 2600);
    },
    openModal: function (id) { var m = document.getElementById(id); if (m) m.classList.add("open"); },
    closeModal: function (id) { var m = document.getElementById(id); if (m) m.classList.remove("open"); }
  };

  /* ---- topbar dark-mode button (auto-bind by data attr) ---- */
  function bindThemeButtons() {
    document.querySelectorAll("[data-action='theme']").forEach(function (b) {
      b.addEventListener("click", toggleTheme);
    });
    document.querySelectorAll("[data-action='close-modal']").forEach(function (b) {
      b.addEventListener("click", function () { var m = b.closest(".modal-overlay"); if (m) m.classList.remove("open"); });
    });
  }

  initTheme();
  document.addEventListener("DOMContentLoaded", function () {
    buildSidebar();
    initMobile();
    bindThemeButtons();
  });
})();
