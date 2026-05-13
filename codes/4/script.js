const slider = document.getElementById("slider");
const lengthVal = document.getElementById("lengthVal");
const output = document.getElementById("output");
slider.oninput = () => {
  lengthVal.textContent = slider.value;
};
function generatePassword() {
  let chars = "";
  if (upper.checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower.checked) chars += "abcdefghijklmnopqrstuvwxyz";
  if (numbers.checked) chars += "0123456789";
  if (symbols.checked) chars += "!@#$%^&*";
  if (!chars) {
    output.textContent = "Selecteer iets!";
    return;
  }
  let password = "";
  for (let i = 0; i < slider.value; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  output.textContent = password;
}