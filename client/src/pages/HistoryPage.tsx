import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, Clock, Users, Crown } from "lucide-react";
import Navigation from "@/components/Navigation";

interface GameHistory {
  id: number;
  startedAt: string;
  finishedAt: string;
  durationMinutes: number;
  variant: string;
  players: Array<{
    userId: number;
    displayName: string;
    color: string;
    finalGold: number;
    finalPosition: number;
    isWinner: boolean;
  }>;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/games/history', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg text-muted-foreground">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <History className="w-10 h-10 text-primary" />
              Historial de Partidas
            </h1>
            <p className="text-muted-foreground">Últimas 50 partidas completadas</p>
          </div>

          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No hay partidas registradas aún</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((game) => (
                <Card key={game.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Partida #{game.id}</CardTitle>
                      <Badge variant="outline">{game.variant}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(game.finishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {game.durationMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {game.players.length} jugadores
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      {game.players
                        .sort((a, b) => (a.finalPosition || 99) - (b.finalPosition || 99))
                        .map((player) => (
                          <div
                            key={player.userId}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              player.isWinner ? 'bg-primary/5 border-primary' : 'bg-muted/50'
                            } ${user?.id === player.userId ? 'ring-2 ring-primary' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${getColorClass(player.color)}`} />
                              <div>
                                <p className="font-semibold flex items-center gap-2">
                                  {player.displayName}
                                  {player.isWinner && <Crown className="w-4 h-4 text-yellow-500" />}
                                  {user?.id === player.userId && (
                                    <span className="text-xs text-primary">(Tú)</span>
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Posición: {player.finalPosition}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-yellow-600">{player.finalGold}</p>
                              <p className="text-xs text-muted-foreground">oro</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}