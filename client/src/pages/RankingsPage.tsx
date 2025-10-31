import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";

interface RankingData {
  userId: number;
  displayName: string;
  totalGames: number;
  totalWins: number;
  totalGold: number;
  winRate: string;
}

export default function RankingsPage() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/games/rankings', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setRankings(data);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{position}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg text-muted-foreground">Cargando rankings...</p>
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
              <Trophy className="w-10 h-10 text-primary" />
              Rankings
            </h1>
            <p className="text-muted-foreground">Los mejores jugadores de Kingdoms</p>
          </div>

          {rankings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No hay partidas registradas aún</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rankings.map((player, index) => (
                <Card 
                  key={player.userId}
                  className={`${user?.id === player.userId ? 'border-primary border-2' : ''}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getMedalIcon(index + 1)}
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg">
                          {player.displayName}
                          {user?.id === player.userId && (
                            <span className="ml-2 text-xs text-primary">(Tú)</span>
                          )}
                        </h3>
                      </div>

                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold text-primary">{player.totalWins}</p>
                          <p className="text-xs text-muted-foreground">Victorias</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{player.totalGames}</p>
                          <p className="text-xs text-muted-foreground">Partidas</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">{player.totalGold}</p>
                          <p className="text-xs text-muted-foreground">Oro Total</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{player.winRate}%</p>
                          <p className="text-xs text-muted-foreground">% Victoria</p>
                        </div>
                      </div>
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