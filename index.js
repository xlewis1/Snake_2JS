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

    const scale = 25;
    const rows = canvas.height / scale;
    const columns = canvas.width / scale;

    let snake = [];
    let snakeLength = 3;
    let direction = { x: 1, y: 0 };
    let food = { x: 0, y: 0 };
    let score = 0;
    let isPaused = false;
    const defaultSnakeColor = '#0f0';
    let currentSpeed = parseInt(speedSlider.value, 10);

    // --- Sidebar toggle ---
    toggleSidebarBtn.addEventListener('click', () => {
        sidebarContent.classList.toggle('show');
    });

    // --- Pause button ---
    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });

    // --- Speed slider ---
    speedSlider.addEventListener('input', () => {
        currentSpeed = parseInt(speedSlider.value, 10);
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
        } else {
            snake.pop();
        }
    }

    function draw() {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        // snake
        ctx.fillStyle = snakeColorPicker.value || defaultSnakeColor;
        snake.forEach(seg => ctx.fillRect(seg.x * scale, seg.y * scale, scale, scale));

        // food
        ctx.fillStyle = '#f00';
        ctx.fillRect(food.x * scale, food.y * scale, scale, scale);

        // score
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 25);
    }

    let lastTime = 0;
    function gameLoop(time) {
        if (!isPaused && time - lastTime >= 1000 / currentSpeed) {
            lastTime = time;
            update();
            draw();
        }
        window.requestAnimationFrame(gameLoop);
    }

    // --- Keyboard ---
    window.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w': if (direction.y === 0) direction = { x: 0, y: -1 }; break;
            case 'ArrowDown':
            case 's': if (direction.y === 0) direction = { x: 0, y: 1 }; break;
            case 'ArrowLeft':
            case 'a': if (direction.x === 0) direction = { x: -1, y: 0 }; break;
            case 'ArrowRight':
            case 'd': if (direction.x === 0) direction = { x: 1, y: 0 }; break;
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