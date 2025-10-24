import RoomLobby from '../RoomLobby';
import { Player } from '@shared/schema';

export default function RoomLobbyExample() {
  const samplePlayers: Player[] = [
    {
      id: '1',
      name: 'Juan (Host)',
      color: 'red',
      gold: 50,
      castles: { rank1: 4, rank2: 3, rank3: 2, rank4: 1 },
      isReady: true,
    },
    {
      id: '2',
      name: 'María',
      color: 'blue',
      gold: 50,
      castles: { rank1: 4, rank2: 3, rank3: 2, rank4: 1 },
      isReady: true,
    },
    {
      id: '3',
      name: 'Pedro',
      color: 'yellow',
      gold: 50,
      castles: { rank1: 4, rank2: 3, rank3: 2, rank4: 1 },
      isReady: false,
    },
  ];

  const handleStartGame = () => {
    console.log('Start game clicked');
  };

  const handleToggleReady = () => {
    console.log('Toggle ready clicked');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <RoomLobby
        roomCode="ABC123"
        players={samplePlayers}
        isHost={false}
        onStartGame={handleStartGame}
        onToggleReady={handleToggleReady}
        currentPlayerId="2"
      />
    </div>
  );
}
