const eyeSvg = `<svg width="28" height="28" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2">
  <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>
  <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>
</svg>`;

const eyeOffSvg = `<svg width="28" height="28" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2">
  <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"/>
  <path d="M16.681 16.673a8.717 8.717 0 0 1
    -4.681 1.327c-3.6 0 -6.6 -2 -9 -6
    c1.272 -2.12 2.712 -3.678 4.32 -4.674"/>
  <path d="M3 3l18 18"/>
</svg>`;

const input = document.getElementById("password");
const toggle = document.querySelector(".input-group__toggle");
const strengthFill = document.getElementById("strength-fill");
const strengthLevel = document.getElementById("strength-level");
const submitBtn = document.getElementById("submit-btn");

toggle.innerHTML = eyeSvg;

toggle.addEventListener("click", () => {
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  toggle.innerHTML = isPassword ? eyeOffSvg : eyeSvg;
});

input.addEventListener("focus", () => {
  toggle.style.color = "var(--primary)";
});

input.addEventListener("blur", () => {
  toggle.style.color = "";
});

const rules = [
  { name: "low-upper-case", pattern: /(?=.*[a-z])(?=.*[A-Z])/ },
  { name: "one-number", pattern: /[0-9]/ },
  { name: "one-special-char", pattern: /[!@#$%^&*?_~]/ },
  { name: "eight-character", pattern: /.{8,}/ },
];

const strengthLevels = [
  { max: 0, width: "0%", level: "", label: "" },
  { max: 1, width: "15%", level: "weak", label: "Weak" },
  { max: 3, width: "60%", level: "average", label: "Average" },
  { max: 4, width: "100%", level: "strong", label: "Strong" },
];

function checkStrength(password) {
  let strength = 0;

  rules.forEach(({ name, pattern }) => {
    const item = document.querySelector(`[data-rule="${name}"]`);
    const met = pattern.test(password);
    item.setAttribute("data-met", met);
    if (met) strength++;
  });

  if (!password) {
    strengthFill.style.width = "0%";
    submitBtn.disabled = true;
    return;
  }

  const level = strengthLevels.find((l) => strength <= l.max);
  strengthFill.style.width = level.width;
  strengthFill.setAttribute("data-level", level.level);
  strengthLevel.textContent = level.label;
  submitBtn.disabled = strength < 4;
}

input.addEventListener("input", () => {
  checkStrength(input.value);
});
