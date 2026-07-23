const website = document.getElementById("website");
const links = document.querySelectorAll(".navbar nav a");
const revealButton = document.getElementById("revealButton");

function toggleLoading(e) {
    e.preventDefault();
    website.classList.toggle("loading");
}

links.forEach(link => {
    link.addEventListener("click", toggleLoading);
});

revealButton.addEventListener("click", toggleLoading);