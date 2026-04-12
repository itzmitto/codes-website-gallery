let display = document.getElementById("display");
let memory = 0;

function append(value) {
    display.value += value;
} 

function clearDisplay() {
    display.value = "";
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

function calculate() {
    try {
        display.value = eval(display.value);
    } catch (error) {  
        display.value = "Error";
    }   
}
function sqrt() {
        display.value = Math.sqrt(eval(display.value));
    } 

    function power() {