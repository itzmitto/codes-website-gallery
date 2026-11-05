(() => {
  "use strict";

  const gallery = document.querySelector(".gallery");
  const stage = document.querySelector(".gallery-stage");
  const cards = [...document.querySelectorAll(".card[data-index]")];
  if (!gallery || !stage || cards.length === 0) return;

  const slides = [
    {
      title: "Tussen de toppen",
      region: "ALPEN · 01",
      note: "Stil water. Hoge pieken. Even helemaal weg.",
    },
    {
      title: "Waar de stilte begint",
      region: "WOESTIJN · 02",
      note: "Licht, zand en lijnen die nooit hetzelfde blijven.",
    },
    {
      title: "Langs de wilde kust",
      region: "ATLANTISCHE KUST · 03",
      note: "Een horizon die altijd iets verder lijkt te liggen.",
    },
  ];

  const thumbs = [...document.querySelectorAll(".thumb[data-index]")];
  const count = document.querySelector("#slide-count");
  const title = document.querySelector("#slide-title");
  const region = document.querySelector("#slide-region");
  const note = document.querySelector("#slide-note");
  const progress = document.querySelector("#slide-progress");
  const status = document.querySelector("#gallery-status");
  const autoplayButton = document.querySelector("#autoplay-toggle");
  const fullscreenButton = document.querySelector("#fullscreen-toggle");
  const fullscreenTarget = document.querySelector(".app") || gallery;
  const dialog = document.querySelector("#info-dialog");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  let current = 0;
  let autoplay = false;
  let autoplayTimer = null;
  let gesture = null;
  let suppressClickUntil = 0;

  function announce(message) {
    if (status) status.textContent = message;
  }

  function resetTilt() {
    cards.forEach((card) => {
      const inner = card.querySelector(".card-inner");
      if (!inner) return;
      inner.style.setProperty("--tilt-x", "0deg");
      inner.style.setProperty("--tilt-y", "0deg");
    });
  }

  function scheduleAutoplay() {
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
    if (!autoplay || document.hidden || dialog?.open || reducedMotion.matches)
      return;
    autoplayTimer = window.setInterval(() => selectSlide(current + 1), 5000);
  }

  function updateAutoplayButton() {
    if (!autoplayButton) return;
    const label = reducedMotion.matches
      ? "Automatisch afspelen uitgeschakeld: minder beweging is ingeschakeld"
      : autoplay
        ? "Automatisch afspelen pauzeren"
        : "Automatisch afspelen starten";
    autoplayButton.setAttribute("aria-pressed", String(autoplay));
    autoplayButton.setAttribute("aria-label", label);
    autoplayButton.title = label;
  }

  function selectSlide(index, userInitiated = false) {
    current = ((index % slides.length) + slides.length) % slides.length;
    const slide = slides[current];
    resetTilt();

    cards.forEach((card) => {
      const cardIndex = Number(card.dataset.index);
      const offset = (cardIndex - current + slides.length) % slides.length;
      card.dataset.position =
        offset === 0 ? "current" : offset === 1 ? "next" : "prev";
      if (cardIndex === current) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
      if (slides[cardIndex]) {
        card.setAttribute(
          "aria-label",
          cardIndex === current
            ? `Huidige afbeelding: ${slides[cardIndex].title}`
            : `Bekijk afbeelding: ${slides[cardIndex].title}`,
        );
      }
    });

    thumbs.forEach((thumb) => {
      const selected = Number(thumb.dataset.index) === current;
      thumb.setAttribute("aria-pressed", String(selected));
      if (selected) thumb.setAttribute("aria-current", "true");
      else thumb.removeAttribute("aria-current");
    });

    if (count)
      count.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    if (title) title.textContent = slide.title;
    if (region) region.textContent = slide.region;
    if (note) note.textContent = slide.note;
    if (progress) {
      progress.max = slides.length;
      progress.value = current + 1;
      progress.setAttribute(
        "aria-label",
        `Foto ${current + 1} van ${slides.length}`,
      );
    }
    stage.setAttribute(
      "aria-label",
      `Fotogalerij, foto ${current + 1} van ${slides.length}`,
    );

    if (userInitiated) {
      autoplay = false;
      updateAutoplayButton();
      announce(`Foto ${current + 1} van ${slides.length}: ${slide.title}.`);
      scheduleAutoplay();
    }
  }

  document
    .querySelector(".nav-prev")
    ?.addEventListener("click", () => selectSlide(current - 1, true));
  document
    .querySelector(".nav-next")
    ?.addEventListener("click", () => selectSlide(current + 1, true));

  [...cards, ...thumbs].forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < slides.length &&
        index !== current
      ) {
        selectSlide(index, true);
      }
    });
  });

  gallery.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || dialog?.open) return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    )
      return;
    const destinations = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (Object.hasOwn(destinations, event.key)) {
      event.preventDefault();
      selectSlide(destinations[event.key], true);
    }
  });

  gallery.addEventListener("focusin", (event) => {
    if (
      !autoplay ||
      event.target === autoplayButton ||
      autoplayButton?.contains(event.target)
    )
      return;
    autoplay = false;
    updateAutoplayButton();
    scheduleAutoplay();
    announce("Automatisch afspelen gepauzeerd.");
  });

  stage.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });

  window.addEventListener("pointerup", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const distanceX = event.clientX - gesture.x;
    const distanceY = event.clientY - gesture.y;
    gesture = null;
    if (
      Math.abs(distanceX) > 40 &&
      Math.abs(distanceX) > Math.abs(distanceY) * 1.25
    ) {
      suppressClickUntil = performance.now() + 500;
      selectSlide(current + (distanceX < 0 ? 1 : -1), true);
    }
  });

  window.addEventListener("pointercancel", () => {
    gesture = null;
    resetTilt();
  });

  stage.addEventListener(
    "click",
    (event) => {
      if (performance.now() < suppressClickUntil && event.detail !== 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressClickUntil = 0;
      }
    },
    true,
  );

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        event.pointerType !== "mouse" ||
        Number(card.dataset.index) !== current
      )
        return;
      const inner = card.querySelector(".card-inner");
      if (!inner) return;
      const bounds = card.getBoundingClientRect();
      const x = Math.max(
        -1,
        Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2),
      );
      const y = Math.max(
        -1,
        Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2),
      );
      inner.style.setProperty("--tilt-x", `${(-y * 6).toFixed(2)}deg`);
      inner.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", resetTilt);
    card.querySelector("img")?.setAttribute("draggable", "false");
  });

  autoplayButton?.addEventListener("click", () => {
    if (reducedMotion.matches) {
      announce(
        "Automatisch afspelen staat uit vanwege je voorkeur voor minder beweging.",
      );
      return;
    }
    autoplay = !autoplay;
    updateAutoplayButton();
    scheduleAutoplay();
    announce(
      autoplay
        ? "Automatisch afspelen gestart. Elke vijf seconden verschijnt een nieuwe foto."
        : "Automatisch afspelen gepauzeerd.",
    );
  });

  document.addEventListener("visibilitychange", scheduleAutoplay);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      autoplay = false;
      resetTilt();
    }
    updateAutoplayButton();
    scheduleAutoplay();
  });
  finePointer.addEventListener("change", resetTilt);

  if (fullscreenButton) {
    if (
      typeof fullscreenTarget.requestFullscreen !== "function" ||
      document.fullscreenEnabled === false
    ) {
      fullscreenButton.hidden = true;
    } else {
      const updateFullscreenButton = () => {
        const active = Boolean(document.fullscreenElement);
        const label = active
          ? "Volledig scherm afsluiten"
          : "Volledig scherm openen";
        fullscreenButton.setAttribute("aria-label", label);
        fullscreenButton.setAttribute("aria-pressed", String(active));
        fullscreenButton.title = label;
      };
      fullscreenButton.addEventListener("click", async () => {
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await fullscreenTarget.requestFullscreen();
        } catch {
          announce(
            "Volledig scherm kon niet worden geopend. Je kunt de galerij gewoon blijven gebruiken.",
          );
        }
      });
      document.addEventListener("fullscreenchange", updateFullscreenButton);
      updateFullscreenButton();
    }
  }

  if (dialog && typeof dialog.showModal === "function") {
    document.querySelector("#info-open")?.addEventListener("click", () => {
      if (!dialog.open) dialog.showModal();
      resetTilt();
      scheduleAutoplay();
    });
    document
      .querySelector("#info-close")
      ?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", scheduleAutoplay);
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        dialog.close();
      }
    });
  }

  selectSlide(0);
  updateAutoplayButton();
})();
