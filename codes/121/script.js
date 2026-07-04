const box = document.getElementById("box");
const text = document.getElementById("description");

const marginBtn = document.getElementById("marginBtn");
const paddingBtn = document.getElementById("paddingBtn");
const resetBtn = document.getElementById("resetBtn");

marginBtn.addEventListener("click", () => {

    box.style.margin = "60px auto";
    box.style.padding = "20px";

    text.innerHTML =
        "<strong>Margin:</strong> De ruimte BUITEN het element is groter geworden. Het element staat verder weg van andere elementen.";

});

paddingBtn.addEventListener("click", () => {

    box.style.margin = "0 auto";
    box.style.padding = "60px";

    text.innerHTML =
        "<strong>Padding:</strong> De ruimte BINNEN het element is groter geworden. De tekst staat verder van de rand.";

});

resetBtn.addEventListener("click", () => {

    box.style.margin = "0 auto";
    box.style.padding = "20px";

    text.innerHTML =
        "Alles staat weer op de beginwaarde.";

});