document.addEventListener('DOMContentLoaded', () => {
    const boardSize = 10;
    const mineCount = 15;
    let board = [];
    let revealedCount = 0;
    const gameBoard = document.getElementById('gameBoard');
    const resetButton = document.getElementById('resetButton');

    resetButton.addEventListener('click', resetGame);

    function resetGame() {
        board = [];
        revealedCount = 0;
        gameBoard.innerHTML = '';
        initializeBoard();
        placeMines();
        calculateNumbers();
    }

    function initializeBoard() {
        for (let i = 0; i < boardSize; i++) {
            const row = [];
            for (let j = 0; j < boardSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('contextmenu', handleCellRightClick);
                gameBoard.appendChild(cell);
                row.push({ element: cell, mine: false, number: 0, revealed: false, flagged: false });
            }
            board.push(row);
        }
    }

    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < mineCount) {
            const row = Math.floor(Math.random() * boardSize);
            const col = Math.floor(Math.random() * boardSize);
            if (!board[row][col].mine) {
                board[row][col].mine = true;
                minesPlaced++;
            }
        }
    }

    function calculateNumbers() {
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j].mine) continue;
                let count = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        const newRow = i + x;
                        const newCol = j + y;
                        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && board[newRow][newCol].mine) {
                            count++;
                        }
                    }
                }
                board[i][j].number = count;
            }
        }
    }

    function handleCellClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        if (board[row][col].revealed || board[row][col].flagged) return;
        revealCell(row, col);
    }

    function handleCellRightClick(event) {
        event.preventDefault();
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        if (board[row][col].revealed) return;
        toggleFlag(row, col);
    }

    function revealCell(row, col) {
        if (board[row][col].revealed || board[row][col].flagged) return;
        board[row][col].revealed = true;
        revealedCount++;
        board[row][col].element.classList.add('revealed');
        if (board[row][col].mine) {
            board[row][col].element.classList.add('mine');
            revealAllMines();
            alert('Game Over!');
            resetGame();
        } else if (board[row][col].number === 0) {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    const newRow = row + x;
                    const newCol = col + y;
                    if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                        revealCell(newRow, newCol);
                    }
                }
            }
        } else {
            board[row][col].element.textContent = board[row][col].number;
        }
        if (revealedCount === (boardSize * boardSize) - mineCount) {
            alert('You Win!');
            resetGame();
        }
    }

    function toggleFlag(row, col) {
        if (board[row][col].revealed) return;
        board[row][col].flagged = !board[row][col].flagged;
        board[row][col].element.classList.toggle('flag');
    }

    function revealAllMines() {
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j].mine) {
                    board[i][j].element.classList.add('revealed', 'mine');
                }
            }
        }
    }

    resetGame();
});
