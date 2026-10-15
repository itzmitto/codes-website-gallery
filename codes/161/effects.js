"use strict";
(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  // Reveal individual demo panels only when they become visible; content stays visible without JS.
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("motion-ready");
    const reveal = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    $$("[data-reveal]").forEach((element) => reveal.observe(element));
    $$(".center-headline").forEach((section) => {
      const child = section.querySelector("h2");
      if (!child) return;
      child
        .animate(
          [
            { opacity: 0.5, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 700,
            fill: "both",
            easing: "ease-out",
            timeline: undefined,
          },
        )
        .pause();
      const animation = child.getAnimations().at(-1);
      const headObserver = new IntersectionObserver(
        (entries, observer) => {
          if (entries[0].isIntersecting) {
            animation?.play();
            observer.disconnect();
          }
        },
        { threshold: 0.18 },
      );
      headObserver.observe(section);
    });
  }
  // Gallery tabs change both the image and tab progress, with an optional timed slideshow.
  const gallery = document.getElementById("gallery-image");
  const tabs = $$(".showcase-tab");
  const pics = {
    generation: {
      src: "assets/night-sky.webp",
      alt: "Milky Way shining above a desert landscape at night",
    },
    review: {
      src: "assets/star-review.webp",
      alt: "A clear star-filled night sky above rugged ground",
    },
    testing: {
      src: "assets/coast-sunset.webp",
      alt: "Golden sunset light reflecting along the shoreline",
    },
    deploy: {
      src: "assets/coast-deploy.webp",
      alt: "Dramatic sunset along an ocean shore",
    },
  };
  Object.values(pics).forEach(({ src }) => {
    const preload = new Image();
    preload.src = src;
  });
  let active = "generation";
  let changedByUserAt = 0;
  let galleryVisible = false;
  let transitionNumber = 0;
  function switchGallery(next) {
    const item = pics[next];
    if (!item || active === next) return;
    active = next;
    const id = ++transitionNumber;
    gallery.classList.add("is-swapping");
    const newImage = new Image();
    newImage.onload = () => {
      if (id !== transitionNumber) return;
      setTimeout(
        () => {
          if (id !== transitionNumber) return;
          gallery.src = item.src;
          gallery.alt = item.alt;
          requestAnimationFrame(() => gallery.classList.remove("is-swapping"));
        },
        reduceMotion ? 0 : 125,
      );
    };
    newImage.onerror = () => gallery.classList.remove("is-swapping");
    newImage.src = item.src;
  }
  tabs.forEach((tab) =>
    tab.addEventListener("click", (event) => {
      if (event.isTrusted) changedByUserAt = Date.now();
      switchGallery(tab.dataset.tab);
      tab
        .querySelector(".tab-progress")
        ?.getAnimations()
        .forEach((animation) => {
          animation.cancel();
          animation.play();
        });
    }),
  );
  if ("IntersectionObserver" in window) {
    const galleryObserver = new IntersectionObserver(
      (entries) => {
        galleryVisible = entries[0].isIntersecting;
      },
      { threshold: 0.25 },
    );
    galleryObserver.observe(document.querySelector(".product-showcase"));
  } else galleryVisible = true;
  if (!reduceMotion)
    window.setInterval(() => {
      if (
        !galleryVisible ||
        document.hidden ||
        Date.now() - changedByUserAt < 18000
      )
        return;
      const index = tabs.findIndex((tab) =>
        tab.classList.contains("is-active"),
      );
      tabs[(index + 1) % tabs.length]?.click();
    }, 7200);
  // Terminal logs materialize on scroll; the cloned status follows the log sequence.
  if ("IntersectionObserver" in window && !reduceMotion) {
    const terminalObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-live");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.45 },
    );
    $$(".clone-window").forEach((windowElement) =>
      terminalObserver.observe(windowElement),
    );
  }
  // Pause offscreen ticker animations to reduce unnecessary CPU/GPU work.
  if ("IntersectionObserver" in window) {
    const ticker = document.querySelector(".testimonials");
    const tracks = $$(".marquee-track");
    if (ticker)
      new IntersectionObserver(
        ([entry]) => {
          tracks.forEach(
            (track) =>
              (track.style.animationPlayState =
                entry.isIntersecting && !reduceMotion ? "" : "paused"),
          );
        },
        { threshold: 0 },
      ).observe(ticker);
  }
})();
