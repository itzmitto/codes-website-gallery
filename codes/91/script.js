const cards = document.querySelectorAll(".card");
const modal = document.getElementById("modal");
const modalContent = document.querySelector(".modal-content");
const title = document.getElementById("title");
const cssCode = document.getElementById("cssCode");
const closeBtn = document.querySelector(".close");

const animationCSS = {
    fade: `.fade {
  animation: fade .4s ease;
}`,

    slide: `.slide {
  animation: slide .4s ease;
}`,

    scale: `.scale {
  animation: scale .4s ease;
}`,

    swing: `.swing {
  animation: swing .6s ease;
}`,

    flip: `.flip {
  animation: flip .6s ease;
}`,

    blur: `.blur {
  animation: blur .5s ease;
}`,

    unfold: `.unfold {
  animation: unfold .5s ease;
}`,

    rotate: `.rotate {
  animation: rotate .5s ease;
}`
};

cards.forEach(card => {
    card.addEventListener("click", () => {
        const animation = card.dataset.animation;

        modal.classList.add("show");

        modalContent.className = "modal-content";
        modalContent.classList.add(animation);

        title.textContent =
            animation.charAt(0).toUpperCase() + animation.slice(1);

        cssCode.textContent = animationCSS[animation];
    });
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("show");
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("show");
    }
});