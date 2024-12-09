document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const timeDisplay = document.getElementById('time');
    const resetButton = document.getElementById('reset');
    const difficultySelect = document.getElementById('difficulty');
    let timer;
    let seconds = 0;
    let isGameWon = false;
    let gameStarted = false;
    let firstClick = true;

    const difficulties = {
        easy: { rows: 10, cols: 10, mines: 10 },
        intermediate: { rows: 12, cols: 12, mines: 20 },
        hard: { rows: 14, cols: 14, mines: 30 }
    };

    let currentDifficulty = difficulties[difficultySelect.value];
    let boardData = [];
    let revealedCells = 0;

    function startTimer() {
        if (!gameStarted) {
            gameStarted = true;
            timer = setInterval(() => {
                seconds++;
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }, 1000);
        }
    }

    function stopTimer() {
        clearInterval(timer);
        gameStarted = false;
    }

    function resetGame() {
        stopTimer();
        seconds = 0;
        timeDisplay.textContent = '00:00';
        grid.innerHTML = '';
        currentDifficulty = difficulties[difficultySelect.value];
        boardData = [];
        revealedCells = 0;
        isGameWon = false;
        gameStarted = false;
        firstClick = true;
        initializeBoard();
    }

    function initializeBoard() {
        grid.style.gridTemplateColumns = `repeat(${currentDifficulty.cols}, 32px)`;
        grid.style.gridTemplateRows = `repeat(${currentDifficulty.rows}, 32px)`;

        for (let i = 0; i < currentDifficulty.rows; i++) {
            boardData[i] = [];
            for (let j = 0; j < currentDifficulty.cols; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.addEventListener('click', () => revealCell(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    toggleFlag(i, j);
                });
                grid.appendChild(cell);
                boardData[i][j] = { mine: false, revealed: false, flagged: false, adjacentMines: 0 };
            }
        }

        placeMines();
        calculateAdjacentMines();
    }

    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < currentDifficulty.mines) {
            const row = Math.floor(Math.random() * currentDifficulty.rows);
            const col = Math.floor(Math.random() * currentDifficulty.cols);
            if (!boardData[row][col].mine) {
                boardData[row][col].mine = true;
                minesPlaced++;
            }
        }
    }

    function calculateAdjacentMines() {
        for (let i = 0; i < currentDifficulty.rows; i++) {
            for (let j = 0; j < currentDifficulty.cols; j++) {
                if (!boardData[i][j].mine) {
                    let count = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (i + di >= 0 && i + di < currentDifficulty.rows && j + dj >= 0 && j + dj < currentDifficulty.cols && boardData[i + di][j + dj].mine) {
                                count++;
                            }
                        }
                    }
                    boardData[i][j].adjacentMines = count;
                }
            }
        }
    }

    function revealCell(row, col) {
        if (boardData[row][col].revealed || boardData[row][col].flagged) return;

        if (firstClick) {
            firstClick = false;
            startTimer();
        }

        const cell = grid.children[row * currentDifficulty.cols + col];
        boardData[row][col].revealed = true;
        revealedCells++;

        if (boardData[row][col].mine) {
            cell.textContent = '💣';
            cell.classList.add('mine');
            revealAllMines();
            stopTimer();
            alert('Game Over! You hit a mine.');
            return;
        }

        cell.textContent = boardData[row][col].adjacentMines || '';
        cell.classList.add('revealed');
        cell.setAttribute('data-number', boardData[row][col].adjacentMines);

        if (boardData[row][col].adjacentMines === 0) {
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (row + di >= 0 && row + di < currentDifficulty.rows && col + dj >= 0 && col + dj < currentDifficulty.cols) {
                        revealCell(row + di, col + dj);
                    }
                }
            }
        }

        if (revealedCells === currentDifficulty.rows * currentDifficulty.cols - currentDifficulty.mines) {
            stopTimer();
            isGameWon = true;
            showConfetti();
            alert('Congratulations! You won!');
        }
    }

    function revealAllMines() {
        for (let i = 0; i < currentDifficulty.rows; i++) {
            for (let j = 0; j < currentDifficulty.cols; j++) {
                if (boardData[i][j].mine && !boardData[i][j].revealed) {
                    const cell = grid.children[i * currentDifficulty.cols + j];
                    cell.textContent = '💣';
                    cell.classList.add('mine');
                }
            }
        }
    }

    function toggleFlag(row, col) {
        if (boardData[row][col].revealed) return;

        const cell = grid.children[row * currentDifficulty.cols + col];
        boardData[row][col].flagged = !boardData[row][col].flagged;
        cell.textContent = boardData[row][col].flagged ? '🚩' : '';
        cell.classList.toggle('flagged');
    }

    function showConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    difficultySelect.addEventListener('change', resetGame);
    resetButton.addEventListener('click', resetGame);

    resetGame();
});
