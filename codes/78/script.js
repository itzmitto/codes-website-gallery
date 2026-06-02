(function () {
  'use strict';

    
  const ITEM_COUNT   = 10;
  const AUTO_DELAY   = 3800; 
  const DRAG_FACTOR  = 0.35; 

    
  let currentIndex  = 0;
  let anglePerItem  = 360 / ITEM_COUNT;
  let currentAngle  = 0;
  let autoTimer     = null;
  let isDragging    = false;
  let startX        = 0;
  let lastX         = 0;
  let dragDelta     = 0;
  let velocityX     = 0;
  let lastTime      = 0;
  let hintHidden    = false;

    
  const carousel    = document.getElementById('carousel');
  const prevBtn     = document.getElementById('prevBtn');
  const nextBtn     = document.getElementById('nextBtn');
  const dotIndicator = document.getElementById('dotIndicator');
  const dragHint    = document.getElementById('dragHint');
  const items       = Array.from(carousel.querySelectorAll('.carousel__item'));

    
  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

  function normalise(idx) {
    return ((idx % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT;
  }

    
  function applyRotation(angle) {
    carousel.style.transform = `rotateX(-6deg) rotateY(${angle}deg)`;
  }

  function updateActiveItem(idx) {
    items.forEach((el, i) => {
      el.classList.toggle('is-active', i === idx);
    });
  }

  function updateDotIndicator(idx) {
    const travel = (idx / (ITEM_COUNT - 1)) * 88;
    dotIndicator.style.transform = `translateX(${travel}%)`;
  }

  function goTo(idx, instantly = false) {
    currentIndex = normalise(idx);
    currentAngle = -(currentIndex * anglePerItem);

    if (instantly) {
      carousel.style.transition = 'none';
      applyRotation(currentAngle);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          carousel.style.transition = '';
        });
      });
    } else {
      applyRotation(currentAngle);
    }

    updateActiveItem(currentIndex);
    updateDotIndicator(currentIndex);
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

    
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, AUTO_DELAY);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function resetAuto() {
    stopAuto();
    startAuto();
  }

    
  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function onDragStart(e) {
    if (e.target.closest('.btn')) return;
    isDragging  = true;
    startX      = getClientX(e);
    lastX       = startX;
    dragDelta   = 0;
    velocityX   = 0;
    lastTime    = performance.now();
    stopAuto();
    carousel.classList.add('is-grabbing');

    carousel.style.transition = 'none';

    hideHint();

    e.preventDefault();
  }

  function onDragMove(e) {
    if (!isDragging) return;
    const x    = getClientX(e);
    const now  = performance.now();
    const dt   = now - lastTime || 1;

    velocityX  = (x - lastX) / dt;
    dragDelta  = x - startX;
    lastX      = x;
    lastTime   = now;

    const angle = currentAngle + dragDelta * DRAG_FACTOR;
    applyRotation(angle);

    e.preventDefault();
  }

  function onDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('is-grabbing');

    carousel.style.transition = '';

    const threshold     = 40;   
    const momentumSteps = Math.round(Math.abs(velocityX) * 60);
    const steps         = clamp(
      Math.round(Math.abs(dragDelta) / threshold) + (momentumSteps > 1 ? 1 : 0),
      0,
      3
    );

    if (dragDelta < -threshold) {
      goTo(currentIndex + Math.max(1, steps));
    } else if (dragDelta > threshold) {
      goTo(currentIndex - Math.max(1, steps));
    } else {
      applyRotation(currentAngle);
    }

    resetAuto();
  }

    
  function onKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next(); resetAuto(); hideHint();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      prev(); resetAuto(); hideHint();
    }
  }

    
  function hideHint() {
    if (!hintHidden) {
      hintHidden = true;
      dragHint.classList.add('hidden');
    }
  }

    
  nextBtn.addEventListener('click', () => { next(); resetAuto(); hideHint(); });
  prevBtn.addEventListener('click', () => { prev(); resetAuto(); hideHint(); });

    
  carousel.addEventListener('mousedown',  onDragStart, { passive: false });
  window.addEventListener('mousemove',    onDragMove,  { passive: false });
  window.addEventListener('mouseup',      onDragEnd);

    
  carousel.addEventListener('touchstart', onDragStart, { passive: false });
  window.addEventListener('touchmove',    onDragMove,  { passive: false });
  window.addEventListener('touchend',     onDragEnd);

    
  window.addEventListener('keydown', onKeyDown);

    
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

    
  carousel.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaX > 30 || e.deltaY > 30)       { next(); resetAuto(); hideHint(); }
    else if (e.deltaX < -30 || e.deltaY < -30){ prev(); resetAuto(); hideHint(); }
  }, { passive: false });

    
  goTo(0, true);
  startAuto();

  setTimeout(hideHint, 5500);

})();