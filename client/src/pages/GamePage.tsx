import { useState } from "react";
import GameBoard from "@/components/GameBoard";
import PlayerPanel from "@/components/PlayerPanel";
import EpochTracker from "@/components/EpochTracker";
import ActionPanel from "@/components/ActionPanel";
import CastleSelector from "@/components/CastleSelector";
import ScoreDisplay from "@/components/ScoreDisplay";
import { GameState, GameAction } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GamePageProps {
  gameState: GameState;
  playerId: string;
  onExecuteAction: (action: GameAction) => Promise<void>;
  onFinishEpoch: () => Promise<{ scores: any[] }>;
}

export default function GamePage({ gameState, playerId, onExecuteAction, onFinishEpoch }: GamePageProps) {
  const { toast } = useToast();
  const [showCastleSelector, setShowCastleSelector] = useState(false);
  const [showScoreDisplay, setShowScoreDisplay] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'castle' | 'tile' | 'secret' | null>(null);
  const [selectedCastleRank, setSelectedCastleRank] = useState<1 | 2 | 3 | 4 | null>(null);
  const [epochScores, setEpochScores] = useState<any[]>([]);

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  const handleCellClick = async (row: number, col: number) => {
    if (!selectedAction || !isCurrentTurn) return;

    try {
      if (selectedAction === 'castle' && selectedCastleRank) {
        await onExecuteAction({
          type: 'PLACE_CASTLE',
          castleRank: selectedCastleRank,
          row,
          col,
        });
      } else if (selectedAction === 'tile') {
        await onExecuteAction({
          type: 'DRAW_AND_PLACE_TILE',
          row,
          col,
        });
      } else if (selectedAction === 'secret') {
        await onExecuteAction({
          type: 'PLAY_SECRET_TILE',
          row,
          col,
        });
      }

      // Reset selection
      setSelectedAction(null);
      setSelectedCastleRank(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handlePlaceCastle = () => {
    if (!isCurrentTurn) {
      toast({
        title: "No es tu turno",
        description: "Espera tu turno para jugar",
        variant: "destructive",
      });
      return;
    }
    setShowCastleSelector(true);
  };

  const handleDrawTile = async () => {
    if (!isCurrentTurn) {
      toast({
        title: "No es tu turno",
        description: "Espera tu turno para jugar",
        variant: "destructive",
      });
      return;
    }
    setSelectedAction('tile');
    toast({
      title: "Selecciona una celda",
      description: "Haz clic en una celda vacía para colocar la ficha",
    });
  };

  const handlePlaySecretTile = () => {
    if (!isCurrentTurn) {
      toast({
        title: "No es tu turno",
        description: "Espera tu turno para jugar",
        variant: "destructive",
      });
      return;
    }
    setSelectedAction('secret');
    toast({
      title: "Selecciona una celda",
      description: "Haz clic en una celda vacía para colocar tu ficha secreta",
    });
  };

  const handleSelectCastle = (rank: 1 | 2 | 3 | 4) => {
    setSelectedCastleRank(rank);
    setSelectedAction('castle');
    toast({
      title: "Selecciona una celda",
      description: `Haz clic en una celda vacía para colocar tu castillo de rango ${rank}`,
    });
  };

  const handleFinishEpoch = async () => {
    try {
      const result = await onFinishEpoch();
      setEpochScores(result.scores);
      setShowScoreDisplay(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Get highlighted cells (empty cells when an action is selected)
  const highlightedCells = selectedAction
    ? gameState.board.flatMap((row, rowIdx) =>
        row
          .filter((cell, colIdx) => !cell.tile && !cell.castle)
          .map(cell => ({ row: cell.row, col: cell.col }))
      )
    : [];

  const isBoardFull = gameState.board.every(row =>
    row.every(cell => cell.tile || cell.castle)
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-serif font-bold">Kingdoms</h1>
            <EpochTracker currentEpoch={gameState.epoch} />
            <div className="flex gap-2">
              {gameState.phase === 'finished' && (
                <Button 
                  onClick={() => setShowScoreDisplay(true)}
                  variant="default"
                  data-testid="button-view-final-scores"
                >
                  Puntuación Final
                </Button>
              )}
              {isBoardFull && gameState.phase === 'playing' && isCurrentTurn && (
                <Button 
                  onClick={handleFinishEpoch}
                  variant="default"
                  data-testid="button-finish-epoch"
                >
                  Finalizar Época
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-[1fr_auto_300px] gap-4">
          {/* Players Left Column */}
          <div className="space-y-2 order-2 lg:order-1">
            <h2 className="text-lg font-serif font-semibold mb-2">Jugadores</h2>
            {gameState.players.map((player, index) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrentPlayer={index === gameState.currentPlayerIndex}
                isYou={player.id === playerId}
              />
            ))}
          </div>

          {/* Game Board Center */}
          <div className="flex items-start justify-center order-1 lg:order-2">
            <GameBoard
              board={gameState.board}
              onCellClick={handleCellClick}
              highlightedCells={highlightedCells}
              currentPlayerColor={currentPlayer?.color}
            />
          </div>

          {/* Action Panel Right Column */}
          <div className="order-3">
            <div className="sticky top-4">
              {gameState.phase === 'playing' && (
                <ActionPanel
                  onPlaceCastle={handlePlaceCastle}
                  onDrawTile={handleDrawTile}
                  onPlaySecretTile={handlePlaySecretTile}
                  hasSecretTile={!!currentPlayer?.secretTile}
                  disabled={!isCurrentTurn}
                />
              )}
              
              {gameState.phase === 'finished' && (
                <Card className="p-6 text-center space-y-4">
                  <h2 className="text-2xl font-serif font-bold">¡Juego Terminado!</h2>
                  <p className="text-muted-foreground">
                    Ganador: {[...gameState.players].sort((a, b) => b.gold - a.gold)[0].name}
                  </p>
                  <Button 
                    onClick={() => setShowScoreDisplay(true)}
                    className="w-full"
                  >
                    Ver Puntuación Final
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {currentPlayer && (
        <CastleSelector
          open={showCastleSelector}
          onClose={() => setShowCastleSelector(false)}
          castles={currentPlayer.castles}
          playerColor={currentPlayer.color}
          onSelectCastle={handleSelectCastle}
        />
      )}

      <ScoreDisplay
        open={showScoreDisplay}
        onClose={() => setShowScoreDisplay(false)}
        players={gameState.players}
        epoch={gameState.epoch}
        scores={epochScores}
      />
    </div>
  );
}
