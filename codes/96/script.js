const info = {
  fadeIn: {
    icon: "ti-sun",
    label: "Fade in",
    desc: "Het element verschijnt door de opacity geleidelijk van 0 naar 1 te animeren.",
  },
  slideUp: {
    icon: "ti-arrow-up",
    label: "Slide up",
    desc: "Het element schuift omhoog vanuit de onderkant terwijl het zichtbaar wordt.",
  },
  scale: {
    icon: "ti-maximize",
    label: "Scale",
    desc: "Het element groeit vanuit het middelpunt naar zijn volledige grootte.",
  },
  swing: {
    icon: "ti-rotate-clockwise",
    label: "Swing",
    desc: "Het element slingert als een slinger voordat het tot rust komt.",
  },
  flip: {
    icon: "ti-refresh",
    label: "Flip",
    desc: "Het element draait 90 graden rondom de y-as als een omdraaiende kaart.",
  },
  blur: {
    icon: "ti-focus-2",
    label: "Blur",
    desc: "Het element scherpstelt vanuit een wazige toestand naar volledige helderheid.",
  },
  unfold: {
    icon: "ti-layout-bottombar-expand",
    label: "Unfold",
    desc: "Het element vouwt open van boven naar beneden, zoals een rol papier.",
  },
  rotate: {
    icon: "ti-rotate",
    label: "Rotate",
    desc: "Het element draait 180 graden terwijl het vergroot naar zijn normale grootte.",
  },
};

const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");

function openModal(type) {
  const d = info[type];
  document.getElementById("modalIcon").innerHTML =
    `<i class="ti ${d.icon}" aria-hidden="true"></i>`;
  document.getElementById("modalTitle").textContent = d.label;
  document.getElementById("modalDesc").textContent = d.desc;
  overlay.className = "overlay active anim-" + type;
  overlay.classList.add("active");
}

function closeModal() {
  overlay.classList.remove("active");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

document.querySelectorAll(".card").forEach((c) => {
  c.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") c.click();
  });
});
