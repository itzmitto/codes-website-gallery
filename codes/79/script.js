const questions = [
  {
    id: 1,
    title:
      "What does the <code class='inline-code'>width</code> property define in CSS?",
    choices: [
      "The total width including padding, border, and margin.",
      "The width of the content area, excluding padding, border, and margin.",
      "The minimum width of an element.",
      "The width of the entire viewport.",
    ],
    correct: 1,
  },
];

let currentQuestion = questions[0];
let selectedAnswer = null;

function init() {
  const q = currentQuestion;

  document.getElementById("question-text").innerHTML = q.title;

  const container = document.getElementById("choices-container");
  container.innerHTML = "";

  q.choices.forEach((choice, index) => {
    const choiceRow = document.createElement("div");
    choiceRow.className = "choice-row";
    choiceRow.dataset.index = index;

    const radioCircle = document.createElement("span");
    radioCircle.className = "radio-circle";

    const textLabel = document.createElement("span");
    textLabel.className = "choice-text";
    textLabel.textContent = choice;

    choiceRow.addEventListener("click", () => selectOption(index));

    choiceRow.appendChild(radioCircle);
    choiceRow.appendChild(textLabel);
    container.appendChild(choiceRow);
  });
}

function selectOption(index) {
  selectedAnswer = index;

  const rows = document.querySelectorAll(".choice-row");
  rows.forEach((row) => row.classList.remove("selected"));

  const activeRow = document.querySelector(
    `.choice-row[data-index='${index}']`,
  );
  if (activeRow) {
    activeRow.classList.add("selected");
  }

  const feedback = document.getElementById("feedback");
  feedback.textContent = "";
  feedback.className = "feedback";
}

function checkAnswer() {
  const feedback = document.getElementById("feedback");

  if (selectedAnswer === null) {
    feedback.textContent = "Selecteer eerst een antwoord.";
    feedback.className = "feedback wrong";
    return;
  }

  if (selectedAnswer === currentQuestion.correct) {
    feedback.textContent = "✓ Correct! Dat is het juiste antwoord.";
    feedback.className = "feedback correct";
  } else {
    feedback.textContent = "x Onjuist. Probeer het nog een keer!";
    feedback.className = "feedback wrong";
  }
}

init();
