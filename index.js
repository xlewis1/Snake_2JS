document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const snakeColorPicker = document.getElementById('snakeColor');
    const gameModeSelect = document.getElementById('gameMode');
    const speedSlider = document.getElementById('speedSlider');
    const gridToggle = document.getElementById('gridToggle');
    const touchBtns = document.querySelectorAll('.touch-btn');
    const pauseBtn = document.getElementById('pauseBtn');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const sidebarContent = document.getElementById('sidebarContent');
    const outlineToggle = document.getElementById("outlineToggle");
    const foodColorPicker = document.getElementById('foodColor');
    const foodShapeRadios = document.querySelectorAll('input[name="foodShape"]');
    const snakeTheme = new Audio('snaketheme.mp3');
    snakeTheme.loop = true;
    const muteBtn = document.getElementById('muteBtn');
    const themeSelect = document.getElementById('themeSelect');

    const themes = {
      default: { bg: '#111', snake: '#0f0', food: '#f00', grid: '#333' },
      neon: { bg: '#030003', snake: '#00ffdd', food: '#ff00aa', grid: '#005577' },
      rainbow: { bg: '#000', snake: null, food: null, grid: '#444' },
      nokia: { bg: '#000', snake: '#0a0', food: '#0a0', grid: null }
    };

    foodColorPicker.addEventListener('input', draw);
    foodShapeRadios.forEach(radio => radio.addEventListener('change', draw));
    
    const scale = 25;
    const rows = canvas.height / scale;
    const columns = canvas.width / scale;

    let snake = [];
    let snakeLength = 3;
    let direction = { x: 1, y: 0 };
    let food = { x: 0, y: 0 };
    let score = 0;
    let highScore = localStorage.getItem('HighScore') || 0;
    let isPaused = false;
    const defaultSnakeColor = '#0f0';
    let currentSpeed = parseInt(speedSlider.value, 10);
    let snakeHasOutline = outlineToggle.checked;
    let isMuted = false;
    let currentTheme = themes.default;
    let rainbowHue = 0;

    // --- Sidebar toggle ---
    toggleSidebarBtn.addEventListener('click', () => {
        sidebarContent.classList.toggle('show');
    });

    // --- Pause button ---
    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        snakeTheme.muted = isMuted;
        muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    });

    // --- Speed slider ---
    speedSlider.addEventListener('input', () => {
        currentSpeed = parseInt(speedSlider.value, 10);
    });

    outlineToggle.addEventListener("change", () => {
        snakeHasOutline = outlineToggle.checked;
    });

    window.addEventListener("gamepadconnected", (e) => {
    console.log("Gamepad connected:", e.gamepad.id);
  });

    themeSelect.addEventListener('change', () => {
  currentTheme = themes[themeSelect.value];
  draw(); // immediately redraw with new theme
});

    // --- Game init ---
    function init() {
        snake = [];
        for (let i = snakeLength - 1; i >= 0; i--) {
            snake.push({ x: i, y: 0 });
        }
        spawnFood();
        score = 0;
        direction = { x: 1, y: 0 };

        snakeTheme.play().catch(() => {
          console.log("Audio play prevented, maybe user interaction is needed first");
        });

        draw();
        window.requestAnimationFrame(gameLoop);
    }

    function spawnFood() {
        food.x = Math.floor(Math.random() * columns);
        food.y = Math.floor(Math.random() * rows);
    }

    function update() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        const mode = gameModeSelect.value;

        if (mode === 'wrap') {
            if (head.x < 0) head.x = columns - 1;
            if (head.x >= columns) head.x = 0;
            if (head.y < 0) head.y = rows - 1;
            if (head.y >= rows) head.y = 0;
        } else {
            if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
                init();
                return;
            }
        }

        if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            init();
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            spawnFood();
            
        if (score > highScore) {
            highScore = score; // update variable
            localStorage.setItem('HighScore', highScore); // save
        }
            
        } else {
            snake.pop();
        }
    }

    window.addEventListener("gamepadconnected", (e) => {
  console.log("Gamepad connected:", e.gamepad.id);
});

