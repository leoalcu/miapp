import { Player } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Castle, Coins, User, Mountain, Flame, Gem, Sparkles, Eye } from "lucide-react";

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer?: boolean;
  isYou?: boolean;
}

export default function PlayerPanel({ player, isCurrentPlayer, isYou }: PlayerPanelProps) {
  const colorClasses: Record<string, string> = {
    red: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  };

  const colorBadge: Record<string, string> = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  const getTileIcon = (type: string) => {
    switch (type) {
      case 'mountain': return <Mountain className="w-4 h-4" />;
      case 'dragon': return <Flame className="w-4 h-4" />;
      case 'goldmine': return <Gem className="w-4 h-4" />;
      case 'wizard': return <Sparkles className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTileBackground = (type: string) => {
    if (type === 'resource') return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
    if (type === 'hazard') return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    if (type === 'mountain') return 'bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600';
    if (type === 'dragon') return 'bg-orange-100 dark:bg-orange-900/30 border-orange-400 dark:border-orange-700';
    if (type === 'goldmine') return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-700';
    if (type === 'wizard') return 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 dark:border-purple-700';
    return 'bg-card border-border';
  };

  return (
    <Card 
      className={`${isCurrentPlayer ? 'ring-2 ring-primary' : ''} ${colorClasses[player.color] || ''} transition-all`}
      data-testid={`player-panel-${player.id}`}
    >
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-3 h-3 rounded-full ${colorBadge[player.color]}`} data-testid={`player-color-${player.color}`}></div>
            <CardTitle className="text-base font-serif truncate" data-testid={`player-name-${player.name}`}>
              {player.name}
            </CardTitle>
          </div>
          {isYou && (
            <Badge variant="secondary" className="text-xs">Tú</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Gold */}
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-semibold" data-testid={`player-gold-${player.gold}`}>{player.gold}</span>
          <span className="text-xs text-muted-foreground">oro</span>
        </div>

        {/* Castles */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Castle className="w-3 h-3" />
            <span>Castillos:</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-xs">
            {[1, 2, 3, 4].map((rank) => (
              <div 
                key={rank} 
                className="flex items-center gap-1 bg-background rounded px-1 py-0.5"
                data-testid={`castle-count-rank-${rank}`}
              >
                <span className="font-bold">{rank}:</span>
                <span>{player.castles[`rank${rank}` as keyof typeof player.castles]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Secret tile - show full details if it's you, otherwise just indicator */}
        {player.secretTile && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>Ficha secreta</span>
            </div>
            {isYou && player.secretTile.id !== 'hidden' ? (
              <div 
                className={`
                  relative w-full h-16 border-2 rounded-md flex flex-col items-center justify-center
                  ${getTileBackground(player.secretTile.type)}
                `}
                data-testid="secret-tile-display"
              >
                {getTileIcon(player.secretTile.type)}
                {player.secretTile.type !== 'mountain' && (
                  <span 
                    className={`text-sm font-bold ${player.secretTile.value >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
                    data-testid={`secret-tile-value-${player.secretTile.value}`}
                  >
                    {player.secretTile.value > 0 ? '+' : ''}{player.secretTile.value}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full h-12 bg-card-border/50 rounded flex items-center justify-center">
                <div className="w-8 h-8 bg-card-border rounded"></div>
              </div>
            )}
          </div>
        )}

        {/* Ready status */}
        {player.isReady && (
          <Badge variant="default" className="text-xs w-full justify-center">
            Listo
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
