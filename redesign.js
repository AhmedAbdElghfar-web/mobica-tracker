/* ============================================================
   MOBICA · Warehouse OS Redesign — stronger overlay (v2)
   Replace your old redesign.js with this file.
   ============================================================ */
(function () {
  if (window.__mobicaRedesignV2) return;
  window.__mobicaRedesignV2 = true;

  /* ---------- 1. THEME TOGGLE (sun / moon in header) ---------- */
  var KEY = 'mobica-theme';
  var saved = localStorage.getItem(KEY);
  if (saved === 'light')      document.body.classList.add('light-mode');
  else if (saved === 'dark')  document.body.classList.remove('light-mode');

  function injectThemeBtn() {
    var hdr = document.getElementById('header-right');
    if (!hdr || document.getElementById('rd-theme-toggle')) return;
    var b = document.createElement('button');
    b.id = 'rd-theme-toggle';
    b.className = 'hbtn';
    b.title = 'Toggle theme';
    b.style.cssText = 'min-width:32px;text-align:center;font-size:14px;';
    function r(){ b.textContent = document.body.classList.contains('light-mode') ? '\u263E' : '\u263C'; }
    r();
    b.addEventListener('click', function(){
      document.body.classList.toggle('light-mode');
      localStorage.setItem(KEY, document.body.classList.contains('light-mode') ? 'light' : 'dark');
      r();
    });
    hdr.insertBefore(b, hdr.firstChild);
  }

  /* ---------- 2. STRIP INLINE OEM COLORS + RECOLOR BARS ---------- */
  // Re-themes anything that uses inline color/background styles set by render JS.
  function stripOEMColors(root) {
    if (!root) return;

    // OEM card name + total → plain text color
    root.querySelectorAll('.oem-card').forEach(function (card) {
      card.style.borderColor = '';
      card.style.borderLeft = '';
      var hdr = card.querySelector('.oem-card-header');
      if (hdr) { hdr.style.background = ''; hdr.style.borderBottom = ''; }
      card.querySelectorAll('.oem-card-name, .oem-card-total').forEach(function (n) {
        n.style.color = '';
      });
    });

    // Plan blocks have similar inline coloring
    root.querySelectorAll('.plan-oem-block, .plan-oem-header').forEach(function (n) {
      n.style.background = '';
      n.style.borderColor = '';
      n.style.color = '';
    });

    // Dashboard chart bars — find bars and force amber/lime
    var loc = document.body.classList.contains('loc-integrated');
    var accent = loc ? '#9FE800' : '#FF7A1A';
    root.querySelectorAll('[id*="bar"], [class*="bar"]').forEach(function (bar) {
      var s = bar.getAttribute('style') || '';
      // Only touch elements that look like rendered chart bars (have a height + background)
      if (/background/i.test(s) && /(height|width)/i.test(s)) {
        bar.style.background = accent;
        bar.style.backgroundColor = accent;
        bar.style.boxShadow = 'none';
        bar.style.borderRadius = '2px';
      }
    });

    // Dashboard table — OEM-name cells in first column → plain text
    root.querySelectorAll('#dash-table td:first-child, #dash-table th:first-child').forEach(function (td) {
      td.style.color = '';
      td.querySelectorAll('*').forEach(function (n){ n.style.color = ''; });
    });
    // Numeric cells → plain mono white
    root.querySelectorAll('#dash-table td').forEach(function (td) {
      // Drop inline rainbow colors on numeric content
      var t = td.textContent.trim();
      if (/^[\d,.\sM%K]+$/.test(t)) {
        td.style.color = '';
        td.querySelectorAll('*').forEach(function (n){ n.style.color = ''; });
      }
    });

    // Bar labels above chart (e.g. "5.4M", "EXCEED") — strip inline colors
    root.querySelectorAll('.bar-label, .bar-name, .chart-label, [class*="chart"] span').forEach(function (n) {
      n.style.color = '';
    });
  }

  /* ---------- 3. COMPRESS HEADER BRANDING ---------- */
  function compressHeader() {
    var brand = document.querySelector('.brand');
    if (brand && !brand.dataset.rdDone) {
      // "DELIVERY TRACKER" → "DELIVERY OS"
      // Original markup: <div class="brand">DELIVERY TRACKER</div>
      brand.textContent = 'MOBICA \u00B7 DELIVERY OS';
      brand.dataset.rdDone = '1';
    }
    // Hide the small "MOBICA" eyebrow + version line, since brand now contains MOBICA
    var sub = document.querySelector('.brand-sub');
    if (sub) sub.style.display = 'none';
    var top = document.querySelector('.brand-top, .brand-eyebrow');
    if (top) top.style.display = 'none';
    // Generic: any sibling small text inside the brand block reading "MOBICA"
    document.querySelectorAll('#header div, #header span').forEach(function (el) {
      if (el === brand) return;
      var t = (el.textContent || '').trim();
      if (t === 'MOBICA' || /APR\s*20\d\d\s*\u00B7\s*v/i.test(t)) {
        el.style.display = 'none';
      }
    });
  }

  /* ---------- 4. FORCE KEYPAD VISIBLE ON ENTRY ---------- */
  function openKeypad() {
    var kp = document.getElementById('keypad');
    if (kp) {
      kp.classList.add('open');
      kp.style.maxHeight = 'none';
      kp.style.opacity = '1';
      kp.style.marginBottom = '20px';
      kp.style.overflow = 'visible';
    }
    var qd = document.getElementById('qty-display');
    if (qd) {
      qd.classList.add('active');
      // Drop the "▼" hint arrow since keypad is always open
      var arrow = qd.querySelector('span');
      if (arrow) arrow.style.display = 'none';
    }
  }

  /* ---------- 5. RUN HOOKS ---------- */
  function runAll() {
    compressHeader();
    openKeypad();
    stripOEMColors(document.body);
  }

  // Initial pass
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectThemeBtn();
      runAll();
    });
  } else {
    injectThemeBtn();
    runAll();
  }

  // Re-run after every DOM change in #content (renderAnalysis/Dashboard/Plan rebuild it)
  var content = document.getElementById('content') || document.body;
  var pending = false;
  var mo = new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      runAll();
    });
  });
  mo.observe(content, { childList: true, subtree: true, attributes: true,
                        attributeFilter: ['style', 'class'] });

  // Re-run on tab clicks (catches cases where renderers fire after click)
  document.addEventListener('click', function (e) {
    if (e.target.closest('.tab-btn, .loc-banner-btn')) {
      setTimeout(runAll, 50);
      setTimeout(runAll, 250);
    }
  }, true);
})();
