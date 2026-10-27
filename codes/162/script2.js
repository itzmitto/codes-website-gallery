// Arrays
let fruits = ["Apple", "Banana", "Mango",];
console.log(fruits);

console.log(fruits[0]);
console.log(fruits.length);
fruits.push("Grapes");
console.log(fruits);
fruits.pop();
console.log(fruits);
fruits[1] = "Orange";
console.log(fruits);


for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}

//Object
let user = {
    name: "André",
    age: 22,
    city: "Harderwijk"
};
console.log(user);

console.log(user.name);
console.log(user["age"]);

user.city = "Zwolle";
console.log(user.city);

for(let key in user) {
    console.log(key + ": " + user[key]);
}


//Array of Objects
let students = [
    {name: "Andre", age: 22},
    {name: "Adam", age: 25},
    {name: "Alexander", age: 20}
]
console.log(students);
console.log(students[1]);
console.log(students[2].name);

for (let i = 0; i < students.length; i++) {
    console.log(students[i].name);
}