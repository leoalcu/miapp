import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Player } from "@shared/schema";
import { Trophy, Medal, Coins, Crown } from "lucide-react";

interface FinalScoreDisplayProps {
  open: boolean;
  onClose: () => void;
  players: Player[];
}

export default function FinalScoreDisplay({ open, onClose, players }: FinalScoreDisplayProps) {
  const colorBadge: Record<string, string> = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  const sortedPlayers = [...players].sort((a, b) => b.gold - a.gold);
  const winner = sortedPlayers[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif text-center flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            ¡Juego Terminado!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Winner Highlight */}
          <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/50">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-2xl font-serif font-bold">Ganador</h2>
                  <Crown className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-6 h-6 rounded-full ${colorBadge[winner.color]}`}></div>
                  <span className="text-3xl font-bold">{winner.name}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-yellow-600">
                  <Coins className="w-6 h-6" />
                  <span className="text-4xl font-bold">{winner.gold}</span>
                  <span className="text-xl">oro</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Leaderboard */}
          <div className="space-y-2">
            <h3 className="text-lg font-serif font-semibold flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              Clasificación Final
            </h3>
            {sortedPlayers.map((player, index) => {
              const position = index + 1;
              const getMedalIcon = () => {
                if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
                if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
                if (position === 3) return <Medal className="w-5 h-5 text-amber-600" />;
                return null;
              };

              return (
                <Card 
                  key={player.id}
                  className={position === 1 ? 'border-yellow-500/50' : ''}
                  data-testid={`final-score-player-${player.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center">
                          {getMedalIcon() || (
                            <span className="text-xl font-bold text-muted-foreground">
                              #{position}
                            </span>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded-full ${colorBadge[player.color]}`}></div>
                        <span className={`font-semibold ${position === 1 ? 'text-lg' : ''}`}>
                          {player.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-600" />
                        <span 
                          className={`font-bold ${position === 1 ? 'text-2xl' : 'text-xl'}`}
                          data-testid={`final-score-gold-${player.gold}`}
                        >
                          {player.gold}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Game Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Épocas</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jugadores</p>
                  <p className="text-2xl font-bold">{players.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diferencia</p>
                  <p className="text-2xl font-bold">
                    {sortedPlayers[0].gold - (sortedPlayers[1]?.gold || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
