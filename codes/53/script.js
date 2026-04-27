const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");
const overlay = document.getElementById("overlay");

openModal.onclick = () => overlay.style.display = "flex";

closeModal.onclick = () => overlay.style.display = "none";