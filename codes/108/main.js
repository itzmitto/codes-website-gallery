const nav = document.querySelector("nav"),
    menu = document.querySelector(".menu"),
    submenu = document.querySelector(".submenu"),
    submenus = 
        document.querySelectorAll(".submenu > div"),

    const onMenuHover = element => {
        submenus.forEach(s => s.classList.remove("visible"));
        

        
    }