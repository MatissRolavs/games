let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let birdImg = new Image();
birdImg.src = "assets/bird1.jpg";  // Default bird

let bird = { x: 50, y: 150, width: 40, height: 40, gravity: 1.5, lift: -10, velocity: 0 };
let pipes = [];
let score = 0;
let gameLoop;
let playerName = "";

document.getElementById("start-btn").addEventListener("click", startGame); // Set event listener for start button

function startGame() {
  const input = document.getElementById("player-name");
  playerName = input.value.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 20);
  if (!playerName) return alert("Enter valid name");

  birdImg.src = "assets/" + document.getElementById("bird-select").value; // Set selected bird
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";

  bird.y = 150;
  bird.velocity = 0;
  pipes = [];
  score = 0;

  pipes.push({ x: canvas.width, height: Math.random() * 250 + 100 });

  gameLoop = setInterval(updateGame, 20);
  window.addEventListener("keydown", () => bird.velocity = bird.lift); // Make bird jump
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before each frame

  bird.velocity += bird.gravity;  // Apply gravity
  bird.y += bird.velocity;  // Update bird's position

  // If bird goes out of bounds, end the game
  if (bird.y > canvas.height || bird.y < 0) {
    endGame();
  }

  // Draw the bird
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // Draw pipes and check for collision
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= 4;  // Move pipes leftward

    // Drawing top pipe (green rectangle)
    ctx.fillStyle = "#28a745";
    ctx.fillRect(p.x, 0, 50, p.height);  // Top pipe

    // Drawing bottom pipe (green rectangle)
    let gapHeight = 150;  // Gap between the pipes
    ctx.fillRect(p.x, p.height + gapHeight, 50, canvas.height - p.height - gapHeight);  // Bottom pipe

    // If pipes go out of screen, remove them and add new ones
    if (p.x + 50 < 0) {
      pipes.splice(i, 1);
      i--;
      score++; // Increase score when pipe is passed
    }

    // Check for collision with the bird
    if (
      bird.x < p.x + 50 &&
      bird.x + bird.width > p.x &&
      (bird.y < p.height || bird.y + bird.height > p.height + gapHeight)
    ) {
      endGame();  // End game on collision
    }
  }

  // Add new pipe when necessary
  if (pipes[pipes.length - 1].x < 300) {
    // Make sure pipes are not placed too low
    let newPipeHeight = Math.random() * 250 + 100; // Height range between 100px and 350px
    pipes.push({ x: canvas.width, height: newPipeHeight });
  }

  // Display score
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 10, 50);
}

function endGame() {
  clearInterval(gameLoop);  // Stop the game loop
  document.getElementById("game-container").style.display = "none";
  document.getElementById("game-over").style.display = "block";
  document.getElementById("final-score").innerText = `${playerName}, your score: ${score}`;
}

function restartGame() {
  document.getElementById("game-over").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
}
