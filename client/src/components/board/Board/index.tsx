import { CellSymbol } from "@/types/game";
import { BoardCell } from "../BoardCell";

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinningCells(board: (CellSymbol | null)[]): number[] {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return [];
}

interface BoardProps {
  board: (CellSymbol | null)[];
  onCellClick: (index: number) => void;
  disabled: boolean;
}

export function Board({ board, onCellClick, disabled }: BoardProps) {
  const winningCells = getWinningCells(board);

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto">
      {board.map((cell, i) => (
        <BoardCell
          key={i}
          index={i}
          value={cell}
          onClick={onCellClick}
          disabled={disabled}
          isWinningCell={winningCells.includes(i)}
        />
      ))}
    </div>
  );
}
