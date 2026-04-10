const orb = document.getElementById('orb');
const expandedMenu = document.getElementById('expanded-menu');
const pagesGrid = document.getElementById('pages-grid');
const closeBtn = document.getElementById('close-btn');

// Create 10 page cards
for (let i = 1; i <= 10; i++) {
  const card = document.createElement('a');
  card.href = `page${i}.html`;
  card.className = 'page-card';
  card.innerHTML = `
    <h3>Page ${i}</h3>
    <p>Explore section ${i}</p>
  `;
  pagesGrid.appendChild(card);
}

// Open menu when orb is clicked
orb.addEventListener('click', () => {
  expandedMenu.classList.add('active');
  // Nice orb shrink effect
  orb.style.transform = 'scale(0.6)';
});

// Close menu
closeBtn.addEventListener('click', () => {
  expandedMenu.classList.remove('active');
  orb.style.transform = 'scale(1)';
});

// Close menu when clicking outside the content
expandedMenu.addEventListener('click', (e) => {
  if (e.target === expandedMenu) {
    expandedMenu.classList.remove('active');
    orb.style.transform = 'scale(1)';
  }
});

// Keyboard escape support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && expandedMenu.classList.contains('active')) {
    expandedMenu.classList.remove('active');
    orb.style.transform = 'scale(1)';
  }
});