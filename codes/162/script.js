// alert("This is MY Javascript tutorial");

// document.title = "My JS Page";

console.log("CSSnippets");
console.log(10 + 5);
console.log("10" + "5");

// let name = 'André';
// console.log(name);
// name = "Adam";
// console.log(name);

// const country = "Germany";
// console.log(country);

// const test = "abcdefghijklmnopqrstuvwxyz";
// console.log(test);

// let name = "André";
// let age = 22;
// const country = "Germany";
// let isStudent = true;

// console.log(`Hello ${name}, age ${age}, and im a student from ${country}!`);




let score = 95;

if(score >= 90) {
    console.log("A grade");
} else if (score >= 75) {
    console.log("B grade");
} else if (score >= 60) {
    console.log("C grade");
} else {
    console.log("Fail");
}



let day = "Friday";

switch(day) {
    case "Monday":
        console.log("Start of the week");
        break;
    case "Friday":
        console.log("Almost weekend!");
        break;
    case "Saturday":
    case "Sunday":
        console.log("Weekend!");
    default: 
        console.log("Midweek");
}



let age = 25;
let hasId = true;
let isVIP = false;

if(age >= 18 && hasId) {
    console.log("Entry allowed");
}

if (isVIP || age > 60) {
    console.log("Priority lane");
}

console.log(!isVIP);
let name = null;
console.log(name ?? "Guest");



for (let i = 1; i<= 5; i++) {
    console.log(i);
}

const fruits = ["mango", "banana", "apple"];
for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}

let count = 5;

while (count <= 3) {
    console.log("count:" + count);
    count++;
}

let number = 5;

do {
    console.log("number:" + number);
    number++;
} while (number <= 3);



const menu = [
    "Dal Rice",
    "Chicken Curry",
    "Fish Fry",
    "Vegetable Stir Fry"
];

for (const dish of menu) {
    console.log(dish);
}

const marks = {
    Maths: 92,
    English: 85,
    Science: 78,
    History: 88
};

for (const subject in marks) {
    console.log(
        `${subject}: ${marks[subject]}`
    );
}