import { BoardCell, Castle, TileConfig } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Castle as CastleIcon, Mountain, Flame, Gem, Sparkles } from "lucide-react";

interface GameBoardProps {
  board: BoardCell[][];
  onCellClick?: (row: number, col: number) => void;
  highlightedCells?: { row: number; col: number }[];
  currentPlayerColor?: string;
}

export default function GameBoard({ board, onCellClick, highlightedCells = [], currentPlayerColor }: GameBoardProps) {
  const isHighlighted = (row: number, col: number) => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };

  const getCastleColor = (color: string) => {
    const colors: Record<string, string> = {
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
    };
    return colors[color] || 'text-gray-600';
  };

  const getTileIcon = (type: string) => {
    switch (type) {
      case 'mountain': return <Mountain className="w-6 h-6" />;
      case 'dragon': return <Flame className="w-6 h-6" />;
      case 'goldmine': return <Gem className="w-6 h-6" />;
      case 'wizard': return <Sparkles className="w-6 h-6" />;
      default: return null;
    }
  };

  const getTileBackground = (type: string, value: number) => {
    if (type === 'resource') return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
    if (type === 'hazard') return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    if (type === 'mountain') return 'bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600';
    if (type === 'dragon') return 'bg-orange-100 dark:bg-orange-900/30 border-orange-400 dark:border-orange-700';
    if (type === 'goldmine') return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-700';
    if (type === 'wizard') return 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 dark:border-purple-700';
    return 'bg-card border-border';
  };

  return (
    <div className="inline-block p-4 bg-card/50 rounded-lg border border-card-border">
      <div className="grid grid-cols-6 gap-1">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick?.(rowIndex, colIndex)}
              disabled={!onCellClick}
              className={`
                relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 border-2 rounded-md
                transition-all duration-200
                ${cell.tile || cell.castle ? getTileBackground(cell.tile?.type || '', cell.tile?.value || 0) : 'bg-background border-border'}
                ${isHighlighted(rowIndex, colIndex) ? 'ring-4 ring-primary ring-offset-2' : ''}
                ${onCellClick && !cell.tile && !cell.castle ? 'hover-elevate active-elevate-2 cursor-pointer' : 'cursor-default'}
                ${!cell.tile && !cell.castle ? 'hover:border-primary' : ''}
              `}
              data-testid={`board-cell-${rowIndex}-${colIndex}`}
            >
              {/* Castle */}
              {cell.castle && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`${getCastleColor(cell.castle.color)} flex flex-col items-center`}>
                    {[...Array(cell.castle.rank)].map((_, i) => (
                      <CastleIcon key={i} className="w-4 h-4 -mb-2" />
                    ))}
                  </div>
                  <span className="text-xs font-bold mt-1" data-testid={`castle-rank-${cell.castle.rank}`}>
                    {cell.castle.rank}
                  </span>
                </div>
              )}

              {/* Tile */}
              {cell.tile && !cell.castle && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                  {getTileIcon(cell.tile.type)}
                  {cell.tile.type !== 'mountain' && (
                    <span 
                      className={`text-lg font-bold ${cell.tile.value >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
                      data-testid={`tile-value-${cell.tile.value}`}
                    >
                      {cell.tile.value > 0 ? '+' : ''}{cell.tile.value}
                    </span>
                  )}
                </div>
              )}

              {/* Empty cell indicator */}
              {!cell.tile && !cell.castle && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
