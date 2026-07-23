const website = document.getElementById("website");

document.querySelectorAll("nav a").forEach(link => {

    link.addEventListener("click", () => {

        website.classList.remove("loading");

    });

});