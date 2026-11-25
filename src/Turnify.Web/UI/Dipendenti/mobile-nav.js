/* ============================================================
   TurniUp Mobile — status bar, bottom tab bar, helpers
   ============================================================ */
(function () {
  "use strict";

  var I = {
    casa:   '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    turni:  '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    timbra: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 1.5"/>',
    ferie:  '<circle cx="12" cy="12" r="3.6"/><path d="M12 2v2M12 20v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2 12h2M20 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    profilo:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.5 3.2-5.5 7-5.5s7 2 7 5.5"/>'
  };

  var TABS = [
    { id: "casa",    label: "Casa",    href: "employee-mobile-dashboard.html", icon: "casa" },
    { id: "turni",   label: "Turni",   href: "employee-mobile-shifts.html",    icon: "turni" },
    { id: "timbra",  label: "Timbra",  href: "employee-mobile-timbra.html",    icon: "timbra", center: true },
    { id: "ferie",   label: "Ferie",   href: "employee-mobile-ferie.html",     icon: "ferie" },
    { id: "profilo", label: "Profilo", href: "employee-mobile-profilo.html",   icon: "profilo" }
  ];

  function svg(p, sw) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.9) + '" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  /* ---- status bar ---- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function fillStatusBar() {
    var el = document.getElementById("statusbar");
    if (!el) return;
    var icons =
      '<svg viewBox="0 0 20 14"><path d="M1 9h2v4H1zM5 6h2v7H5zM9 3.5h2V13H9zM13 1h2v12h-2z" fill="currentColor" stroke="none"/></svg>' +
      '<svg viewBox="0 0 20 14"><path d="M10 3a11 11 0 0 1 7.5 3M10 7a7 7 0 0 1 4.7 1.9M10 11.2a2.6 2.6 0 0 1 1.7.8" /></svg>' +
      '<svg viewBox="0 0 26 14"><rect x="1" y="3" width="20" height="8" rx="2.2"/><rect x="3" y="5" width="14" height="4" rx="1" fill="currentColor" stroke="none"/><path d="M23 5.5v3" stroke-width="2.4"/></svg>';
    function tick() {
      var d = new Date();
      el.innerHTML =
        '<span class="sb-time">' + d.getHours() + ':' + pad(d.getMinutes()) + '</span>' +
        '<span class="island"></span>' +
        '<span class="sb-icons">' + icons + '</span>';
    }
    tick();
    setInterval(tick, 10000);
  }

  /* ---- tab bar ---- */
  function buildTabBar() {
    var el = document.getElementById("tabbar");
    if (!el) return;
    var active = document.documentElement.getAttribute("data-page");
    el.className = "tabbar";
    el.innerHTML = TABS.map(function (t) {
      if (t.center) {
        return '<a class="tab center' + (t.id === active ? " active" : "") + '" href="' + t.href + '">' +
          '<span class="fab">' + svg(I[t.icon], 2) + '</span>' +
          '<span class="tlabel">' + t.label + '</span></a>';
      }
      return '<a class="tab' + (t.id === active ? " active" : "") + '" href="' + t.href + '">' +
        svg(I[t.icon], 1.9) + '<span class="tlabel">' + t.label + '</span></a>';
    }).join("");
  }

  /* ---- theme ---- */
  function initTheme() {
    var s; try { s = localStorage.getItem("tu-theme"); } catch (e) {}
    if (s) document.documentElement.setAttribute("data-theme", s);
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("tu-theme", next); } catch (e) {}
  }

  /* ---- helpers ---- */
  window.MTU = {
    toggleTheme: toggleTheme,
    toast: function (msg, kind) {
      var screen = document.querySelector(".screen") || document.body;
      var wrap = screen.querySelector(".m-toast-wrap");
      if (!wrap) { wrap = document.createElement("div"); wrap.className = "m-toast-wrap"; screen.appendChild(wrap); }
      var t = document.createElement("div");
      t.className = "m-toast" + (kind ? " " + kind : "");
      t.innerHTML = svg('<path d="M20 6 9 17l-5-5"/>', 2.2) + '<span>' + msg + '</span>';
      wrap.appendChild(t);
      requestAnimationFrame(function () { t.classList.add("show"); });
      setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 300); }, 3000);
    },
    openSheet: function (id) { var s = document.getElementById(id); if (s) s.classList.add("open"); },
    closeSheet: function (id) { var s = document.getElementById(id); if (s) s.classList.remove("open"); }
  };

  function bind() {
    document.querySelectorAll("[data-action='theme']").forEach(function (b) { b.addEventListener("click", toggleTheme); });
    document.querySelectorAll("[data-action='close-sheet']").forEach(function (b) {
      b.addEventListener("click", function () { var s = b.closest(".sheet-overlay"); if (s) s.classList.remove("open"); });
    });
    // tap on overlay backdrop closes sheet
    document.querySelectorAll(".sheet-overlay").forEach(function (ov) {
      ov.addEventListener("click", function (e) { if (e.target === ov) ov.classList.remove("open"); });
    });
  }

  initTheme();
  document.addEventListener("DOMContentLoaded", function () {
    fillStatusBar();
    buildTabBar();
    bind();
  });
})();
