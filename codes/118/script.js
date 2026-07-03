const grid = document.getElementById("grid");
grid.classList.add("collapsed");

grid.addEventListener("click", e => {
    grid.classList.toggle("collapsed");
});

document.querySelectorAll(".cell").forEach(btn => {
    btn.addEventListener("click", e => {
        e.stopPropagation();
        document.querySelectorAll(".cell").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
    });
});
