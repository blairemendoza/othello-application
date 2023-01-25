class Board {
  constructor(r, c) {
    this.tilesLeft = r * c - 4;
    this.tileSum = { 1: 2, 2: 2 };
    this.row = r;
    this.col = c;
    this.tiles = [];
    this.openMoves = { 1: [], 2: [] };
    this.lastx = 0;
    this.lasty = 0;
    for (let i = 0; i < this.row * this.col; i++) {
      this.openMoves[1].push(0);
      this.openMoves[2].push(0);
    }
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        this.tiles.push(new Tile(i, j));
      }
    }
  }

  updateTiles() {
    let white_sum, black_sum;
    let newSum = { 1: 0, 2: 0 };
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        if (this.tiles[i * this.col + j].value == 1) {
          white_sum = this.tiles.filter((i) => i.value == 1).length;
          newSum[1] = white_sum;
        } else if (this.tiles[i * this.col + j].value == 2) {
          black_sum = this.tiles.filter((i) => i.value == 2).length;
          newSum[2] = black_sum;
        }
      }
    }
    return newSum;
  }

  setNewGame() {
    this.tiles[(this.col / 2 - 1) * this.col + (this.row / 2 - 1)].place(1);
    this.tiles[(this.col / 2 - 1) * this.col + this.row / 2].place(2);
    this.tiles[(this.col / 2) * this.col + this.row / 2].place(1);
    this.tiles[(this.col / 2) * this.col + (this.row / 2 - 1)].place(2);
    this.update();
  }

  show() {
    // SHOWS THE BOARD
    push();
    stroke(255, 255, 255, 50);
    //strokeWeight(1);
    for (let i = 0; i <= this.row; i++) {
      line(0, i * scl, scl * this.col, i * scl);
    }
    for (let i = 0; i <= this.col; i++) {
      line(i * scl, 0, i * scl, scl * this.row);
    }
    // SHOW THE TILE INDICATOR
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        this.tiles[i * this.col + j].show();
      }
    }
    pop();
  }

  showLastMove() {
    push();
    noStroke();
    fill(224, 221, 171);
    ellipse(
      this.lastx * scl + scl / 2,
      this.lasty * scl + scl / 2,
      scl * 0.4,
      scl * 0.4
    );
    pop();
  }

  place(_i, _j, _val) {
    let dir = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
    ];
    // CHECKS IF PLACED BOARD IS ALREADY FILLED
    if (this.tiles[_i * this.col + _j].value > 0) return false;
    if (this.openMoves[_val][_i * this.col + _j] == 0) return false;
    this.lastx = _j;
    this.lasty = _i;
    // ITERATES AND CHECKS THROUGH THE DIAGONAL SPACE
    this.tiles[_i * this.col + _j].place(_val);
    for (let i = 0; i < 8; i++) {
      // console.log(i+" "+(int(this.blackOpenMoves[_i*this.col+_j]/pow(10,i))%10));
      if (
        int(this.openMoves[_val][_i * this.col + _j] / pow(10, i)) % 10 ==
        1
      ) {
        // console.log("flip "+dir[i][0]+" "+dir[i][1], +" "+_val);
        this.invert(
          _val,
          _i - dir[i][0],
          _j - dir[i][1],
          -dir[i][0],
          -dir[i][1]
        );
      }
    }
    this.tilesLeft--;
    this.tileSum = this.updateTiles();
    this.update();
    return true;
  }

  invert(_val, _i, _j, dr, dc) {
    let i = _i,
      j = _j;
    while (
      this.tiles[i * this.col + j].value > 0 &&
      this.tiles[i * this.col + j].value != _val
    ) {
      this.tiles[i * this.col + j].value = _val;
      i += dr;
      j += dc;
    }
  }

  showMoves(_player) {
    push();
    fill(0, 0, 0, 10);
    noStroke();
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        if (this.openMoves[_player][i * this.col + j] > 0) {
          ellipse(j * scl + scl / 2, i * scl + scl / 2, scl * 0.8, scl * 0.8);
        }
      }
    }
    pop();
  }

  validMoves(_player) {
    let moves = [];
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        if (this.openMoves[_player][i * this.col + j] > 0) {
          moves.push([i, j]);
        }
      }
    }
    return moves;
  }

  update() {
    let dir = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
    ];
    for (let i = 0; i < this.row * this.col; i++) {
      // RESET
      this.openMoves[1][i] = 0;
      this.openMoves[2][i] = 0;
    }

    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        if (this.tiles[i * this.col + j].value == 1) {
          // INVERT THE isAnyDirection FUNCTION TO CHECK FOR ENCAPTUREMENT
          // ITERATE THROUGH WHITE
          for (let k = 0; k < 8; k++) {
            let activation = this.isAnyDirection(
              2,
              i + dir[k][0],
              j + dir[k][1],
              dir[k][0],
              dir[k][1]
            );
            if (activation >= 0) {
              this.openMoves[1][activation] =
                this.openMoves[1][activation] + pow(10, k);
            }
          }
        } else if (this.tiles[i * this.col + j].value == 2) {
          // ITERATE THROUGH BLACK
          for (let k = 0; k < 8; k++) {
            let activation = this.isAnyDirection(
              1,
              i + dir[k][0],
              j + dir[k][1],
              dir[k][0],
              dir[k][1]
            );
            if (activation >= 0) {
              this.openMoves[2][activation] =
                this.openMoves[2][activation] + pow(10, k);
            }
          }
        }
      }
    }
  }

  isAnyDirection(_col, _i, _j, dr, dc, _cap = 0) {
    //how the screen works in p5js
    //[0,0      1,0]
    //[            ]
    //[            ]
    //[0,1      1,1]
    //dc dr
    //-1 -1 if going the diagonal left up
    // 0 -1 if going up
    // 1 -1 if going diagonal right up
    // 1  0 if going right
    // 1  1 if going diagonal bottom right
    // 0  1 if going down
    //-1  1 if going diagonal bottom left
    //-1  0 if going left
    if (_i < 0 || _i >= this.row || _j < 0 || _j >= this.col) return -1;
    if (this.tiles[_i * this.col + _j].value == _col)
      return this.isAnyDirection(_col, _i + dr, _j + dc, dr, dc, 1);
    else if (this.tiles[_i * this.col + _j].value == 0 && _cap == 1)
      return _i * this.col + _j;
    else if (this.tiles[_i * this.col + _j].value == (_col % 2) + 1) return -1;
  }

  isGameOver() {
    if (this.validMoves(1).length + this.validMoves(2).length == 0) {
      // IF NO MORE MOVES TO BE MADE
      if (this.tileSum[1] > this.tileSum[2]) return 1;
      else if (this.tileSum[1] < this.tileSum[2]) return 2;
      else return 0;
    } else {
      return -1;
    }
  }
}
