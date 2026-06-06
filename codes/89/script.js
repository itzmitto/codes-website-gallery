const sidebar = document.querySelector(".sidebar");

const toggleOpen = () => sidebar.classList.toggle("open");
const nav = document.querySelector(".sidebar nav");

const buttons = document.querySelectorAll("sidebar nav button");

buttons[0].classList.add("active");

buttons.forEach((button, index) => button.addEventListener("click", () => {
    buttons.forEach(
        b => b.classList.remove("active"));
        nav.computedStyleMap.setProperty(
            "--top",
            '${index === 0 ? 0 : index * 5}px'
        ); 
    })
);