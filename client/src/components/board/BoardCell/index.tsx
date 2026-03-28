import { cn } from "@/lib/utils";
import { CellSymbol } from "@/types/game";

interface BoardCellProps {
  value: CellSymbol | null;
  index: number;
  onClick: (index: number) => void;
  disabled: boolean;
  isWinningCell: boolean;
}

export function BoardCell({ value, index, onClick, disabled, isWinningCell }: BoardCellProps) {
  return (
    <button
      onClick={() => onClick(index)}
      disabled={disabled || value !== null}
      className={cn(
        "aspect-square flex items-center justify-center rounded-xl border border-border text-4xl font-bold transition-all duration-150",
        "bg-secondary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed",
        value !== null && "animate-cell-pop",
        isWinningCell && "bg-primary/20 border-primary",
        value === "X" && "text-primary",
        value === "O" && "text-destructive"
      )}
    >
      {value}
    </button>
  );
}
