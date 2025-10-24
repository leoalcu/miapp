import GameBoard from '../GameBoard';
import { BoardCell } from '@shared/schema';

export default function GameBoardExample() {
  // Create a sample 5x6 board with some tiles and castles
  const sampleBoard: BoardCell[][] = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => ({
      row,
      col,
      tile: row === 0 && col === 0 ? { id: '1', type: 'resource' as const, value: 3, image: '' } :
            row === 1 && col === 2 ? { id: '2', type: 'hazard' as const, value: -2, image: '' } :
            row === 2 && col === 3 ? { id: '3', type: 'dragon' as const, value: 0, image: '' } :
            row === 3 && col === 1 ? { id: '4', type: 'goldmine' as const, value: 0, image: '' } :
            row === 4 && col === 4 ? { id: '5', type: 'wizard' as const, value: 0, image: '' } :
            undefined,
      castle: row === 0 && col === 1 ? { rank: 4 as const, color: 'red' as const } :
              row === 1 && col === 3 ? { rank: 3 as const, color: 'blue' as const } :
              row === 2 && col === 0 ? { rank: 2 as const, color: 'yellow' as const } :
              row === 3 && col === 5 ? { rank: 1 as const, color: 'green' as const } :
              undefined,
    }))
  );

  const handleCellClick = (row: number, col: number) => {
    console.log(`Cell clicked: row ${row}, col ${col}`);
  };

  const highlightedCells = [{ row: 2, col: 2 }, { row: 2, col: 4 }];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <GameBoard 
        board={sampleBoard}
        onCellClick={handleCellClick}
        highlightedCells={highlightedCells}
        currentPlayerColor="red"
      />
    </div>
  );
}
