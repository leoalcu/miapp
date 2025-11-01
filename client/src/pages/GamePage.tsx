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
import SaveGameDialog from "@/components/SaveGameDialog";
import { GameState, GameAction } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GamePageProps {
  gameState: GameState;
  playerId: string;
  onExecuteAction: (action: GameAction) => Promise<void>;
  onFinishEpoch: () => Promise<{ scores: any[] }>;
  onAbandonGame: () => Promise<void>;
  onExitGame?: () => void;
}

export default function GamePage({ gameState, playerId, onExecuteAction, onFinishEpoch, onAbandonGame, onExitGame }: GamePageProps) {
  const { toast } = useToast();
  const [showCastleSelector, setShowCastleSelector] = useState(false);
  const [showScoreDisplay, setShowScoreDisplay] = useState(false);
  const [showFinalScoreDisplay, setShowFinalScoreDisplay] = useState(false);
  const [showDrawnTileDialog, setShowDrawnTileDialog] = useState(false);
  const [showSaveGameDialog, setShowSaveGameDialog] = useState(false);
  const [gameSaved, setGameSaved] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'castle' | 'tile' | 'secret' | null>(null);
  const [selectedCastleRank, setSelectedCastleRank] = useState<1 | 2 | 3 | 4 | null>(null);
  const [epochScores, setEpochScores] = useState<any[]>([]);

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  useEffect(() => {
    if (currentPlayer?.drawnTile && isCurrentTurn) {
      setShowDrawnTileDialog(true);
    } else {
      setShowDrawnTileDialog(false);
    }
  }, [currentPlayer?.drawnTile, isCurrentTurn]);

  useEffect(() => {
    if (gameState.phase === 'finished' && !gameSaved) {
      const timer = setTimeout(() => {
        setShowSaveGameDialog(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameSaved]);

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
      await onExecuteAction({ type: 'DRAW_TILE' });
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

  const hasEmptyCells = gameState.board.some(row =>
    row.some(cell => !cell.tile && !cell.castle)
  );
  
  const anyPlayerHasPendingMoves = gameState.players.some(player => 
    player.drawnTile
  );
  
  const anyPlayerCanMakeNewMove = hasEmptyCells && gameState.players.some(player => 
    gameState.tileDeck.length > 0 ||
    player.secretTile ||
    Object.values(player.castles).some(count => count > 0)
  );
  
  const shouldShowFinishEpoch = (gameState.phase === 'playing' || gameState.phase === 'scoring') && 
    !anyPlayerHasPendingMoves && 
    (!anyPlayerCanMakeNewMove || isBoardFull);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-serif font-bold">Kingdoms</h1>
            <EpochTracker currentEpoch={gameState.epoch} />
            <div className="flex gap-2">
              {gameState.phase === 'finished' && (
                <Button 
                  onClick={() => setShowFinalScoreDisplay(true)}
                  variant="default"
                >
                  Ver Puntuación Final
                </Button>
              )}
              {shouldShowFinishEpoch && (
                <Button 
                  onClick={handleFinishEpoch}
                  variant="default"
                  className="animate-pulse"
                >
                  {isBoardFull ? 'Tablero Lleno - ' : ''}Finalizar Época {gameState.epoch}
                </Button>
              )}
              {(gameState.phase === 'playing' || gameState.phase === 'scoring') && (
                <Button 
                  onClick={async () => {
                    try {
                      await onAbandonGame();
                      toast({
                        title: "Partida abandonada",
                        description: "La partida ha sido finalizada",
                      });
                    } catch (err: any) {
                      toast({
                        title: "Error",
                        description: err.message,
                        variant: "destructive",
                      });
                    }
                  }}
                  variant="destructive"
                >
                  Abandonar Partida
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-[1fr_auto_300px] gap-4">
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

          <div className="flex items-start justify-center order-1 lg:order-2">
            <GameBoard
              board={gameState.board}
              onCellClick={handleCellClick}
              highlightedCells={highlightedCells}
              currentPlayerColor={currentPlayer?.color}
            />
          </div>

          <div className="order-3">
            <div className="sticky top-4 space-y-4">
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
                  >
                    Ver Puntuación Final
                  </Button>
                </Card>
              )}
              
              <div className="h-96">
                <GameLog gameLog={gameState.gameLog} />
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <SaveGameDialog
        open={showSaveGameDialog}
        onClose={() => setShowSaveGameDialog(false)}
        gameState={gameState}
        onGameSaved={() => setGameSaved(true)}
      />
    </div>
  );
}