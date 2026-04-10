(() => {
  const orbBtn = document.getElementById('orbBtn');
  const orbNav = document.getElementById('orbNav');
  const header = document.querySelector('.orb-header');

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  document.body.appendChild(backdrop);

  let isOpen = false;

  function open() {
    isOpen = true;
    orbBtn.classList.add('active');
    orbBtn.setAttribute('aria-expanded', 'true');
    orbNav.classList.add('open');
    orbNav.setAttribute('aria-hidden', 'false');
    header.classList.add('open');
    backdrop.classList.add('visible');
  }

  function close() {
    isOpen = false;
    orbBtn.classList.remove('active');
    orbBtn.setAttribute('aria-expanded', 'false');
    orbNav.classList.remove('open');
    orbNav.setAttribute('aria-hidden', 'true');
    header.classList.remove('open');
    backdrop.classList.remove('visible');
  }

  orbBtn.addEventListener('click', () => {
    isOpen ? close() : open();
  });

  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });
})();
