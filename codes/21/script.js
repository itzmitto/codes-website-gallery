const hamburger = document.getElementById('hamburger'); 
const socialGrid = document.getElementById('socialGrid');

let isOpen = false;
 
hamburger.addEventListener('click', () => {
    isOpen = !isOpen;
    
    if (isOpen) {
        socialGrid.classList.add('active');
        // Hamburger to close animation
        hamburger.style.transform = 'translate(-50%, -50%) rotate(90deg)';
    } else {
        socialGrid.classList.remove('active');
        hamburger.style.transform = 'translate(-50%, -50%)'; 
    }
});

// Optional: close when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !socialGrid.contains(e.target)) {
        if (isOpen) {
            isOpen = false;
            socialGrid.classList.remove('active');
            hamburger.style.transform = 'translate(-50%, -50%)';
        }
    }
});