// ─── Apply per-card hover color from data-color attribute ───
document.querySelectorAll('.link-item').forEach(item => {
  const color = item.getAttribute('data-color');
  if (color) {
    item.style.setProperty('--hover-color', color);
  }
});

// ─── Ripple effect on click ───
document.querySelectorAll('.link-item a').forEach(link => {
  link.addEventListener('click', function (e) {
    const item = this.closest('.link-item');
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = item.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      transform: scale(0);
      animation: rippleAnim 0.5s ease-out forwards;
      pointer-events: none;
      z-index: 2;
    `;

    item.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// ─── Inject ripple keyframes once ───
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleAnim {
    to {
      transform: scale(2.5);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);