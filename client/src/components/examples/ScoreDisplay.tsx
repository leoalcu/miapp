import { useState } from 'react';
import ScoreDisplay from '../ScoreDisplay';
import { Button } from '@/components/ui/button';
import { Player } from '@shared/schema';

export default function ScoreDisplayExample() {
  const [open, setOpen] = useState(false);

  const samplePlayers: Player[] = [
    {
      id: '1',
      name: 'Juan',
      color: 'red',
      gold: 125,
      castles: { rank1: 3, rank2: 2, rank3: 1, rank4: 0 },
      isReady: false,
    },
    {
      id: '2',
      name: 'María',
      color: 'blue',
      gold: 98,
      castles: { rank1: 4, rank2: 3, rank3: 2, rank4: 1 },
      isReady: false,
    },
  ];

  const sampleScores = [
    {
      playerId: '1',
      rowScores: [12, -5, 18, 8, 0],
      colScores: [15, 10, -8, 6, 12, 20],
      totalScore: 88,
    },
    {
      playerId: '2',
      rowScores: [8, 15, -3, 12, 6],
      colScores: [10, -5, 18, 8, 0, 15],
      totalScore: 84,
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div>
        <Button onClick={() => setOpen(true)}>Show Scores</Button>
        <ScoreDisplay
          open={open}
          onClose={() => setOpen(false)}
          players={samplePlayers}
          epoch={1}
          scores={sampleScores}
        />
      </div>
    </div>
  );
}
