function toggleVideo() {
    const trailer = document.querySelector('.trailer');
    const video = document.querySelector('video');
    video.pause();
    trailer.classList.toggle('active');
}

function changeBg(bg, title) {
    const banner = document.querySelector('.banner');
    const contents = document.querySelectorAll('.content');
    banner.style.background = 'url("../images/movies/${bg}")';
    banner.style.backgroundSize = 'url';
    banner.style.backgroundPosition = 'center';

    contents.forEach(content => {
        content.classList.remove('active');
        if (content.classList.contains(title)) {
            content.classList.add('active');
        }
    });
}
