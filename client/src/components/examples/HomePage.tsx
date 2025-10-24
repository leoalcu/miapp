import HomePage from '../HomePage';

export default function HomePageExample() {
  const handleCreateRoom = (playerName: string) => {
    console.log(`Creating room for player: ${playerName}`);
  };

  const handleJoinRoom = (playerName: string, roomCode: string) => {
    console.log(`Player ${playerName} joining room: ${roomCode}`);
  };

  return (
    <HomePage
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
    />
  );
}
