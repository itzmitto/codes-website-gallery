const questions = [
  {
    id: 1,
    type: "dragdrop",
    title:
      "Drag and drop the correct property to set a green background color for a <code>&lt;div&gt;</code> element.",
    codePrefix: "div {",
    codeValue: ": green;",
    codeSuffix: "}",
    choices: ["bg-color", "color", "opacity", "background-color"],
    correct: "background-color",
  },
];

let currentQuestion = questions[0];
let droppedValue = null;
let draggedChip = null;
let draggingFromDropZone = false;

function init() {
  const q = currentQuestion;

  document.getElementById("question-text").innerHTML = q.title;

  const codeBlock = document.getElementById("code-block");
  codeBlock.innerHTML = `
        <div>${q.codePrefix}</div>
        <div class="code-line">
            <span
                class="drop-zone"
                id="drop-zone"
                ondragover="onDragOver(event)"
                ondragleave="onDragLeave(event)"
                ondrop="onDrop(event)"
            ></span>
            <span>${q.codeValue}</span>
        </div>
        <div>${q.codeSuffix}</div>
    `;

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";
  q.choices.forEach((choice) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = choice;
    chip.draggable = true;
    chip.dataset.value = choice;

    chip.addEventListener("dragstart", onDragStart);
    chip.addEventListener("dragend", onDragEnd);

    choicesEl.appendChild(chip);
  });

  const choicesEl2 = document.getElementById("choices");
  choicesEl2.addEventListener("dragover", onDragOverChoices);
  choicesEl2.addEventListener("dragleave", onDragLeaveChoices);
  choicesEl2.addEventListener("drop", onDropChoices);
}

function onDragStart(e) {
  draggedChip = e.target;
  draggingFromDropZone = false;
  e.dataTransfer.setData("text/plain", e.target.dataset.value);
  setTimeout(() => {
    e.target.style.opacity = "0.4";
  }, 0);
}

function onDragEnd(e) {
  e.target.style.opacity = "";
  draggedChip = null;
  draggingFromDropZone = false;
  document.getElementById("choices").classList.remove("drag-over");
}


function onDragOver(e) {
  e.preventDefault();
  const dropZone = document.getElementById("drop-zone");
  dropZone.classList.add("drag-over");
}

function onDragLeave(e) {
  const dropZone = document.getElementById("drop-zone");
  dropZone.classList.remove("drag-over");
}

function onDrop(e) {
  e.preventDefault();
  const value = e.dataTransfer.getData("text/plain");
  const dropZone = document.getElementById("drop-zone");

  if (droppedValue && droppedValue !== value) {
    restoreChip(droppedValue);
  }

  droppedValue = value;
  dropZone.textContent = value;
  dropZone.classList.remove("drag-over");
  dropZone.classList.add("filled");
  dropZone.draggable = true;
  dropZone.addEventListener("dragstart", onDropZoneDragStart);
  dropZone.addEventListener("dragend", onDropZoneDragEnd);

  if (draggedChip) {
    draggedChip.classList.add("used");
  } else {
    hideChip(value);
  }

  const feedback = document.getElementById("feedback");
  feedback.textContent = "";
  feedback.className = "feedback";
}


function onDropZoneDragStart(e) {
  draggingFromDropZone = true;
  e.dataTransfer.setData("text/plain", droppedValue);
  const dropZone = document.getElementById("drop-zone");
  setTimeout(() => {
    dropZone.style.opacity = "0.4";
  }, 0);
}

function onDropZoneDragEnd(e) {
  const dropZone = document.getElementById("drop-zone");
  dropZone.style.opacity = "";

}


function onDragOverChoices(e) {
  if (draggingFromDropZone || (draggedChip && draggedChip.classList.contains("used"))) {
    e.preventDefault();
    document.getElementById("choices").classList.add("drag-over");
  }
}

function onDragLeaveChoices(e) {
  const related = e.relatedTarget;
  if (!e.currentTarget.contains(related)) {
    document.getElementById("choices").classList.remove("drag-over");
  }
}

function onDropChoices(e) {
  e.preventDefault();
  const value = e.dataTransfer.getData("text/plain");
  document.getElementById("choices").classList.remove("drag-over");

  restoreChip(value);

  const dropZone = document.getElementById("drop-zone");
  dropZone.textContent = "";
  dropZone.classList.remove("filled");
  dropZone.draggable = false;
  dropZone.removeEventListener("dragstart", onDropZoneDragStart);
  dropZone.removeEventListener("dragend", onDropZoneDragEnd);

  droppedValue = null;
  draggingFromDropZone = false;

  const feedback = document.getElementById("feedback");
  feedback.textContent = "";
  feedback.className = "feedback";
}


function restoreChip(value) {
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => {
    if (chip.dataset.value === value) {
      chip.classList.remove("used");
    }
  });
}

function hideChip(value) {
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => {
    if (chip.dataset.value === value) {
      chip.classList.add("used");
    }
  });
}

function checkAnswer() {
  const feedback = document.getElementById("feedback");

  if (!droppedValue) {
    feedback.textContent = "Sleep eerst een antwoord naar de lege plek.";
    feedback.className = "feedback wrong";
    return;
  }

  if (droppedValue === currentQuestion.correct) {
    feedback.textContent =
      "✓ Correct! 'background-color' is de juiste eigenschap.";
    feedback.className = "feedback correct";
  } else {
    feedback.textContent = `x Onjuist. '${droppedValue}' is niet de juiste eigenschap. Probeer opnieuw!`;
    feedback.className = "feedback wrong";
  }
}

init();