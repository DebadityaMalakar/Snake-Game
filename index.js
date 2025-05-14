let snake = null;
let gameInterval = null;

/**
 * Class representing the Snake game.
 */
class Snake {
  /**
   * Initialize the game.
   * @param {string} target - CSS selector for the game container.
   * @param {number} gridX - Number of grid columns.
   * @param {number} gridY - Number of grid rows.
   */
  constructor(target, gridX, gridY) {
    this.grid_x = gridX;
    this.grid_y = gridY;
    this.snake_pos = { x: Math.floor(Math.random() * gridX) + 1, y: Math.floor(Math.random() * gridY) + 1 };
    this.snake_body = [{ ...this.snake_pos }];
    this.snake_height = 1;
    this.apple_pos = null;
    this.apple_type = "normal";
    this.berry_pos = null;
    this.direction = { x: 0, y: 0 };
    this.running = false;
    this.score = 0;
    this.highscore = parseInt(localStorage.getItem('snakeHighscore')) || 0;

    this.target = document.querySelector(target);
    this.messageEl = document.getElementById('game-message');
    this.scoreEl = document.getElementById('score');
    this.highscoreEl = document.getElementById('highscore');

    this.berryFadeTimer = null;
    this.berryDespawnRemaining = null;
    this.lastTime = null;

    this.createGrid();
    this.renderSnake();
    this.spawnApple();
    this.updateScore();
    this.clearMessage();
  }

  /**
   * Create the grid layout for the game.
   */
  createGrid() {
    this.target.innerHTML = '';
    for (let x = 1; x <= this.grid_x; x++) {
      const gridRow = document.createElement("div");
      gridRow.className = "outer";
      gridRow.style.gridTemplateColumns = `repeat(${this.grid_y}, 1fr)`;
      for (let y = 1; y <= this.grid_y; y++) {
        const gridCell = document.createElement("div");
        gridCell.className = "box";
        gridCell.id = `inner-${x}${y}`;
        gridRow.appendChild(gridCell);
      }
      this.target.appendChild(gridRow);
    }
  }

  /**
   * Clear any game message.
   */
  clearMessage() {
    this.messageEl.textContent = "";
  }

  /**
   * Update the score and highscore display.
   */
  updateScore() {
    this.scoreEl.textContent = `Score: ${this.score}`;
    this.highscoreEl.textContent = `Highscore: ${this.highscore}`;
  }

  /**
   * Render the snake on the grid.
   */
  renderSnake() {
    document.querySelectorAll(".snake-head, .snake-body").forEach(el => el.classList.remove("snake-head", "snake-body"));
    this.snake_body.forEach((pos, index) => {
      const cell = document.getElementById(`inner-${pos.x}${pos.y}`);
      if (cell) {
        cell.classList.add(index === 0 ? "snake-head" : "snake-body");
      }
    });
  }

  /**
   * Spawn an apple at a random position.
   */
  spawnApple() {
    let x, y;
    do {
      x = Math.floor(Math.random() * this.grid_x) + 1;
      y = Math.floor(Math.random() * this.grid_y) + 1;
    } while (this.snake_body.some(pos => pos.x === x && pos.y === y));

    this.apple_pos = { x, y };
    this.apple_type = Math.random() < 0.1 ? "golden" : "normal";

    document.querySelectorAll(".apple, .golden-apple").forEach(el => el.classList.remove("apple", "golden-apple"));
    document.getElementById(`inner-${x}${y}`)?.classList.add(this.apple_type === "golden" ? "golden-apple" : "apple");

    if (Math.random() < 0.45) {
      this.spawnBerry();
    } else {
      this.clearBerry();
    }
  }

  /**
   * Spawn a berry at a random position.
   */
  spawnBerry() {
    let x, y;
    do {
      x = Math.floor(Math.random() * this.grid_x) + 1;
      y = Math.floor(Math.random() * this.grid_y) + 1;
    } while (
      this.snake_body.some(pos => pos.x === x && pos.y === y) ||
      (this.apple_pos?.x === x && this.apple_pos?.y === y)
    );

    this.berry_pos = { x, y };
    document.getElementById(`inner-${x}${y}`)?.classList.add("berry");

    this.berryDespawnRemaining = 10000;
    this.lastTime = performance.now();
    this.startBerryFade();
  }

