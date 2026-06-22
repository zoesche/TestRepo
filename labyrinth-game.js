// Labyrinth-Generator mit Depth-First Search
const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 30;
let cols, rows;
let grid = [];
let player = { x: 0, y: 0 };
let exit = { x: 0, y: 0 };
let level = 1;
let timerInterval = null;
let seconds = 0;
let gameWon = false;

const timerEl = document.getElementById('timer');
const levelEl = document.getElementById('level');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('result-text');
const newMazeBtn = document.getElementById('new-maze-btn');

function initMaze() {
    // Größe basierend auf Level
    cols = Math.min(8 + level * 2, 20);
    rows = Math.min(8 + level * 2, 14);

    canvas.width = cols * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;

    // Grid initialisieren
    grid = [];
    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < cols; x++) {
            grid[y][x] = {
                x, y,
                walls: { top: true, right: true, bottom: true, left: true },
                visited: false
            };
        }
    }

    // Labyrinth generieren (DFS)
    generateMaze(0, 0);

    // Spieler und Ausgang setzen
    player = { x: 0, y: 0 };
    exit = { x: cols - 1, y: rows - 1 };
    gameWon = false;

    // Timer reset
    clearInterval(timerInterval);
    seconds = 0;
    timerEl.textContent = '00:00';
    timerInterval = setInterval(updateTimer, 1000);

    // UI reset
    resultDiv.style.display = 'none';

    draw();
}

function generateMaze(startX, startY) {
    const stack = [];
    const start = grid[startY][startX];
    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current);

        if (neighbors.length === 0) {
            stack.pop();
        } else {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWall(current, next);
            next.visited = true;
            stack.push(next);
        }
    }
}

function getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { x, y } = cell;

    if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]);
    if (x < cols - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]);
    if (y < rows - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]);
    if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]);

    return neighbors;
}

function removeWall(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (dx === 1) { a.walls.right = false; b.walls.left = false; }
    if (dx === -1) { a.walls.left = false; b.walls.right = false; }
    if (dy === 1) { a.walls.bottom = false; b.walls.top = false; }
    if (dy === -1) { a.walls.top = false; b.walls.bottom = false; }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Zellen und Wände zeichnen
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = grid[y][x];
            const px = x * CELL_SIZE;
            const py = y * CELL_SIZE;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;

            if (cell.walls.top) {
                ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + CELL_SIZE, py); ctx.stroke();
            }
            if (cell.walls.right) {
                ctx.beginPath(); ctx.moveTo(px + CELL_SIZE, py); ctx.lineTo(px + CELL_SIZE, py + CELL_SIZE); ctx.stroke();
            }
            if (cell.walls.bottom) {
                ctx.beginPath(); ctx.moveTo(px, py + CELL_SIZE); ctx.lineTo(px + CELL_SIZE, py + CELL_SIZE); ctx.stroke();
            }
            if (cell.walls.left) {
                ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + CELL_SIZE); ctx.stroke();
            }
        }
    }

    // Ausgang zeichnen
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(exit.x * CELL_SIZE + 5, exit.y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚪', exit.x * CELL_SIZE + CELL_SIZE / 2, exit.y * CELL_SIZE + CELL_SIZE / 2);

    // Spieler zeichnen
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.arc(
        player.x * CELL_SIZE + CELL_SIZE / 2,
        player.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3, 0, Math.PI * 2
    );
    ctx.fill();
}

function movePlayer(dx, dy) {
    if (gameWon) return;

    const cell = grid[player.y][player.x];

    // Wandkollision prüfen
    if (dx === 1 && cell.walls.right) return;
    if (dx === -1 && cell.walls.left) return;
    if (dy === 1 && cell.walls.bottom) return;
    if (dy === -1 && cell.walls.top) return;

    player.x += dx;
    player.y += dy;

    draw();

    // Gewonnen?
    if (player.x === exit.x && player.y === exit.y) {
        winGame();
    }
}

function winGame() {
    gameWon = true;
    clearInterval(timerInterval);

    resultDiv.style.display = 'block';
    resultText.textContent = `🎉 Geschafft! Level ${level} in ${timerEl.textContent} gelöst!`;

    // Konfetti
    launchConfetti();

    // Nächstes Level nach 2 Sekunden
    setTimeout(() => {
        level++;
        levelEl.textContent = level;
        initMaze();
    }, 3000);
}

function updateTimer() {
    seconds++;
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `${min}:${sec}`;
}

// Konfetti-Effekt
function launchConfetti() {
    const confettiCanvas = document.createElement('canvas');
    confettiCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(confettiCanvas);
    const cCtx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#e94560', '#4caf50', '#ff9800', '#2196f3', '#9c27b0', '#ffeb3b'];

    for (let i = 0; i < 100; i++) {
        pieces.push({
            x: Math.random() * confettiCanvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 4 + 2,
            size: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 8
        });
    }

    let frame = 0;
    function animate() {
        cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        pieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;

            cCtx.save();
            cCtx.translate(p.x, p.y);
            cCtx.rotate((p.rotation * Math.PI) / 180);
            cCtx.fillStyle = p.color;
            cCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            cCtx.restore();
        });

        frame++;
        if (frame < 150) {
            requestAnimationFrame(animate);
        } else {
            confettiCanvas.remove();
        }
    }
    animate();
}

// Tastatur-Steuerung
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': movePlayer(0, -1); break;
        case 'ArrowDown': case 's': case 'S': movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': movePlayer(1, 0); break;
    }
});

// Mobile Steuerung
document.querySelectorAll('.dir-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        switch (btn.dataset.dir) {
            case 'up': movePlayer(0, -1); break;
            case 'down': movePlayer(0, 1); break;
            case 'left': movePlayer(-1, 0); break;
            case 'right': movePlayer(1, 0); break;
        }
    });
});

// Neues Labyrinth
newMazeBtn.addEventListener('click', () => {
    level = 1;
    levelEl.textContent = '1';
    initMaze();
});

// Spiel starten
initMaze();
