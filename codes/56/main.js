const fill = document.querySelector('.progress-bar');
const procent = document.querySelector('.procent');
const status = document.querySelector('.status');

let progress = 0;

const interval = setInterval(() => {
    progress++;

    fill.style.width = progress + '%';
    procent.textContent = progress + '%';

    if (progress === 100) {
        clearInterval(interval);
        status.textContent = 'Done!';
        status.style.color = '#22c55e';
    }

}, 30);