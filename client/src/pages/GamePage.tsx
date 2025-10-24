import { useState } from "react";
import GameBoard from "@/components/GameBoard";
import PlayerPanel from "@/components/PlayerPanel";
import EpochTracker from "@/components/EpochTracker";
import ActionPanel from "@/components/ActionPanel";
import CastleSelector from "@/components/CastleSelector";
import ScoreDisplay from "@/components/ScoreDisplay";
import { BoardCell, Player } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GamePage() {
  const [showCastleSelector, setShowCastleSelector] = useState(false);
  const [showScoreDisplay, setShowScoreDisplay] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'castle' | 'tile' | null>(null);

  // Mock data - TODO: remove mock functionality
  const mockBoard: BoardCell[][] = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => ({
      row,
      col,
      tile: row === 0 && col === 0 ? { id: '1', type: 'resource' as const, value: 3, image: '' } :
            row === 1 && col === 2 ? { id: '2', type: 'hazard' as const, value: -2, image: '' } :
            row === 2 && col === 3 ? { id: '3', type: 'dragon' as const, value: 0, image: '' } :
            row === 3 && col === 1 ? { id: '4', type: 'goldmine' as const, value: 0, image: '' } :
            undefined,
      castle: row === 0 && col === 1 ? { rank: 4 as const, color: 'red' as const } :
              row === 1 && col === 3 ? { rank: 3 as const, color: 'blue' as const } :
              undefined,
    }))
  );

  const mockPlayers: Player[] = [
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
      isReady: false,
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

  const mockScores = [
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
    {
      playerId: '3',
      rowScores: [20, 10, 5, -2, 15],
      colScores: [18, 12, -3, 20, 8, 10],
      totalScore: 113,
    },
  ];

  const handleCellClick = (row: number, col: number) => {
    console.log(`Cell clicked: ${row}, ${col}, action: ${selectedAction}`);
    setSelectedAction(null);
  };

  const handlePlaceCastle = () => {
    console.log('Place castle action');
    setShowCastleSelector(true);
    setSelectedAction('castle');
  };

  const handleDrawTile = () => {
    console.log('Draw tile action');
    setSelectedAction('tile');
  };

  const handlePlaySecretTile = () => {
    console.log('Play secret tile action');
    setSelectedAction('tile');
  };

  const handleSelectCastle = (rank: 1 | 2 | 3 | 4) => {
    console.log(`Selected castle rank: ${rank}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-serif font-bold">Kingdoms</h1>
            <EpochTracker currentEpoch={2} />
            <Button 
              onClick={() => setShowScoreDisplay(true)}
              variant="outline"
              data-testid="button-view-scores"
            >
              Ver Puntuación
            </Button>
          </div>
        </Card>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-[1fr_auto_300px] gap-4">
          {/* Players Left Column */}
          <div className="space-y-2 order-2 lg:order-1">
            <h2 className="text-lg font-serif font-semibold mb-2">Jugadores</h2>
            {mockPlayers.map((player, index) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrentPlayer={index === 0}
                isYou={index === 0}
              />
            ))}
          </div>

          {/* Game Board Center */}
          <div className="flex items-start justify-center order-1 lg:order-2">
            <GameBoard
              board={mockBoard}
              onCellClick={handleCellClick}
              highlightedCells={selectedAction ? [{ row: 2, col: 2 }] : []}
              currentPlayerColor="red"
            />
          </div>

          {/* Action Panel Right Column */}
          <div className="order-3">
            <div className="sticky top-4">
              <ActionPanel
                onPlaceCastle={handlePlaceCastle}
                onDrawTile={handleDrawTile}
                onPlaySecretTile={handlePlaySecretTile}
                hasSecretTile={true}
                disabled={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CastleSelector
        open={showCastleSelector}
        onClose={() => setShowCastleSelector(false)}
        castles={mockPlayers[0].castles}
        playerColor={mockPlayers[0].color}
        onSelectCastle={handleSelectCastle}
      />

      <ScoreDisplay
        open={showScoreDisplay}
        onClose={() => setShowScoreDisplay(false)}
        players={mockPlayers}
        epoch={2}
        scores={mockScores}
      />
    </div>
  );
}
