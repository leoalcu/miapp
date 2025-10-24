import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Users, Crown } from "lucide-react";
import { Player } from "@shared/schema";

interface RoomLobbyProps {
  roomCode: string;
  players: Player[];
  isHost?: boolean;
  onStartGame: () => void;
  onToggleReady: () => void;
  currentPlayerId: string;
}

export default function RoomLobby({ 
  roomCode, 
  players, 
  isHost, 
  onStartGame, 
  onToggleReady,
  currentPlayerId 
}: RoomLobbyProps) {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    console.log('Room code copied!');
  };

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const allReady = players.length >= 2 && players.every(p => p.isReady);

  const colorBadge: Record<string, string> = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-center">Sala de Juego</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Code */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Código de Sala</label>
            <div className="flex gap-2">
              <Input
                value={roomCode}
                readOnly
                className="text-center text-2xl font-mono font-bold tracking-wider"
                data-testid="input-room-code"
              />
              <Button
                onClick={copyRoomCode}
                variant="outline"
                size="icon"
                data-testid="button-copy-code"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Comparte este código con tus amigos para que se unan
            </p>
          </div>

          {/* Players List */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <label className="text-sm font-semibold">
                Jugadores ({players.length}/4)
              </label>
            </div>
            <div className="grid gap-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg border border-card-border"
                  data-testid={`lobby-player-${player.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${colorBadge[player.color]}`}></div>
                    <span className="font-semibold">{player.name}</span>
                    {player.id === players[0].id && (
                      <Crown className="w-4 h-4 text-primary" data-testid="icon-host" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    {player.isReady && (
                      <Badge variant="default">Listo</Badge>
                    )}
                    {player.id === currentPlayerId && (
                      <Badge variant="secondary">Tú</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={onToggleReady}
              variant={currentPlayer?.isReady ? 'outline' : 'default'}
              className="w-full"
              data-testid="button-toggle-ready"
            >
              {currentPlayer?.isReady ? 'Cancelar' : 'Estoy Listo'}
            </Button>

            {isHost && (
              <Button
                onClick={onStartGame}
                disabled={!allReady}
                className="w-full"
                data-testid="button-start-game"
              >
                Iniciar Juego
              </Button>
            )}

            {isHost && !allReady && (
              <p className="text-xs text-muted-foreground text-center">
                Esperando a que todos los jugadores estén listos
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
