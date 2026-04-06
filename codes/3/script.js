const sidebar = document.querySelector(".sidebar");
const expandBtn = document.querySelector(".expand-btn");
const allLinks = document.querySelectorAll(".sidebar-links a");
const searchInput = document.querySelector(".search_wrapper input");

expandBtn.addEventListener("click", () => {
    const isCollapsed = document.body.classList.toggle("collapsed");
    expandBtn.setAttribute("aria-expanded", String(!isCollapsed));
});

allLinks.forEach((link) => {
    link.addEventListener("click", () => {
        allLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
    });
});

searchInput.addEventListener("focus", () => {
    document.body.classList.remove("collapsed");
    expandBtn.setAttribute("aria-expanded", "true");
});