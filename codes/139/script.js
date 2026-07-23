const website = document.getElementById("website");
const links = document.querySelectorAll("nav a");
links.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        website.classList.remove("loading");
    });
});