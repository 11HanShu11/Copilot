const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game config
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const PADDLE_SPEED = 6;
const AI_SPEED = 4;
const BALL_SPEED = 6;

// Entities
let leftPaddle = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

let rightPaddle = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

let ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    size: BALL_SIZE,
    dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    dy: BALL_SPEED * (Math.random() * 2 - 1)
};

let scores = { left: 0, right: 0 };

// Mouse movement for left paddle
canvas.addEventListener('mousemove', function(evt) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;
    // Clamp inside canvas
    leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
});

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Middle line
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.setLineDash([]);

    // Scores
    ctx.font = "40px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(scores.left, canvas.width / 4, 50);
    ctx.fillText(scores.right, 3 * canvas.width / 4, 50);

    // Left paddle
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);

    // Right paddle
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Update game state
function update() {
    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top/bottom wall collision
    if (ball.y <= 0) {
        ball.y = 0;
        ball.dy = -ball.dy;
    } else if (ball.y + ball.size >= canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy = -ball.dy;
    }

    // Paddle collision (Left)
    if (
        ball.x <= leftPaddle.x + leftPaddle.width &&
        ball.y + ball.size > leftPaddle.y &&
        ball.y < leftPaddle.y + leftPaddle.height
    ) {
        ball.x = leftPaddle.x + leftPaddle.width;
        ball.dx = -ball.dx;
        // Change angle depending on where it hit the paddle
        let collidePoint = (ball.y + ball.size / 2) - (leftPaddle.y + leftPaddle.height / 2);
        collidePoint = collidePoint / (leftPaddle.height / 2);
        let angle = collidePoint * (Math.PI / 4);
        let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.cos(angle);
        ball.dy = speed * Math.sin(angle);
        if (ball.dx < 0) ball.dx = -ball.dx; // always move to right after collision
    }

    // Paddle collision (Right)
    if (
        ball.x + ball.size >= rightPaddle.x &&
        ball.y + ball.size > rightPaddle.y &&
        ball.y < rightPaddle.y + rightPaddle.height
    ) {
        ball.x = rightPaddle.x - ball.size;
        ball.dx = -ball.dx;
        // Change angle depending on where it hit the paddle
        let collidePoint = (ball.y + ball.size / 2) - (rightPaddle.y + rightPaddle.height / 2);
        collidePoint = collidePoint / (rightPaddle.height / 2);
        let angle = collidePoint * (Math.PI / 4);
        let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = -speed * Math.cos(angle);
        ball.dy = speed * Math.sin(angle);
        if (ball.dx > 0) ball.dx = -ball.dx; // always move to left after collision
    }

    // Left/Right wall (score update)
    if (ball.x < 0) {
        scores.right++;
        resetBall();
    }
    if (ball.x + ball.size > canvas.width) {
        scores.left++;
        resetBall();
    }

    // AI movement for right paddle
    let targetY = ball.y + ball.size / 2 - rightPaddle.height / 2;
    if (rightPaddle.y < targetY) {
        rightPaddle.y += AI_SPEED;
        if (rightPaddle.y > targetY) rightPaddle.y = targetY;
    } else if (rightPaddle.y > targetY) {
        rightPaddle.y -= AI_SPEED;
        if (rightPaddle.y < targetY) rightPaddle.y = targetY;
    }
    // Clamp right paddle inside canvas
    rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

function resetBall() {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    // Randomize direction
    let angle = Math.random() * Math.PI / 2 - Math.PI / 4; // -45deg to 45deg
    let direction = Math.random() > 0.5 ? 1 : -1;
    ball.dx = direction * BALL_SPEED * Math.cos(angle);
    ball.dy = BALL_SPEED * Math.sin(angle);
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
