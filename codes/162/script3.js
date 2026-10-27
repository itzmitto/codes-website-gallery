const title = document.querySelector("#title");

console.log(title.textContent);
title.textContent = "New Title";
title.innerText = "Hello world!";
title.innerHTML = "<span>Updated!</span>";

const info = document.getElementsByClassName("info");

for (let i = 0; i < info.length; i++) {
    info[i].style.color = "purple";
    info[i].style.fontSize = "32px";
    info[i].style.fontWeight = "bold";
    info[i].style.background = "yellow";
    info[i].style.padding = "10px";
}

const list = document.querySelector("#list");
const btn = document.querySelector("#btn");

btn.addEventListener("click", function() {
    const li = document.createElement("li");
    li.textContent = "New Item";
    list.appendChild(li);
});