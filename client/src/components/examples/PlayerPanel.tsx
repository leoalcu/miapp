import PlayerPanel from '../PlayerPanel';
import { Player } from '@shared/schema';

export default function PlayerPanelExample() {
  const samplePlayers: Player[] = [
    {
      id: '1',
      name: 'Juan',
      color: 'red',
      gold: 85,
      castles: { rank1: 3, rank2: 2, rank3: 1, rank4: 0 },
      secretTile: { id: 's1', type: 'resource', value: 4, image: '' },
      isReady: false,
    },
    {
      id: '2',
      name: 'María',
      color: 'blue',
      gold: 62,
      castles: { rank1: 4, rank2: 3, rank3: 2, rank4: 1 },
      isReady: true,
    },
    {
      id: '3',
      name: 'Pedro',
      color: 'yellow',
      gold: 120,
      castles: { rank1: 2, rank2: 1, rank3: 0, rank4: 0 },
      secretTile: { id: 's2', type: 'hazard', value: -3, image: '' },
      isReady: false,
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        <PlayerPanel player={samplePlayers[0]} isCurrentPlayer isYou />
        <PlayerPanel player={samplePlayers[1]} />
        <PlayerPanel player={samplePlayers[2]} />
      </div>
    </div>
  );
}
