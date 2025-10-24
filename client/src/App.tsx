import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/components/HomePage";
import RoomLobby from "@/components/RoomLobby";
import GamePage from "@/pages/GamePage";
import { Player } from "@shared/schema";

function Router() {
  // TODO: remove mock functionality - this will be replaced with real game state management
  const [gamePhase, setGamePhase] = useState<'home' | 'lobby' | 'game'>('home');
  const [roomCode, setRoomCode] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState('');

  const mockPlayers: Player[] = [
    {
      id: '1',
      name: 'Juan',
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
      isReady: false,
    },
  ];

  const handleCreateRoom = (playerName: string) => {
    console.log('Creating room for:', playerName);
    setRoomCode('ABC123');
    setCurrentPlayerId('1');
    setGamePhase('lobby');
  };

  const handleJoinRoom = (playerName: string, code: string) => {
    console.log('Joining room:', code, 'as', playerName);
    setRoomCode(code);
    setCurrentPlayerId('2');
    setGamePhase('lobby');
  };

  const handleStartGame = () => {
    console.log('Starting game');
    setGamePhase('game');
  };

  const handleToggleReady = () => {
    console.log('Toggling ready status');
  };

  return (
    <Switch>
      <Route path="/">
        {gamePhase === 'home' && (
          <HomePage
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        )}
        {gamePhase === 'lobby' && (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <RoomLobby
              roomCode={roomCode}
              players={mockPlayers}
              isHost={currentPlayerId === '1'}
              onStartGame={handleStartGame}
              onToggleReady={handleToggleReady}
              currentPlayerId={currentPlayerId}
            />
          </div>
        )}
        {gamePhase === 'game' && <GamePage />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
