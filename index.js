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
    const muteBtn = document.getElementById('muteBtn');
    const themeSelect = document.getElementById('themeSelect');

    const snakeTheme = new Audio('snaketheme.mp3');
    snakeTheme.loop = true;

    const scale = 25;
    const rows = Math.floor(canvas.height / scale);
    const columns = Math.floor(canvas.width / scale);

    const themes = {
        default: { bg: '#111', snake: '#0f0', food: '#f00', grid: '#333' },
        neon: { bg: '#030003', snake: '#00ffdd', food: '#ff00aa', grid: '#005577' },
        rainbow: { bg: '#fff', snake: null, food: null, grid: '#444' },
        nokia: {bg: '#C0FFC0', snake: '#000000', food: '#000000', grid: null}   
    };

    let snake = [];
    let snakeLength = 3;
    let direction = { x: 1, y: 0 };
    let food = { x: 0, y: 0 };
    let score = 0;
    let highScore = parseInt(localStorage.getItem('HighScore')) || 0;
    let isPaused = false;
    let currentSpeed = parseInt(speedSlider.value, 10);
    let snakeHasOutline = outlineToggle.checked;
    let isMuted = false;
    let currentTheme = themes.default;
    let rainbowHue = 0;
    let lastUpdateTime = 0;

    // --- Event Listeners ---
    toggleSidebarBtn.addEventListener('click', () => {
        sidebarContent.classList.toggle('show');
    });

    pauseBtn.addEventListener('click', () => pauseGame());
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        snakeTheme.muted = isMuted;
        muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    });

    speedSlider.addEventListener('input', () => {
        currentSpeed = parseInt(speedSlider.value, 10);
    });

    outlineToggle.addEventListener("change", () => {
        snakeHasOutline = outlineToggle.checked;
    });

    themeSelect.addEventListener('change', () => {
        currentTheme = themes[themeSelect.value];
        draw();
    });

    foodColorPicker.addEventListener('input', draw);
    foodShapeRadios.forEach(radio => radio.addEventListener('change', draw));

    window.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp': 
            case 'w':
                if (direction.y === 0) direction = { x: 0, y: -1 }; 
                e.preventDefault();
                break;
            case 'ArrowDown': 
            case 's': 
                if (direction.y === 0) direction = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'ArrowLeft': 
            case 'a':
                if (direction.x === 0) direction = { x: -1, y: 0 }; 
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd': 
                if (direction.x === 0) direction = { x: 1, y: 0 }; 
                e.preventDefault();
                break;
            case 'Enter': 
                pauseGame(); 
                e.preventDefault();
                break;
        }
    });

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

    // --- Game Functions ---
    function init() {
        snake = [];
        for (let i = snakeLength - 1; i >= 0; i--) snake.push({ x: i, y: 0 });
        direction = { x: 1, y: 0 };
        score = 0;
        spawnFood();

        snakeTheme.play().catch(() => console.log("Audio play prevented."));

        lastUpdateTime = performance.now();
        window.requestAnimationFrame(gameLoop);
    }

    function spawnFood() {
        let valid = false;
        while (!valid) {
            food.x = Math.floor(Math.random() * columns);
            food.y = Math.floor(Math.random() * rows);
            valid = !snake.some(seg => seg.x === food.x && seg.y === food.y);
        }
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
                highScore = score;
                localStorage.setItem('HighScore', highScore);
            }
        } else snake.pop();
    }

    function draw() {
        // Background
        ctx.fillStyle = currentTheme.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        if (gridToggle.checked && currentTheme.grid) {
            ctx.strokeStyle = currentTheme.grid;
            ctx.lineWidth = 0.5;
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

        // Snake
        let snakeColor = currentTheme.snake || snakeColorPicker.value;
        if (themeSelect.value === 'rainbow') snakeColor = `hsl(${rainbowHue}, 100%, 50%)`;
        ctx.fillStyle = snakeColor;
        snake.forEach(seg => {
            const x = seg.x * scale;
            const y = seg.y * scale;
            ctx.fillRect(x, y, scale, scale);
            if (snakeHasOutline) {
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 0.5, y + 0.5, scale - 1, scale - 1);
            }
        });

        // Food
        let foodColor = '#f00';
        if (themeSelect.value === 'rainbow') {
            foodColor = `hsl(${(rainbowHue + 120) % 360}, 100%, 50%)`;
            rainbowHue = (rainbowHue + 5) % 360;
        }
        ctx.fillStyle = currentTheme.food || foodColorPicker.value || foodColor;
        const foodX = food.x * scale;
        const foodY = food.y * scale;
        const selectedShape = document.querySelector('input[name="foodShape"]:checked')?.value || 'square';
        if (selectedShape === 'square') ctx.fillRect(foodX, foodY, scale, scale);
        else {
            ctx.beginPath();
            ctx.arc(foodX + scale/2, foodY + scale/2, scale/2, 0, Math.PI*2);
            ctx.fill();
        }

        // Scores
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 25);
        ctx.fillStyle = 'yellow';
        ctx.textAlign = 'right';
        ctx.fillText(`High Score: ${highScore}`, canvas.width - 10, 25);
        ctx.textAlign = 'start';
    }

    function gameLoop(time) {
        if (!isPaused && time - lastUpdateTime >= 1000 / currentSpeed) {
            lastUpdateTime = time;
            update();
            draw();
        }
        window.requestAnimationFrame(gameLoop);
    }

    function pauseGame() {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
        if (isPaused) snakeTheme.pause();
        else snakeTheme.play();
    }

    init();
});
