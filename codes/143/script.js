const wrapper = document.querySelector(".wrapper");
const toggle = document.getElementById("toggle");

toggle.addEventListener("click", () => {
    wrapper.classList.toggle("open");
});