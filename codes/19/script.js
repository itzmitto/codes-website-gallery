/* ==============================================
   ORB NAV — script
   Drop this on any page that uses the orb
   ============================================== */

(function () {
  const btn      = document.getElementById('orbBtn');
  const dropdown = document.getElementById('orbDropdown');
  if (!btn || !dropdown) return;

  let open = false;

  function openNav() {
    open = true;
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    dropdown.classList.add('open');
    dropdown.setAttribute('aria-hidden', 'false');
  }

  function closeNav() {
    open = false;
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    dropdown.classList.remove('open');
    dropdown.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    open ? closeNav() : openNav();
  });

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (open && !dropdown.contains(e.target)) closeNav();
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) closeNav();
  });
})();
