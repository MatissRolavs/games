let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Load assets
let birdImg = new Image();
birdImg.src = "assets/bird1.jpg";

let flySound = new Audio("assets/fly.mp3");
let pointSound = new Audio("assets/point.mp3");
let deathSound = new Audio("assets/dy.mp3");

// Bird object
let bird = {
  x: 50,
  y: 150,
  width: 40,
  height: 40,
  gravity: 0.7,
  lift: -10,
  velocity: 0,
};

let pipes = [];
let score = 0;
let gameLoop;
let playerName = "";

// Start game button
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  const input = document.getElementById("player-name");
  playerName = input.value.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 20);
  if (!playerName) return alert("Enter valid name");

  birdImg.src = "assets/" + document.getElementById("bird-select").value;

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";

  bird.y = 150;
  bird.velocity = 0;
  pipes = [];
  score = 0;

  pipes.push({ x: canvas.width, height: Math.random() * 200 + 80 });

  gameLoop = setInterval(updateGame, 20);
  window.addEventListener("keydown", () => {
    bird.velocity = bird.lift;
    flySound.currentTime = 0;
    flySound.play();
  });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y > canvas.height || bird.y < 0) {
    endGame();
  }

  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= 4;

    const gapHeight = 150;
    ctx.fillStyle = "#28a745";
    ctx.fillRect(p.x, 0, 50, p.height); // Top pipe
    ctx.fillRect(p.x, p.height + gapHeight, 50, canvas.height - p.height - gapHeight); // Bottom pipe

    if (p.x + 50 < 0) {
      pipes.splice(i, 1);
      i--;
      score++;
      pointSound.currentTime = 0;
      pointSound.play();
    }

    // Collision
    if (
      bird.x < p.x + 50 &&
      bird.x + bird.width > p.x &&
      (bird.y < p.height || bird.y + bird.height > p.height + gapHeight)
    ) {
      endGame();
    }
  }

  // Add new pipe
  if (pipes[pipes.length - 1].x < 300) {
    let newPipeHeight = Math.random() * 200 + 80; // avoids low openings
    pipes.push({ x: canvas.width, height: newPipeHeight });
  }

  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 10, 50);
}

function endGame() {
  clearInterval(gameLoop);
  deathSound.currentTime = 0;
  deathSound.play();

  document.getElementById("game-container").style.display = "none";
  document.getElementById("game-over").style.display = "block";
  document.getElementById("final-score").innerText = `${playerName}, your score: ${score}`;
  document.getElementById("save-btn").style.display = "inline-block";
}

function restartGame() {
  document.getElementById("game-over").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
}

function saveScore() {
  if (!playerName || score === 0) {
    alert("You need to play first to save a score!");
    return;
  }

  fetch("save_score.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName, score: score }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Score saved successfully!");
        document.getElementById("save-btn").style.display = "none";
      } else {
        throw new Error(data.error || "Failed to save score");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error saving score: " + error.message);
    });
}
