const panels = document.querySelectorAll('.panel');
const dots = document.querySelectorAll('.dot');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const index = Array.from(panels).indexOf(entry.target);
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            entry.target.classList.add('in-view');
            dots.forEach(d => d.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');
        }
    });
}, { threshold: [0.5] });

panels.forEach(panel => observer.observe(panel));