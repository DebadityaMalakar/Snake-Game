# 🐍 Snake Game (HTML, CSS, JS)

A modern Snake Game implemented in vanilla JavaScript with support for:
- Normal & Golden Apples
- Random Berries with despawn timer
- Grid wrapping
- Pause/Resume
- Highscore tracking (localStorage)

## 📦 Features

- Classic snake movement on a grid.
- Normal apples increase length by 1.
- Golden apples (10% chance) increase length by 3.
- Berries appear occasionally (45% chance) and despawn in 10 seconds.
  - Eating a berry reduces length by 2 and score by 2.
- Snake wraps around edges (no wall collision).
- Self-collision ends the game.
- Pause/Resume functionality via `Spacebar`.
- Highscore persistence using `localStorage`.

## 🎮 Controls

| Key          | Action                |
|--------------|-----------------------|
| Arrow Keys / W A S D | Move snake      |
| Spacebar     | Pause / Resume / Start game   |

## 🛠 Setup & Run

1. Clone or download the repository.
2. Open `index.html` in a web browser.
3. Use the input fields to set grid size (10 to 30).
4. Press `Start` to begin playing.

## 🧑‍💻 Files Structure
