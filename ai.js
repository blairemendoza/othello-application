class AI {
  constructor(_player) {
    this.player = _player;
    this.opponent = (_player % 2) + 1;
    this.depth = 3;
  }

  minimax(oldBoard, depth, alpha, beta, maximizingPlayer) {
    // IF GAME OVER
    if (!oldBoard.isGameOver() || depth == 0) {
      return this.heuristics(oldBoard);
    }

    // CALCULATE HEURISTICS FOR EACH
    // OPENSET OF THE CURRENT MIN/MAX

    if (maximizingPlayer == true) {
      // IF THE PLAYER WANTS TO MAXIMIZE SCORE
      let validMoves = oldBoard.validMoves(this.player);
      if (validMoves.length == 0) {
        // IF THERE ARE NO VALIDMOVES
        let nBoard = _.cloneDeep(oldBoard);
        // LET THEM PASS WITH THE NEXT
        return max(
          this.heuristics(nBoard),
          this.minimax(nBoard, depth - 1, alpha, beta, false)
        );
      } else {
        let maxE = -Infinity;
        for (let i = 0; i < validMoves.length; i++) {
          let tempBoard = _.cloneDeep(board);
          tempBoard.place(validMoves[i][0], validMoves[i][1], this.player);
          let evalu = max(
            this.heuristics(tempBoard),
            this.minimax(tempBoard, depth - 1, alpha, beta, false)
          ); // this.minimax(tempBoard, depth-1, alpha, beta, false); */
          maxE = max(maxE, evalu);
          // console.log("maxE", maxE);
          alpha = max(alpha, evalu);
          // console.log("alpha", alpha);
          if (beta <= alpha) break;
        }
        return maxE;
      }
    } else {
      // IF THE PLAYER WANTS TO MINIMIZE
      let validMoves = oldBoard.validMoves(this.opponent);
      if (validMoves.length == 0) {
        // IF THERE ARE NO VALIDMOVES
        let nBoard = _.cloneDeep(oldBoard);
        return min(
          this.heuristics(nBoard),
          this.minimax(nBoard, depth - 1, alpha, beta, true)
        );
      } else {
        let minE = Infinity;
        for (let i = 0; i < validMoves.length; i++) {
          let tempBoard = _.cloneDeep(board);
          tempBoard.place(validMoves[i][0], validMoves[i][1], this.opponent);
          let evalu = min(
            this.heuristics(tempBoard),
            this.minimax(tempBoard, depth - 1, alpha, beta, true)
          );
          minE = min(minE, evalu);
          beta = min(beta, evalu);
          if (beta <= alpha) break;
        }
        return minE;
      }
    }
  }

  move() {
    // LOOP EVERY POSSIBLE MOVES
    let validMoves = board.validMoves(this.player);
    if (validMoves.length == 0) return false;
    let maxE = -Infinity;
    let sel = 0;
    for (let i = 0; i < validMoves.length; i++) {
      let tempBoard = _.cloneDeep(board);
      tempBoard.place(validMoves[i][0], validMoves[i][1], this.player);
      let evalu = this.minimax(
        tempBoard,
        this.depth - 1,
        -Infinity,
        Infinity,
        false
      );
      /* let evalu = max(this.heuristics(tempBoard), this.minimax(tempBoard, this.depth-1, -Infinity, Infinity, false)); */
      // console.log(evalu);
      if (evalu > maxE) sel = i;
      maxE = max(maxE, evalu);
    }
    // console.log(maxE);
    board.place(validMoves[sel][0], validMoves[sel][1], this.player);
    return true;
    // console.log("Placing "+validMoves[sel][0]+", "+validMoves[sel][1]);
  }

  heuristics(targetBoard) {
    let my_tiles = 0,
      opp_tiles = 0,
      my_front_tiles = 0,
      opp_front_tiles = 0,
      x,
      y;
    let p = 0,
      c = 0,
      l = 0,
      m = 0,
      f = 0,
      d = 0;

    let X1 = [-1, -1, 0, 1, 1, 1, 0, -1];
    let Y1 = [0, 1, 1, 1, 0, -1, -1, -1];

    let weights = [
      [20, -7, 11, 8, 8, 11, -7, 20],
      [-7, -10, -4, 1, 1, -4, -10, -7],
      [11, -4, 2, 2, 2, 2, -4, 11],
      [8, 1, 2, -3, -3, 2, 1, 8],
      [8, 1, 2, -3, -3, 2, 1, 8],
      [11, -4, 2, 2, 2, 2, -4, 11],
      [-7, -10, -4, 1, 1, -4, -10, -7],
      [20, -7, 11, 8, 8, 11, -7, 20],
    ];

    // PIECE DIFFERENCE
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (targetBoard.tiles[i * 8 + j].value == this.player) {
          // IF MY VALUE
          d += weights[i][j];
          my_tiles++;
        } else if (targetBoard.tiles[i * 8 + j].value == this.opponent) {
          d -= weights[i][j];
          opp_tiles++;
        }
        if (targetBoard.tiles[i * 8 + j].value > 0) {
          for (let k = 0; k < 8; k++) {
            x = i + X1[k];
            y = j + Y1[k];
            if (
              x >= 0 &&
              x < 8 &&
              y >= 0 &&
              y < 8 &&
              targetBoard.tiles[y * 8 + x] == 0
            ) {
              if (targetBoard.tiles[i * 8 + j] == this.player) my_front_tiles++;
              else opp_front_tiles++;
              break;
            }
          }
        }
      }
    }
    if (my_tiles > opp_tiles) p = (100.0 * my_tiles) / (my_tiles + opp_tiles);
    else if (my_tiles < opp_tiles)
      p = -(100.0 * opp_tiles) / (my_tiles + opp_tiles);
    else p = 0;

    if (my_front_tiles > opp_front_tiles)
      f = -(100.0 * my_front_tiles) / (my_front_tiles + opp_front_tiles);
    else if (my_front_tiles < opp_front_tiles)
      f = (100.0 * opp_front_tiles) / (my_front_tiles + opp_front_tiles);
    else f = 0;

    // CORNER OCCUPANCY
    my_tiles = 0;
    opp_tiles = 0;

    if (targetBoard.tiles[0].value == this.player) my_tiles++;
    else if (targetBoard.tiles[0].value == this.opponent) opp_tiles++;

    if (targetBoard.tiles[7 * 8].value == this.player) my_tiles++;
    else if (targetBoard.tiles[7 * 8].value == this.opponent) opp_tiles++;

    if (targetBoard.tiles[7].value == this.player) my_tiles++;
    else if (targetBoard.tiles[7].value == this.opponent) opp_tiles++;

    if (targetBoard.tiles[7 * 8 + 7].value == this.player) my_tiles++;
    else if (targetBoard.tiles[7 * 8 + 7].value == this.opponent) opp_tiles++;

    c = 25 * (my_tiles - opp_tiles);

    // CORNER CLOSENESS
    my_tiles = 0;
    opp_tiles = 0;

    if (targetBoard.tiles[0].value == 0) {
      if (targetBoard.tiles[1].value == this.player) my_tiles++;
      else if (targetBoard.tiles[1].value == this.opponent) opp_tiles++;
      if (targetBoard.tiles[1 * 8 + 1].value == this.player) my_tiles++;
      else if (targetBoard.tiles[1 * 8 + 1].value == this.opponent) opp_tiles++;
      if (targetBoard.tiles[8].value == this.player) my_tiles++;
      else if (targetBoard.tiles[8].value == this.opponent) opp_tiles++;
    }

    if (targetBoard.tiles[7].value == 0) {
      if (targetBoard.tiles[6].value == this.player) my_tiles++;
      else if (targetBoard.tiles[6].value == this.opponent) opp_tiles++;
      if (targetBoard.tiles[1 * 8 + 6].value == this.player) my_tiles++;
      else if (targetBoard.tiles[1 * 8 + 6].value == this.opponent) opp_tiles++;
      if (targetBoard.tiles[1 * 8 + 7].value == this.player) my_tiles++;
      else if (targetBoard.tiles[1 * 8 + 7].value == this.opponent) opp_tiles++;
    }

    if (targetBoard.tiles[7 * 8].value == 0) {
      if (targetBoard.tiles[7 * 8 + 1].value == this.player) my_tiles++;
      else if (targetBoard.tiles[7 * 8 + 1].value == this.opponent) opp_tiles++;
      if (targetBoard.tiles[6 * 8 + 1].value == this.player) my_tiles++;
      else if (targetBoard.tiles[6 * 8 + 1].value == this.opponent) opp_tiles++;
      if (targetBoard.tiles[6 * 8].value == this.player) my_tiles++;
      else if (targetBoard.tiles[6 * 8].value == this.opponent) opp_tiles++;
    }

    if (targetBoard.tiles[7 * 8 + 7].value == 0) {
      if (targetBoard.tiles[6 * 8 + 7].value == this.player) my_tiles++;
      else if (targetBoard.tiles[6 * 8 + 7].value == this.opponent) opp_tiles++;
      if (targetBoard.tiles[6 * 8 + 6].value == this.player) my_tiles++;
      else if (targetBoard.tiles[6 * 8 + 6].value == this.opponent) opp_tiles++;
      if (targetBoard.tiles[7 * 8 + 6].value == this.player) my_tiles++;
      else if (targetBoard.tiles[7 * 8 + 6].value == this.opponent) opp_tiles++;
    }

    l = -12.5 * (my_tiles - opp_tiles);

    // MOBILITY
    my_tiles = targetBoard.validMoves(this.player).length;
    opp_tiles = targetBoard.validMoves(this.opponent).length;

    if (my_tiles > opp_tiles) {
      m = (100.0 * my_tiles) / (my_tiles + opp_tiles);
    } else if (my_tiles < opp_tiles) {
      m = -(100.0 * my_tiles) / (my_tiles + opp_tiles);
    } else {
      m = 0;
    }
    // FINAL WEIGHTED SCORE
    let score =
      10 * p + 801.724 * c + 382.026 * l + 78.922 * m + 74.396 * f + 10 * d;
    return score;
  }
}
