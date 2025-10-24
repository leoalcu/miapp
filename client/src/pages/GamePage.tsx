import { useState, useEffect } from "react";
import GameBoard from "@/components/GameBoard";
import PlayerPanel from "@/components/PlayerPanel";
import EpochTracker from "@/components/EpochTracker";
import ActionPanel from "@/components/ActionPanel";
import CastleSelector from "@/components/CastleSelector";
import ScoreDisplay from "@/components/ScoreDisplay";
import FinalScoreDisplay from "@/components/FinalScoreDisplay";
import DrawnTileDialog from "@/components/DrawnTileDialog";
import TileDeckCounter from "@/components/TileDeckCounter";
import GameLog from "@/components/GameLog";
import { GameState, GameAction } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GamePageProps {
  gameState: GameState;
  playerId: string;
  onExecuteAction: (action: GameAction) => Promise<void>;
  onFinishEpoch: () => Promise<{ scores: any[] }>;
  onExitGame?: () => void;
}

export default function GamePage({ gameState, playerId, onExecuteAction, onFinishEpoch, onExitGame }: GamePageProps) {
  const { toast } = useToast();
  const [showCastleSelector, setShowCastleSelector] = useState(false);
  const [showScoreDisplay, setShowScoreDisplay] = useState(false);
  const [showFinalScoreDisplay, setShowFinalScoreDisplay] = useState(false);
  const [showDrawnTileDialog, setShowDrawnTileDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'castle' | 'tile' | 'secret' | null>(null);
  const [selectedCastleRank, setSelectedCastleRank] = useState<1 | 2 | 3 | 4 | null>(null);
  const [epochScores, setEpochScores] = useState<any[]>([]);

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  // Show drawn tile dialog when player has a drawn tile
  useEffect(() => {
    if (currentPlayer?.drawnTile && isCurrentTurn) {
      setShowDrawnTileDialog(true);
    } else {
      setShowDrawnTileDialog(false);
    }
  }, [currentPlayer?.drawnTile, isCurrentTurn]);

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
        // Place the previously drawn tile
        await onExecuteAction({
          type: 'PLACE_DRAWN_TILE',
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
    
    try {
      // First, draw a tile from the deck
      await onExecuteAction({ type: 'DRAW_TILE' });
      // Dialog will show automatically via useEffect when drawnTile is set
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handlePlaceDrawnTile = () => {
    setShowDrawnTileDialog(false);
    setSelectedAction('tile');
    toast({
      title: "Selecciona una celda",
      description: "Haz clic en una celda vacía para colocar tu ficha",
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

  // Check if there are any valid moves left for ANY player
  const hasEmptyCells = gameState.board.some(row =>
    row.some(cell => !cell.tile && !cell.castle)
  );
  
  // Check if ANY player has pending actions or can make a move
  const anyPlayerHasPendingMoves = gameState.players.some(player => 
    player.drawnTile // Has a drawn tile that MUST be placed
  );
  
  const anyPlayerCanMakeNewMove = hasEmptyCells && gameState.players.some(player => 
    gameState.tileDeck.length > 0 || // Can draw tiles
    player.secretTile || // Can play secret tile
    Object.values(player.castles).some(count => count > 0) // Can place castle
  );
  
  // Show finish button ONLY when: no pending moves AND (no new moves possible OR board is full)
  const shouldShowFinishEpoch = (gameState.phase === 'playing' || gameState.phase === 'scoring') && 
    !anyPlayerHasPendingMoves && 
    (!anyPlayerCanMakeNewMove || isBoardFull);

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
                  onClick={() => setShowFinalScoreDisplay(true)}
                  variant="default"
                  data-testid="button-view-final-scores"
                >
                  Ver Puntuación Final
                </Button>
              )}
              {shouldShowFinishEpoch && (
                <Button 
                  onClick={handleFinishEpoch}
                  variant="default"
                  data-testid="button-finish-epoch"
                  className="animate-pulse"
                >
                  {isBoardFull ? 'Tablero Lleno - ' : ''}Finalizar Época {gameState.epoch}
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
            <div className="sticky top-4 space-y-4">
              {/* Tile Deck Counter */}
              <TileDeckCounter 
                count={gameState.tileDeck.length}
                lastPlayedTile={gameState.lastPlayedTile}
              />
              
              {gameState.phase === 'playing' && (
                <ActionPanel
                  onPlaceCastle={handlePlaceCastle}
                  onDrawTile={handleDrawTile}
                  onPlaySecretTile={handlePlaySecretTile}
                  hasSecretTile={!!currentPlayer?.secretTile}
                  hasDrawnTile={!!currentPlayer?.drawnTile}
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
                    onClick={() => setShowFinalScoreDisplay(true)}
                    className="w-full"
                    data-testid="button-show-final-scores"
                  >
                    Ver Puntuación Final
                  </Button>
                </Card>
              )}
              
              {/* Game Log */}
              <div className="h-96">
                <GameLog gameLog={gameState.gameLog} />
              </div>
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

      <FinalScoreDisplay
        open={showFinalScoreDisplay}
        onClose={() => setShowFinalScoreDisplay(false)}
        players={gameState.players}
        onExit={onExitGame}
      />

      <DrawnTileDialog
        open={showDrawnTileDialog}
        tile={currentPlayer?.drawnTile || null}
        onClose={() => setShowDrawnTileDialog(false)}
        onPlaceTile={handlePlaceDrawnTile}
      />
    </div>
  );
}
