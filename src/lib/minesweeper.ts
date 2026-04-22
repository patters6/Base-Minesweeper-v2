export type CellValue = 'mine' | number;

export interface Cell {
  value: CellValue;
  isRevealed: boolean;
  isFlagged: boolean;
  row: number;
  col: number;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export function createBoard(rows: number, cols: number, minesCount: number): Cell[][] {
  const board: Cell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      value: 0,
      isRevealed: false,
      isFlagged: false,
      row: r,
      col: c,
    }))
  );

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < minesCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c].value !== 'mine') {
      board[r][c].value = 'mine';
      minesPlaced++;
    }
  }

  // Calculate numbers
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].value === 'mine') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].value === 'mine') {
            count++;
          }
        }
      }
      board[r][c].value = count;
    }
  }

  return board;
}

export function getNeighbors(board: Cell[][], row: number, col: number): Cell[] {
  const neighbors: Cell[] = [];
  const rows = board.length;
  const cols = board[0].length;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push(board[nr][nc]);
      }
    }
  }
  return neighbors;
}

export function revealCell(board: Cell[][], row: number, col: number): Cell[][] {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  const cell = newBoard[row][col];

  if (cell.isRevealed || cell.isFlagged) return newBoard;

  cell.isRevealed = true;

  if (cell.value === 0) {
    const neighbors = getNeighbors(newBoard, row, col);
    neighbors.forEach(n => {
      if (!n.isRevealed && !n.isFlagged) {
        // recursively reveal neighbors (simple functional approach)
        const updated = revealCell(newBoard, n.row, n.col);
        // Sync the board state
        for (let r = 0; r < updated.length; r++) {
          for (let c = 0; c < updated[0].length; c++) {
            newBoard[r][c] = updated[r][c];
          }
        }
      }
    });
  }

  return newBoard;
}
