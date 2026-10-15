"use strict";

const one = (selector, scope = document) => scope.querySelector(selector);
const all = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];

// Header: accessible dropdown, mobile navigation and theme switch.
const productsButton = one("#product-menu-btn");
const productsMenu = one("#product-menu");
const mobileMenuButton = one("#mobile-menu-toggle");
const mobileMenu = one("#mobile-navigation");
function closeProductsMenu() {
  productsMenu.hidden = true;
  productsButton.setAttribute("aria-expanded", "false");
}
productsButton.addEventListener("click", (event) => {
  event.stopPropagation();
  const open = productsMenu.hidden;
  productsMenu.hidden = !open;
  productsButton.setAttribute("aria-expanded", String(open));
});
document.addEventListener("click", (event) => {
  if (
    !productsMenu.contains(event.target) &&
    !productsButton.contains(event.target)
  )
    closeProductsMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProductsMenu();
    mobileMenu.hidden = true;
    mobileMenuButton.setAttribute("aria-expanded", "false");
    one("#integrations-popover").hidden = true;
  }
});
mobileMenuButton.addEventListener("click", () => {
  const shouldOpen = mobileMenu.hidden;
  mobileMenu.hidden = !shouldOpen;
  mobileMenuButton.setAttribute("aria-expanded", String(shouldOpen));
});
all(".mobile-navigation a, .nav-dropdown a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.hidden = true;
    mobileMenuButton.setAttribute("aria-expanded", "false");
    closeProductsMenu();
  });
});
const themeButton = one("#theme-toggle");
let savedTheme;
try {
  savedTheme = localStorage.getItem("codeforge-theme");
} catch (_) {
  savedTheme = null;
}
if (savedTheme === "dark") document.body.classList.add("dark-mode");
function refreshThemeLabel() {
  const isDark = document.body.classList.contains("dark-mode");
  themeButton.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode",
  );
  document.querySelector('meta[name="theme-color"]').content = isDark
    ? "#13161a"
    : "#f8f9fa";
}
refreshThemeLabel();
themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  try {
    localStorage.setItem(
      "codeforge-theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light",
    );
  } catch (_) {}
  refreshThemeLabel();
});

// Homepage preview selector: image remains identical to the supplied reference.
const previewMessages = {
  generation: "Code generation — transform ideas into working features",
  review: "Smart review — identify issues before merging",
  testing: "Auto testing — catch regressions earlier",
  deploy: "Deploy ready — ship changes with confidence",
};
let previewStatusTimer;
all(".showcase-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    all(".showcase-tab").forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    one("#preview-panel").setAttribute("aria-labelledby", tab.id);
    const status = one("#preview-status");
    if (tab.dataset.tab === "generation") {
      status.classList.remove("visible");
    } else {
      status.textContent = previewMessages[tab.dataset.tab];
      status.classList.add("visible");
    }
    clearTimeout(previewStatusTimer);
    if (tab.dataset.tab !== "generation")
      previewStatusTimer = setTimeout(
        () => status.classList.remove("visible"),
        4000,
      );
  });
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const tabs = all(".showcase-tab");
    let next = tabs.indexOf(tab);
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else
      next =
        (next + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
        tabs.length;
    tabs[next].focus();
    tabs[next].click();
  });
});
all(".showcase-tab").forEach((tab) => {
  tab.tabIndex = tab.classList.contains("is-active") ? 0 : -1;
});

// Make the screenshot's visual diff a functioning miniature demo.
const diffButton = one("#apply-suggestion");
const codeBlock = one("#code-lines");
const initialCode = codeBlock.innerHTML;
const appliedCode = [
  "import { useState, useEffect } from 'react';",
  "import { cn } from '@/lib/utils';",
  "export function useCounter() {",
  "  const [count, setCount] = useState(0);",
  "",
  "  useEffect(() => {",
  "    console.log('Count changed:', count);",
  "  }, [count]);",
  "  return { count, setCount };",
  "}",
];
let suggestionApplied = false;
diffButton.addEventListener("click", () => {
  suggestionApplied = !suggestionApplied;
  if (suggestionApplied) {
    codeBlock.replaceChildren(
      ...appliedCode.map((line) => {
        const div = document.createElement("div");
        div.textContent = line || "\u00a0";
        return div;
      }),
    );
    diffButton.textContent = "✓ Suggestion applied";
    diffButton.setAttribute("aria-pressed", "true");
  } else {
    codeBlock.innerHTML = initialCode;
    diffButton.textContent = "Apply suggestion";
    diffButton.setAttribute("aria-pressed", "false");
  }
});

// Small agent / integration demo controls. No backend calls or sign-in needed.
one("#run-demo-button").addEventListener("click", () => {
  const status = one("#run-demo-toast");
  status.textContent = "Agent preview started · Browse the workflow below";
  setTimeout(() => {
    status.textContent = "";
  }, 4000);
});
const integrationsPopover = one("#integrations-popover");
all("[data-open-integrations]").forEach((button) =>
  button.addEventListener("click", () => {
    integrationsPopover.hidden = false;
  }),
);
one("#popover-close").addEventListener("click", () => {
  integrationsPopover.hidden = true;
});
one("#popover-jump").addEventListener("click", () => {
  integrationsPopover.hidden = true;
});
all("[data-scroll-next]").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .getElementById(button.dataset.scrollNext)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
const integrationsSearch = one("#integrations-search");
integrationsSearch.addEventListener("input", () => {
  const needle = integrationsSearch.value.toLocaleLowerCase().trim();
  const rows = all(".integration-item");
  rows.forEach((row) => {
    row.hidden = !row.dataset.search.includes(needle);
  });
  one(".integrations-empty").hidden = rows.some((row) => !row.hidden);
});
const installAction = one(".install-action");
installAction.addEventListener("click", () => {
  installAction.textContent =
    installAction.textContent.trim() === "Installed" ? "Add" : "Installed";
});
one("#demo-prompt-send").addEventListener("click", () => {
  const prompt = one("#demo-prompt");
  const feedback = one("#prompt-feedback");
  feedback.textContent = prompt.value.trim()
    ? "Demo only · Prompt ready to send"
    : "Type your request to try the demo";
});

