const input = document.getElementById("text-input");
const promptContainer = document.getElementById("prompt-container");
const promptText = document.getElementById("prompt-text");
const startButton = document.getElementById("start-button");
let timerDisplay = document.getElementById("timerDisplay");
const usernameInput = document.getElementById("username");

let activeDifficulty = 'Normal';

const difficulties = document.querySelectorAll("input[name='difficulty']");
difficulties.forEach(difficulty => {
  difficulty.addEventListener('change', () => {
    localStorage.setItem('selectedDifficulty', difficulty.value);
    activeDifficulty = difficulty.value;
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const savedDifficulty = localStorage.getItem('selectedDifficulty');
  if (savedDifficulty) {
    const savedRadio = document.querySelector(`input[name="difficulty"][value="${savedDifficulty}"]`);
    if (savedRadio) savedRadio.checked = true;
    activeDifficulty = savedDifficulty;
  } else {
    document.getElementById('normal').checked = true;
    activeDifficulty = 'Normal';
  }
});


let startTime;
let timerInterval;
let timerRunning = false;

function startTimer() {
  startTime = Date.now();
  timerRunning = true;
  timerInterval = setInterval(updateTimer, 1);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
}

function updateTimer() {
  const elapsedTime = Date.now() - startTime;
  const minutes = Math.floor((elapsedTime / 1000 / 60) % 60);
  const seconds = Math.floor((elapsedTime / 1000) % 60);
  const milliseconds = elapsedTime % 1000;
  const formattedTime = `${padTime(minutes)}:${padTime(seconds)}:${padTime(Math.floor(milliseconds / 10))}`;
  timerDisplay.textContent = formattedTime;
}

function padTime(time) {
  return time < 10 ? `0${time}` : time;
}


startButton.addEventListener("click", () => {
  const difficulty = localStorage.getItem('selectedDifficulty');
  activeDifficulty = difficulty || 'Normal';
  const quoteAmount =
    difficulty === 'Easy' ? 1 :
    difficulty === 'Normal' ? 3 :
    difficulty === 'Hard' ? 8 :
    difficulty === 'Ultra' ? 12 : 1;

  promptText.textContent = '';
  input.value = '';
  input.style.backgroundColor = 'white';
  
  let fullPrompt = '';
  const fetchPromises = [];
  for (let i = 0; i < quoteAmount; i++) {
    fetchPromises.push(
      fetch('http://api.quotable.io/random')
        .then(response => response.json())
        .then(data => {
          fullPrompt += data.content + ' ';
        })
        .catch(error => console.error('Error:', error))
    );
  }
  Promise.all(fetchPromises).then(() => {
    promptText.textContent = fullPrompt.trim();
  });

  if (timerRunning) {
    stopTimer();
  }
});

input.addEventListener('input', () => {
  const userInput = input.value;
  const fullPromptText = promptContainer.querySelector('p').textContent;
  
  if (!timerRunning && userInput.length > 0) {
    startTimer();
  }

  if (userInput === fullPromptText.slice(0, userInput.length)) {
    input.style.backgroundColor = 'lightgreen';
  } else {
    input.style.backgroundColor = 'red';
  }

  if (userInput === fullPromptText) {
    stopTimer();
    const elapsedTime = Date.now() - startTime;
    alert(`Time taken: ${Math.floor(elapsedTime / 1000)} seconds and ${elapsedTime % 1000} milliseconds.\nDifficulty: ${activeDifficulty}`);
    saveScore(activeDifficulty, elapsedTime);
  }
});

input.addEventListener('paste', (e) => {
  const pastedText = (e.clipboardData || window.clipboardData).getData('text');
  if (pastedText.length > 1) {
    e.preventDefault();
  }
});

function saveScore(difficulty, time) {
  const username = usernameInput.value.trim() || "Anonymous";
  fetch('save_score.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `username=${encodeURIComponent(username)}&difficulty=${encodeURIComponent(difficulty)}&time=${encodeURIComponent(time)}`
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === "success") {
      console.log("Score saved successfully.");
    } else {
      console.error("Error saving score: ", data.message);
    }
  })
  .catch(error => console.error("Error in saveScore: ", error));
}

startButton.click();
