const website = document.getElementById("website");
const links = document.querySelectorAll(".navbar nav a");
const revealButton = document.getElementById("revealButton");
const logo = document.querySelector(".logo");

const logoHTML = "🍃 MIDORI";
const storeHTML = "Find a Store <span class=\"badge-arrow\">&#8599;</span>";

function render() {
    const loaded = !website.classList.contains("loading");

    logo.classList.toggle("skeleton", !loaded);
    logo.classList.toggle("logo-real", loaded);
    logo.innerHTML = loaded ? logoHTML : "";

    revealButton.classList.toggle("skeleton", !loaded);
    revealButton.classList.toggle("store-real", loaded);
    revealButton.innerHTML = loaded ? storeHTML : "";
}

function toggleLoading(e) {
    e.preventDefault();
    website.classList.toggle("loading");
    render();
}

links.forEach(link => {
    link.addEventListener("click", toggleLoading);
});

revealButton.addEventListener("click", toggleLoading);

render();