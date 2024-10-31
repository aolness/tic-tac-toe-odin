const gb = (function createGameboard() {
    let board = [];
    let size = 3;

    function buildBoard() {
        if (board != []) board = [];
        for (let i = 0; i < size; i++) {
            if (!board[i]) {
                board[i] = [];
            }
            for (let j = 0; j < size; j++) {
                board[i].push("");
            }
        }
        logBoard();
    }

    function changeSize(num = 3) {
        size = num;
    }

    function getSize() {
        return size;
    }

    function makeMove(x, y, player) {
        if (checkSpaceEmpty(x, y)) {
            board[x][y] = player;
            return true;
        }
        else {
            console.log("That spot isnt open,try again");
            return false;
        }
    }

    function checkSpaceEmpty(x, y) {
        if (board[x][y] === "") return true;
        else return false;
    }

    function getSpace(x, y) {
        return board[x][y];
    }

    function getRow(row) {
        return board[row];
    }

    function getDiag() {
        const result = [];
        for (let i = 0; i < size; i++) {
            result.push(board[i][i]);
        }
        return result;
    }

    function getAntiDiag() {
        const result = [];
        for (let i = 0; i < size; i++) {
            result.push(board[i][size - (1 + i)]);
        }
        return result;
    }

    function getColumn(column) {
        const col = [];
        for (let row = 0; row < size; row++) {
            col.push(board[row][column]);
        }
        return col;
    }

    function logBoard() {
        for (let i = 0; i < size; i++) {
            console.log(board[i]);
        }
        return board;
    }

    return { getSize, buildBoard, makeMove, logBoard, changeSize, getSpace, getColumn, getRow, getDiag, getAntiDiag };
})();

function createPlayer(marker) {
    const name = `Player-${marker}`;

    function displayPlayer() {
        console.log(name);
    }

    return { name, marker, displayPlayer };
}

const game = function playGame(board = gb) {
    // DOM
    const boardContainer = document.querySelector(".board-container");
    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');
    const resetBtn = document.querySelector('.reset');
    const increaseSize = document.querySelector('.increase-size');
    const decreaseSize = document.querySelector('.decrease-size');


    resetBtn.addEventListener('click', reset);
    increaseSize.addEventListener('click', changeSize);
    decreaseSize.addEventListener('click', changeSize);


    const players = [createPlayer('X'), createPlayer('O')]
    const game = {
        turn: players[Math.round(Math.random())],
        continue: true,
        count: 0,
        winner: null
    }

    setup();

    function reset() {
        board.changeSize(3);
        setup();
        footer.innerHTML = "";
    }

    function displayBoard() {
        size = board.getSize();
        boardContainer.innerHTML = "";
        boardContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        boardContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                let btn = document.createElement('button');
                btn.setAttribute('class', `board-spot`);
                btn.setAttribute('data-row', row);
                btn.setAttribute('data-col', col);
                const text = board.getSpace(row, col);
                btn.value = text;
                btn.textContent = text;
                btn.addEventListener('click', takeTurn);
                boardContainer.append(btn);
            }
        }
        styleBorders(size);
    }

    function styleBorders(size) {
        const cells = document.querySelectorAll('.board-spot');
        cells.forEach((cell, index) => {
            // Remove top border for the first row
            if (index < size) cell.style.borderTop = 'none';
            // Remove bottom border for the last row
            if (index >= size * (size - 1)) cell.style.borderBottom = 'none';
            // Remove left border for the first column
            if (index % size === 0) cell.style.borderLeft = 'none';
            // Remove right border for the last column
            if ((index + 1) % size === 0) cell.style.borderRight = 'none';
        });
    }

    function setup() {
        board.buildBoard();
        displayBoard();
        for (let player in players) players[player].displayPlayer();
        game.continue = true;
        game.count = 0;
        game.winner = null;
    }

    function takeTurn(event) {
        if (event.target.textContent === "") {
            const marker = game.turn.marker;
            event.target.textContent = marker;
            event.target.value = marker;
            console.log(marker);
            game.count++;
            let row = event.target.dataset.row;
            let col = event.target.dataset.col;
            board.makeMove(row, col, marker);
            board.logBoard();
            checkWin();
            game.turn === players[0] ? game.turn = players[1] : game.turn = players[0];
        }
    }

    function checkWin() {
        if (game.count >= (board.getSize() * 2) - 1) {
            console.log("Checking for a win");
            if (checkColumn() || checkRow() || checkDiag() || checkAntiDiag()) {
                game.continue = false;
                game.winner = game.turn;
                console.log(`Congratulations ${game.winner.name}`);
                gameOver();
            }
        }
        else if (game.count === 9 && game.winner === null) {
            game.continue = false;
            console.log("Its a tie!");
        }
    }

    function checkColumn() {
        let win = false;
        let i = 0;
        const size = board.getSize();
        while (!win && i < size) {
            let col = board.getColumn(i);
            win = checkArray(col);
            i++;
        }
        return win;
    }

    function checkRow() {
        let win = false;
        let i = 0;
        const size = board.getSize();
        while (!win && i < size) {
            let row = board.getRow(i);
            win = checkArray(row);
            i++;
        }
        return win;
    }

    function checkDiag() {
        const diag = board.getDiag();
        return checkArray(diag);
    }

    function checkAntiDiag() {
        const anti = board.getAntiDiag();
        return checkArray(anti);
    }

    function checkArray(arr) {
        if (arr[0] != '' && arr.every(cell => cell === arr[0])) {
            return true;
        }
        return false;
    }

    function changeSize(event) {
        const size = board.getSize();
        const change = parseInt(event.target.value);
        if (size + change >= 3 && size + change <= 15) {
            board.changeSize(size + change);
            setup();
        }
    }

    function gameOver() {
        const boardSpots = document.querySelectorAll(".board-spot");
        for (let spot in boardSpots) {
            boardSpots[spot].disabled = true;
        }
        const head = document.createElement('h1');
        const again = document.createElement('p');
        again.textContent = "Press reset to play again"
        if (game.winner) {
            head.textContent = `Congratulations ${game.winner.name}!!!`

        }
        else {
            head.textContent = "It's a tie..."
        }
        footer.append(head);
        footer.append(again);
    }

    return {
        game,
        players,
    };
}();

// Javascript for DOM

// game.start();

