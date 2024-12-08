class Minesweeper {
    constructor(size = 10, mines = 10) {
        this.size = size;
        this.mines = mines;
        this.grid = [];
        this.gameOver = false;
        this.timer = 0;
        this.timerInterval = null;
        this.init();
    }

    init() {
        this.createGrid();
        this.placeMines();
        this.calculateNumbers();
        this.render();
        this.startTimer();

        document.getElementById('reset').addEventListener('click', () => this.reset());
    }

    createGrid() {
        this.grid = Array(this.size).fill().map(() => 
            Array(this.size).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        );
    }

    placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const x = Math.floor(Math.random() * this.size);
            const y = Math.floor(Math.random() * this.size);
            if (!this.grid[y][x].isMine) {
                this.grid[y][x].isMine = true;
                minesPlaced++;
            }
        }
    }

    calculateNumbers() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.grid[y][x].isMine) {
                    this.grid[y][x].neighborMines = this.countNeighborMines(x, y);
                }
            }
        }
    }

    countNeighborMines(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const newY = y + dy;
                const newX = x + dx;
                if (newY >= 0 && newY < this.size && newX >= 0 && newX < this.size) {
                    if (this.grid[newY][newX].isMine) count++;
                }
            }
        }
        return count;
    }

    render() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                if (this.grid[y][x].isRevealed) {
                    cell.classList.add('revealed');
                    if (this.grid[y][x].isMine) {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (this.grid[y][x].neighborMines > 0) {
                        cell.textContent = this.grid[y][x].neighborMines;
                    }
                } else if (this.grid[y][x].isFlagged) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }

                cell.addEventListener('click', () => this.handleClick(x, y));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(x, y);
                });

                gridElement.appendChild(cell);
            }
        }
    }

    handleClick(x, y) {
        if (this.gameOver || this.grid[y][x].isFlagged) return;

        if (this.grid[y][x].isMine) {
            this.gameOver = true;
            this.revealAll();
            clearInterval(this.timerInterval);
            alert('Game Over!');
        } else {
            this.reveal(x, y);
            if (this.checkWin()) {
                this.gameOver = true;
                clearInterval(this.timerInterval);
                this.celebrateWin();
            }
        }
        this.render();
    }

    handleRightClick(x, y) {
        if (this.gameOver || this.grid[y][x].isRevealed) return;
        this.grid[y][x].isFlagged = !this.grid[y][x].isFlagged;
        this.render();
    }

    reveal(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
        if (this.grid[y][x].isRevealed || this.grid[y][x].isFlagged) return;

        this.grid[y][x].isRevealed = true;

        if (this.grid[y][x].neighborMines === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    this.reveal(x + dx, y + dy);
                }
            }
        }
    }

    revealAll() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.grid[y][x].isRevealed = true;
            }
        }
    }

    checkWin() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.grid[y][x].isMine && !this.grid[y][x].isRevealed) {
                    return false;
                }
            }
        }
        return true;
    }

    celebrateWin() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        alert('Congratulations! You won!');
    }

    startTimer() {
        this.timer = 0;
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('time').textContent = formattedTime;
        }, 1000);
    }

    reset() {
        this.gameOver = false;
        this.createGrid();
        this.placeMines();
        this.calculateNumbers();
        this.render();
        this.startTimer();
    }
}

// Start the game
new Minesweeper();
