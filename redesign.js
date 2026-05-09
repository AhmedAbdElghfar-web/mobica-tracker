/* ============================================================
   MOBICA · Warehouse OS Redesign — small JS helper
   Adds a sun/moon theme toggle to the header. Optional —
   your existing dark mode toggle in More menu still works.
   Paste this AFTER your <script> blocks (or load via
   <script defer src="redesign.js"></script>).
   ============================================================ */
(function () {
  if (window.__mobicaRedesignLoaded) return;
  window.__mobicaRedesignLoaded = true;

  // 1) Read saved theme + apply
  var KEY = 'mobica-theme';
  var saved = localStorage.getItem(KEY);
  if (saved === 'light')      document.body.classList.add('light-mode');
  else if (saved === 'dark')  document.body.classList.remove('light-mode');

  // 2) Inject a header theme toggle button
  function inject() {
    var hdr = document.getElementById('header-right');
    if (!hdr || document.getElementById('rd-theme-toggle')) return;

    var btn = document.createElement('button');
    btn.id = 'rd-theme-toggle';
    btn.className = 'hbtn';
    btn.title = 'Toggle theme';
    btn.style.cssText = 'min-width:32px;text-align:center;';
    refresh();
    btn.addEventListener('click', function () {
      document.body.classList.toggle('light-mode');
      localStorage.setItem(KEY, document.body.classList.contains('light-mode') ? 'light' : 'dark');
      refresh();
    });
    hdr.insertBefore(btn, hdr.firstChild);

    function refresh() {
      btn.textContent = document.body.classList.contains('light-mode') ? '☾' : '☼';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
