const BINGO = ['B', 'I', 'N', 'G', 'O'];

export const shuffleBingoBoard = () => {
  const el = generateRandomArray();

  let x = 0;
  return Array.from(Array(5), _ => {
    return Array.from(Array(5), __ => {
      return {
        active: false,
        value: el[x++],
        win_shot: false
      };
    })
  });
}

export const generateRandomArray = () => {
  const el = Array.from(Array(25), (_, j) => j + 1);
  return shuffleArrayElement(el);
}

export const shuffleArrayElement = (arr: Array<number>) => {
  let currentIndex = arr.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
}

export const updateCurrentBoard = (board: any[][], x: number, y: number) => {
  return board.map((_x, i) => {
    _x.forEach((_y, j) => {
      if (i === x && j === y) {
        _y.active = true;
      }
    })
    return _x
  })
}

export const revealOpponentChip = (board: any[][], value: number) => {
  return board.map((_x) => {
    _x.forEach((_y) => {
      if (_y.value === value) {
        _y.active = true;
      }
    })
    return _x;
  });
}

export const checkWinner = (board: any[][]): boolean => {
  let winnerShots = 0;
  //checking horizontally + vertically
  for (let i = 0; i<board.length; i++) {
    const m: any[] = [];
    const n: any[] = []
    for (let j = 0; j<board[i].length; j++) {
      m.push(board[i][j]);
      n.push(board[j][i]);
    }
    if (m.every(_m => _m.active === true)) {
      for (let k = 0; k<board[i].length; k++) {
        board[i][k].win_shot = true;
      }
      winnerShots++;
    }
    if (n.every(_n => _n.active === true)) {
      for (let k = 0; k<board[i].length; k++) {
        board[k][i].win_shot = true;
      }
      winnerShots++;
    }
  }
  //checking diagonally
  const o: any[] = [];
  const p: any[] = [];
  for (let i = 0; i<board.length; i++) {
    o.push(board[i][i]);
    p.push(board[i][board.length - 1 -i]);
  }
  if (o.every(_o => _o.active === true)) {
    for (let x = 0; x<board.length; x++) {
      board[x][x].win_shot = true;
    }
    winnerShots++;
  }
  if (p.every(_p => _p.active === true)) {
    for (let x = 0; x<board.length; x++) {
      board[x][board.length - 1 - x].win_shot = true;
    }
    winnerShots++;
  }

  return winnerShots === 5;
}