const menuBtn = document.getElementById('menuBtn');
const socialGrid = document.getElementById('socialGrid');

menuBtn.addEventListener('click', () => {  
  socialGrid.classList.toggle('active');
  
  // Hamburger animation
  const hamburger = menuBtn.querySelector('.hamburger');
  if (socialGrid.classList.contains('active')) {
    hamburger.style.background = 'transparent';
    hamburger.style.transform = 'rotate(45deg)';
    hamburger.style.top = '10px';
    
    setTimeout(() => {
      hamburger.style.transform = 'rotate(-45deg)';
    }, 200);
  } else {
    hamburger.style.background = '#222';
    hamburger.style.transform = 'none';
    hamburger.style.top = '0';
  }
});

// Optioneel: ook openen bij hover (zoals in video)
menuBtn.addEventListener('mouseenter', () => {
  if (!socialGrid.classList.contains('active')) {
    socialGrid.classList.add('active');
  }
});