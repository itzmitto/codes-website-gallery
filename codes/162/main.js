// Basic regular function
function showMessage() {
    console.log("Welcome to javascript tutorial!");
}

showMessage();

// Regular function with parameter 
function showWeather(city){
    console.log(city + " is sunny today!");
}
showWeather("NewYork");
showWeather("Chicago");

// Function with Return and Multiple Parameters
function addNumbers(a, b) {
    return a + b;
}
console.log(addNumbers(10, 5));



// Function with Return and Multiple Parameters
function showCountry(country = "USA") {
    console.log ("what is your country: " + country);
}
showCountry();
showCountry("Canada");
showCountry(undefined);
showCountry(null);

// Mutiple default parameters
function placeOrder(drink = "Tea", gty = 1) {
    return gty + " cup of " + drink;
}
console.log(placeOrder());
console.log(placeOrder("Coffee", 2));


// Arrow function 
const showMessages = () => {
    console.log("This is an arrow Function");
};
showMessages();

// Arrow function with parameter
const checkEvenOdd = (num) => {
    if(num % 2 === 0) {
        console.log("Even");
    } else {
        console.log("Odd");
    }
};
checkEvenOdd(7);

// Shorter one-line arrow function
const multiply = (a, b) => a * b;
console.log(multiply(6, 4));

showMessage();
