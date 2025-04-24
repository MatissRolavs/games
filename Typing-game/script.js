const input = document.getElementById("text-input");
const promptContainer = document.getElementById("prompt-container");
const promptText = document.getElementById("prompt-text");
const startButton = document.getElementById("start-button");
let timerDisplay = document.getElementById("timerDisplay");
let activeDifficulty = 'Normal';


// Difficulty selection segment vvvv vvvv vvvv vvvv
const difficulties = document.querySelectorAll("input[name='difficulty']");

difficulties.forEach(difficulty => {
    difficulty.addEventListener('change', () => {
        localStorage.setItem('selectedDifficulty', difficulty.value);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const savedDifficulty = localStorage.getItem('selectedDifficulty');
    if (savedDifficulty) {
        const savedRadio = document.querySelector(`input[name="difficulty"][value="${savedDifficulty}"]`);
        if (savedRadio) savedRadio.checked = true;
    } else {
        document.getElementById('normal').checked = true;
    }
});


// Timer segment vvvv vvvv vvvv vvvv
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


// Game segment vvvv vvvv vvvv vvvv
startButton.addEventListener("click", () => {    
    const difficulty = localStorage.getItem('selectedDifficulty');
    activeDifficulty = difficulty;
    const quoteAmount = 
        difficulty === 'Easy' ? 1 :
        difficulty === 'Normal' ? 3 :
        difficulty === 'Hard' ? 8 :
        difficulty === 'Ultra' ? 12 :
        1;

    promptText.textContent = '';
    input.value = '';
    input.style.backgroundColor = 'white';
    let fullPrompt = '';
    const fetchPromises = [];
    for (let i=0; i<quoteAmount; i++) {
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
    const promptText = promptContainer.querySelector('p').textContent;
    
    if (!timerRunning && userInput.length > 0) {
        startTimer();
    }

    if (userInput === promptText.slice(0, userInput.length)) {
        input.style.backgroundColor = 'lightgreen';
    } else {
        input.style.backgroundColor = 'red';
    }

    if (userInput === promptText) {
        stopTimer();
        const elapsedTime = Date.now() - startTime;
        alert(`Time taken: ${Math.floor(elapsedTime / 1000)} seconds and ${elapsedTime % 1000} milliseconds.\nDifficulty: ${activeDifficulty}`);
    }
});

input.addEventListener('paste', (e) => {
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    if (pastedText.length > 1) {
        e.preventDefault();
    }
});

//Give a prompt when the page is loaded vvvv vvvv vvvv vvvv
startButton.click();