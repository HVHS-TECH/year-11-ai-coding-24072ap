const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.getElementById('playerScore');
const aiScoreEl = document.getElementById('aiScore');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartButton');

const width = canvas.width;
const height = canvas.height;
const paddleWidth = 14;
const paddleHeight = 105;
const ballRadius = 10;
const winningScore = 5;

let playerScore = 0;
let aiScore = 0;
let playerY = height / 2 - paddleHeight / 2;
let aiY = height / 2 - paddleHeight / 2;
let ballX = width / 2;
let ballY = height / 2;
let ballSpeedX = 0;
let ballSpeedY = 0;
let serving = true;
let gameOver = false;
let lastTime = null;

const keys = {
  up: false,
  down: false,
};

function resetBall(toPlayer = false) {
  ballX = width / 2;
  ballY = height / 2;
  const angle = (Math.random() * Math.PI * 0.4) - Math.PI * 0.2;
  const speed = 260;
  ballSpeedX = toPlayer ? -speed : speed;
  ballSpeedY = speed * Math.sin(angle);
  serving = false;
  messageEl.textContent = 'Game on!';
}

function restartGame() {
  playerScore = 0;
  aiScore = 0;
  playerY = height / 2 - paddleHeight / 2;
  aiY = height / 2 - paddleHeight / 2;
  ballX = width / 2;
  ballY = height / 2;
  ballSpeedX = 0;
  ballSpeedY = 0;
  serving = true;
  gameOver = false;
  updateScore();
  messageEl.textContent = 'Press Space to serve.';
}

function updateScore() {
  playerScoreEl.textContent = playerScore;
  aiScoreEl.textContent = aiScore;
}

function drawNet() {
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  const step = 24;
  for (let y = 0; y < height; y += step * 2) {
    ctx.fillRect(width / 2 - 2, y, 4, step);
  }
}

function draw() {
  ctx.fillStyle = '#03162c';
  ctx.fillRect(0, 0, width, height);

  drawNet();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(24, playerY, paddleWidth, paddleHeight);
  ctx.fillRect(width - 24 - paddleWidth, aiY, paddleWidth, paddleHeight);

  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#c4d9ff';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Basic Tennis', 24, 28);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateAI(dt) {
  const center = aiY + paddleHeight / 2;
  if (ballY < center - 18) {
    aiY -= 235 * dt;
  } else if (ballY > center + 18) {
    aiY += 235 * dt;
  }
  aiY = clamp(aiY, 0, height - paddleHeight);
}

function resetPoint(winner) {
  if (winner === 'player') {
    playerScore += 1;
  } else {
    aiScore += 1;
  }
  updateScore();

  if (playerScore >= winningScore || aiScore >= winningScore) {
    gameOver = true;
    messageEl.textContent = playerScore > aiScore ? 'You win! Press Restart.' : 'You lose! Press Restart.';
    ballSpeedX = 0;
    ballSpeedY = 0;
    return;
  }

  serving = true;
  ballX = width / 2;
  ballY = height / 2;
  ballSpeedX = 0;
  ballSpeedY = 0;
  messageEl.textContent = 'Press Space to serve.';
}

function update(dt) {
  if (gameOver || serving) return;

  if (keys.up) playerY -= 330 * dt;
  if (keys.down) playerY += 330 * dt;
  playerY = clamp(playerY, 0, height - paddleHeight);

  updateAI(dt);

  ballX += ballSpeedX * dt;
  ballY += ballSpeedY * dt;

  if (ballY - ballRadius <= 0 || ballY + ballRadius >= height) {
    ballSpeedY *= -1;
    ballY = clamp(ballY, ballRadius, height - ballRadius);
  }

  const leftPaddleHit = ballX - ballRadius <= 24 + paddleWidth && ballX - ballRadius >= 24 && ballY >= playerY && ballY <= playerY + paddleHeight;
  const rightPaddleHit = ballX + ballRadius >= width - 24 - paddleWidth && ballX + ballRadius <= width - 24 && ballY >= aiY && ballY <= aiY + paddleHeight;

  if (leftPaddleHit) {
    ballSpeedX = Math.abs(ballSpeedX) + 18;
    const delta = (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
    ballSpeedY = 280 * delta;
    ballX = 24 + paddleWidth + ballRadius;
  }

  if (rightPaddleHit) {
    ballSpeedX = -Math.abs(ballSpeedX) - 18;
    const delta = (ballY - (aiY + paddleHeight / 2)) / (paddleHeight / 2);
    ballSpeedY = 280 * delta;
    ballX = width - 24 - paddleWidth - ballRadius;
  }

  if (ballX < 0) resetPoint('ai');
  if (ballX > width) resetPoint('player');
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.03);
  lastTime = timestamp;

  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyW') keys.up = true;
  if (event.code === 'KeyS') keys.down = true;
  if (event.code === 'Space') {
    if (!gameOver && serving) resetBall(false);
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'KeyW') keys.up = false;
  if (event.code === 'KeyS') keys.down = false;
});

restartBtn.addEventListener('click', () => {
  restartGame();
});

restartGame();
requestAnimationFrame(gameLoop);