  /**
   * Clear the berry from the grid.
   */
  clearBerry() {
    document.querySelectorAll(".berry, .berry-fade").forEach(el => el.classList.remove("berry", "berry-fade"));
    this.berry_pos = null;
    this.berryDespawnRemaining = null;
    cancelAnimationFrame(this.berryFadeTimer);
  }

  /**
   * Handle berry fade animation and despawn timer.
   */
  startBerryFade() {
    const tick = (time) => {
      if (!this.berry_pos) return;

      if (!this.running) {
        this.lastTime = time;
        this.berryFadeTimer = requestAnimationFrame(tick);
        return;
      }

      const delta = time - this.lastTime;
      this.lastTime = time;
      this.berryDespawnRemaining -= delta;

      document.getElementById(`inner-${this.berry_pos.x}${this.berry_pos.y}`)?.classList.toggle("berry-fade");

      if (this.berryDespawnRemaining <= 0) {
        this.clearBerry();
      } else {
        this.berryFadeTimer = requestAnimationFrame(tick);
      }
    };

    this.berryFadeTimer = requestAnimationFrame(tick);
  }

  /**
   * Move the snake in its current direction and handle collisions.
   */
  moveSnake() {
    const newHead = {
      x: this.snake_body[0].x + this.direction.x,
      y: this.snake_body[0].y + this.direction.y
    };

    // Grid wrapping logic
    if (newHead.x < 1) newHead.x = this.grid_x;
    if (newHead.x > this.grid_x) newHead.x = 1;
    if (newHead.y < 1) newHead.y = this.grid_y;
    if (newHead.y > this.grid_y) newHead.y = 1;

    // Self-collision
    if (this.snake_body.some(pos => pos.x === newHead.x && pos.y === newHead.y)) {
      this.gameOver();
      return;
    }

    this.snake_body.unshift(newHead);

    if (newHead.x === this.apple_pos.x && newHead.y === this.apple_pos.y) {
      const gain = this.apple_type === "golden" ? 3 : 1;
      this.snake_height += gain;
      this.score += gain;
      if (this.score > this.highscore) {
        this.highscore = this.score;
        localStorage.setItem('snakeHighscore', this.highscore);
      }
      this.updateScore();
      this.spawnApple();
    } else if (this.berry_pos && newHead.x === this.berry_pos.x && newHead.y === this.berry_pos.y) {
      this.snake_height = Math.max(1, this.snake_height - 2);
      this.score = Math.max(0, this.score - 2);
      this.updateScore();
      this.clearBerry();
    }

    while (this.snake_body.length > this.snake_height) {
      this.snake_body.pop();
    }

    this.renderSnake();
  }

  /**
   * Handle game over logic.
   */
  gameOver() {
    clearInterval(gameInterval);
    this.running = false;
    this.messageEl.textContent = "Game Over! Press Start to Retry.";
    this.clearBerry();
  }

  /**
   * Toggle pause state of the game.
   */
  togglePause() {
    this.running = !this.running;
  }
}

// Initialize game on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const gridXInput = document.getElementById('grid-x');
  const gridYInput = document.getElementById('grid-y');
  const startBtn = document.getElementById('start-btn');

  startBtn.addEventListener('click', () => {
    const gridX = Math.min(30, Math.max(10, parseInt(gridXInput.value)));
    const gridY = Math.min(30, Math.max(10, parseInt(gridYInput.value)));

    if (gameInterval) clearInterval(gameInterval);

    snake = new Snake("#arena", gridX, gridY);

    gameInterval = setInterval(() => {
      if (snake.running && (snake.direction.x !== 0 || snake.direction.y !== 0)) {
        snake.moveSnake();
      }
    }, 200);
  });

  document.addEventListener('keydown', (event) => {
    if (!snake) return;

    if (event.code === 'Space') {
      snake.togglePause();
    }

    if (snake.running) {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          if (snake.direction.x !== 1) snake.direction = { x: -1, y: 0 };
          break;
        case 'ArrowDown':
        case 's':
          if (snake.direction.x !== -1) snake.direction = { x: 1, y: 0 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (snake.direction.y !== 1) snake.direction = { x: 0, y: -1 };
          break;
        case 'ArrowRight':
        case 'd':
          if (snake.direction.y !== -1) snake.direction = { x: 0, y: 1 };
          break;
      }
    }
  });
});