// Community testimonial cards. Repeating the same sequence creates a seamless marquee.
const testimonials = [
  {
    quote:
      "By integrating #GreenTech’s sustainable energy solutions, we've seen a significant reduction in carbon footprint. <mark>Leading the way in eco-friendly business practices.</mark> Pioneering change in the industry.",
  },
  {
    quote:
      "The AI-driven analytics from #QuantumInsights have revolutionized our product development cycle. Insights are now more accurate and faster than ever. A game-changer for tech companies.",
  },
  {
    quote:
      "Implementing #AIStream’s customer prediction model has drastically improved our targeting strategy. Seeing a 50% increase in conversion rates! Highly recommend their solutions.",
  },
  {
    quote:
      "As a startup, we need to move fast and stay ahead. #CodeAI's automated coding assistant helps us do just that. Our development speed has doubled, tool for any startup.",
  },
  {
    quote:
      "#DataFlow's supply chain optimization tools transformed our workflow and our operational efficiency. <mark>Results in logistics have surpassed expectations.</mark>",
  },
  {
    quote:
      "Our team's development process is so much faster. Code review is consistent, clear, and much easier to follow throughout every sprint.",
  },
];
const testimonialsTwo = [
  {
    quote:
      "#FashionForward's market analysis AI has revolutionized how we approach fashion campaigns. <mark>New data-driven ways to build customer engagement.</mark> Revolutionizing the world of marketing.",
  },
  {
    quote:
      "Implementing #MediCareAI in our patient care systems has improved patient outcomes significantly. <mark>Technology and healthcare working hand in hand for better health.</mark> A milestone in medical technology.",
  },
  {
    quote:
      "#LearnSmart’s AI-driven personalized learning plans have doubled student performance metrics. <mark>Education tailored to every learner’s needs.</mark> Transforming the educational landscape.",
  },
  {
    quote:
      "With #CyberShield’s AI-powered security systems, our data is safer and our uptime unmatched. <mark>Security with no compromises.</mark>",
  },
  {
    quote:
      "Our team can prototype new features in less time than ever before, without sacrificing reliability or the standards our engineers care about.",
  },
];
testimonials.splice(
  4,
  2,
  {
    quote:
      "#VoiceGen's AI-driven voice synthesis has made creating global products a breeze. Localization is now seamless and efficient. <mark>A must-have for global product teams.</mark>",
  },
  {
    quote:
      "Leveraging #DataCrunch's AI for our financial models has given us an edge in predictive accuracy. Our investment strategies are now powered by <mark>real-time data analytics.</mark>",
  },
  {
    quote:
      "#LogiTech's supply chain optimization tools have drastically reduced our operational costs. <mark>Efficiency and accuracy in logistics have never been better.</mark>",
  },
);
testimonialsTwo.splice(
  3,
  2,
  {
    quote:
      "With #CyberShield's AI-powered security systems, our data protection levels are unmatched. <mark>Ensuring safety and trust in digital spaces.</mark> Redefining cybersecurity standards.",
  },
  {
    quote:
      "#DesignPro's AI has streamlined our creative process, enhancing productivity and innovation. <mark>Bringing creativity and technology together.</mark>",
  },
  {
    quote:
      "#VentureAI's insights into startup ecosystems have been invaluable for our growth and funding strategies. <mark>Empowering startups with data-driven decisions.</mark>",
  },
);
function makeTestimonial(testimonial) {
  const article = document.createElement("article");
  article.className = "testimonial-card";
  article.innerHTML = `<p>${testimonial.quote}</p>`;
  return article;
}
for (const [container, data] of [
  [one("#marquee-one"), testimonials],
  [one("#marquee-two"), testimonialsTwo],
]) {
  [...data, ...data].forEach((testimonial, index) => {
    const card = makeTestimonial(testimonial);
    if (index >= data.length) card.setAttribute("aria-hidden", "true");
    container.appendChild(card);
  });
}

// Billing is an actual price switch. "Annually" displays the equivalent monthly price.
all(".billing-option").forEach((option) => {
  option.addEventListener("click", () => {
    const billing = option.dataset.billing;
    all(".billing-option").forEach((item) => {
      const active = item === option;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    all(".price[data-monthly]").forEach((price) => {
      price.textContent = price.dataset[billing];
    });
    all(".per-month").forEach((label) => {
      label.title =
        billing === "annually"
          ? "Monthly equivalent when billed annually"
          : "Billed monthly";
    });
  });
});
all(".faq details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    all(".faq details").forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});

// This is a static website study, not the real CodeForge product.
// Keep CTAs honest instead of linking to nonexistent payments or accounts.
all('a[href^="mailto:"]').forEach((link) => {
  if (!link.href.includes(".example")) return;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const text = link.textContent.trim();
    if (
      text === "Upgrade to Pro" ||
      text === "Contact Sales" ||
      text === "Start Free"
    ) {
      showDemoMessage(
        "This is a frontend demo; no account or payment service is connected.",
      );
    } else {
      showDemoMessage("Contact details are not connected in this demo.");
    }
  });
});
let toastTimeout;
function showDemoMessage(message) {
  let toast = one("#demo-action-message");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "demo-action-message";
    toast.setAttribute("role", "status");
    toast.className = "action-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 4200);
}