// In your game loop (or a separate polling function)
function pollGamePads() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const gp of gamepads) {
    if (!gp) continue;

    // Example: assuming standard layout
    // D‑pad buttons are indices 12 (up), 13 (down), 14 (left), 15 (right)
    if (gp.buttons[12].pressed) { direction = { x: 0, y: -1 }; }
    if (gp.buttons[13].pressed) { direction = { x: 0, y: 1 }; }
    if (gp.buttons[14].pressed) { direction = { x: -1, y: 0 }; }
    if (gp.buttons[15].pressed) { direction = { x: 1, y: 0 }; }

    // Example: maybe 'A' button (index 0) = pause
    if (gp.buttons[0].pressed) {
      pauseGame();
    }
  }
}

    function pauseGame() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';

    if (isPaused) {
        snakeTheme.pause();
    } else {
        snakeTheme.play();
    } 
}

    function draw() {
       ctx.fillStyle = currentTheme.bg;  // background
       ctx.fillRect(0, 0, canvas.width, canvas.height);
      const foodX = food.x * scale;
      const foodY = food.y * scale;
      const selectedShape = document.querySelector('input[name="foodShape"]:checked').value;

        // grid
        if (gridToggle.checked) {
            ctx.strokeStyle = '#333';
            for (let i = 0; i <= columns; i++) {
                ctx.beginPath();
                ctx.moveTo(i * scale, 0);
                ctx.lineTo(i * scale, canvas.height);
                ctx.stroke();
            }
            for (let j = 0; j <= rows; j++) {
                ctx.beginPath();
                ctx.moveTo(0, j * scale);
                ctx.lineTo(canvas.width, j * scale);
                ctx.stroke();
            }
        }

    let snakeColor = currentTheme.snake || snakeColorPicker.value;
    if(themeSelect.value === 'rainbow') {
        snakeColor = `hsl(${rainbowHue}, 100%, 50%)`;
    }    

    ctx.fillStyle = snakeColor;
    snake.forEach(seg => {
        const x = seg.x * scale;
        const y = seg.y * scale;
        ctx.fillRect(x, y, scale, scale);
        if (outlineToggle.checked) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 0.5, y + 0.5, scale - 1, scale - 1);
        }
    });

        let foodColor = currentTheme.food || foodColorPicker.value;
        if(themeSelect.value === 'rainbow') {
            foodColor = `hsl(${(rainbowHue + 120) % 360}, 100%, 50%)`;
         }
         ctx.fillStyle = foodColor;
         if(selectedShape === 'square') ctx.fillRect(foodX, foodY, scale, scale);
         else ctx.beginPath(), ctx.arc(foodX + scale/2, foodY + scale/2, scale/2, 0, Math.PI*2), ctx.fill();

         if(themeSelect.value === 'rainbow') rainbowHue = (rainbowHue + 5) % 360;
     }

        // score
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 25);
    

       ctx.fillStyle = 'yellow';
       ctx.textAlign = 'right';
       ctx.fillText(`High Score: ${highScore}`, canvas.width -10, 25);
       ctx.textAlign = 'start';
    } 

    let lastTime = 0;
    function gameLoop(time) {
        if (!isPaused && time - lastTime >= 1000 / currentSpeed) {
            lastTime = time;
            pollGamePads();
            update();
            draw();
        }
        window.requestAnimationFrame(gameLoop);
    }

    window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'Up': // some remotes use 'Up'
        case '38': // numeric keyCode fallback
            if (direction.y === 0) direction = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'Down':
        case '40':
            if (direction.y === 0) direction = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'Left':
        case '37':
            if (direction.x === 0) direction = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'Right':
        case '39':
            if (direction.x === 0) direction = { x: 1, y: 0 };
            e.preventDefault();
            break;
        case 'Enter':
        case '13': // pause/resume or selection
            pauseBtn.click();
            e.preventDefault();
            break;
    }
});

    // --- Touch ---
    touchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.dataset.dir;
            switch (dir) {
                case 'up': if (direction.y === 0) direction = { x: 0, y: -1 }; break;
                case 'down': if (direction.y === 0) direction = { x: 0, y: 1 }; break;
                case 'left': if (direction.x === 0) direction = { x: -1, y: 0 }; break;
                case 'right': if (direction.x === 0) direction = { x: 1, y: 0 }; break;
            }
        });
    });

    init();
});
