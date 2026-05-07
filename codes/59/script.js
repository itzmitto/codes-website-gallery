let max = 40;

txt.oninput = () => {
    let left = max - txt.value.length;

    count.innerText = left + " characters left";
};

txt.oninput();