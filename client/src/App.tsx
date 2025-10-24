import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import HomePage from "@/components/HomePage";
import RoomLobby from "@/components/RoomLobby";
import GamePage from "@/pages/GamePage";
import { useGameSocket } from "@/hooks/useGameSocket";

function Router() {
  const { toast } = useToast();
  const {
    connected,
    gameState,
    playerId,
    playerColor,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    executeAction,
    finishEpoch,
    error,
  } = useGameSocket();

  const [gamePhase, setGamePhase] = useState<'home' | 'lobby' | 'game'>('home');

  // Update game phase based on game state
  useEffect(() => {
    if (gameState) {
      if (gameState.phase === 'lobby') {
        setGamePhase('lobby');
      } else if (gameState.phase === 'playing' || gameState.phase === 'scoring') {
        setGamePhase('game');
      } else if (gameState.phase === 'finished') {
        setGamePhase('game'); // Stay in game to show final scores
      }
    }
  }, [gameState]);

  // Show errors as toasts
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleCreateRoom = async (playerName: string) => {
    try {
      await createRoom(playerName);
      // Game phase will update via useEffect when gameState changes
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleJoinRoom = async (playerName: string, roomCode: string) => {
    try {
      await joinRoom(roomCode, playerName);
      // Game phase will update via useEffect when gameState changes
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame();
      // Game phase will update via useEffect when gameState changes
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  const handleToggleReady = async () => {
    try {
      await toggleReady();
    } catch (err) {
      console.error('Failed to toggle ready:', err);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Conectando al servidor...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {gamePhase === 'home' && (
          <HomePage
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        )}
        {gamePhase === 'lobby' && gameState && playerId && (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <RoomLobby
              roomCode={gameState.roomCode}
              players={gameState.players}
              isHost={playerId === gameState.players[0]?.id}
              onStartGame={handleStartGame}
              onToggleReady={handleToggleReady}
              currentPlayerId={playerId}
            />
          </div>
        )}
        {gamePhase === 'game' && gameState && playerId && (
          <GamePage
            gameState={gameState}
            playerId={playerId}
            onExecuteAction={executeAction}
            onFinishEpoch={finishEpoch}
          />
        )}
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
