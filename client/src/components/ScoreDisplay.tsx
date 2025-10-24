import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@shared/schema";
import { Trophy, Coins } from "lucide-react";

interface ScoreDisplayProps {
  open: boolean;
  onClose: () => void;
  players: Player[];
  epoch: number;
  scores: Array<{
    playerId: string;
    rowScores: number[];
    colScores: number[];
    totalScore: number;
  }>;
}

export default function ScoreDisplay({ open, onClose, players, epoch, scores }: ScoreDisplayProps) {
  const colorBadge: Record<string, string> = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  const sortedPlayers = [...players].sort((a, b) => b.gold - a.gold);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-center">
            Puntuación - Época {epoch}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Clasificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-card-border"
                    data-testid={`score-player-${player.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${colorBadge[player.color]}`}></div>
                      <span className="font-semibold">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="text-xl font-bold" data-testid={`score-gold-${player.gold}`}>
                        {player.gold}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          {scores.map((score) => {
            const player = players.find(p => p.id === score.playerId);
            if (!player) return null;

            return (
              <Card key={score.playerId}>
                <CardHeader>
                  <CardTitle className="text-base font-serif flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colorBadge[player.color]}`}></div>
                    {player.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Filas:</p>
                      <div className="space-y-1">
                        {score.rowScores.map((s, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>Fila {i + 1}:</span>
                            <span className={s >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {s > 0 ? '+' : ''}{s}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Columnas:</p>
                      <div className="space-y-1">
                        {score.colScores.map((s, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>Col {i + 1}:</span>
                            <span className={s >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {s > 0 ? '+' : ''}{s}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <span className="font-semibold">Total de Época:</span>
                    <span className="text-xl font-bold text-primary">
                      +{score.totalScore}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
