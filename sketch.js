let board;
const cols = 8,
  rows = 8;
const scl = 40;
let turn = 1;
let showMoves = true;
let ai;
let playerTwoAI = true;
let canvas;

function setup() {
  canvas = createCanvas(320, 320);
  canvas.parent("canvas");
  background(60, 94, 49);
  board = new Board(rows, cols);
  board.setNewGame();
  ai = new AI(1);
  board.show();

  if (showMoves) {
    board.showMoves(2);
  }
}

function resetSketch() {
  setup();

  let white_score = document.getElementById("white");
  let black_score = document.getElementById("black");

  white_score.textContent = 0;
  black_score.textContent = 0;
}

function mouseClicked() {
  let x = mouseX;
  let y = mouseY;

  if (x < 0 || x > rows * scl || y < 0 || y > cols * scl) return 0;
  if (board.place(floor(y / scl), floor(x / scl), (turn % 2) + 1)) {
    background(60, 94, 49);
    turn++;

    if (playerTwoAI) {
      background(60, 94, 49);
      board.show();
      if (ai.move()) turn++;
    }

    board.show();
    if ((board.validMoves((turn % 2) + 1).length = 0)) {
      turn++;
    }

    if (showMoves) board.showMoves((turn % 2) + 1);
    board.showLastMove();
  }

  let current_score = board.updateTiles();
  console.log(current_score);

  let white_score = document.getElementById("white");
  let black_score = document.getElementById("black");

  white_score.textContent = current_score[1];
  black_score.textContent = current_score[2];
}
