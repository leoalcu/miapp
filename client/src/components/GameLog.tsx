import { GameLogEntry, PlayerColor } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Castle, Scroll, Swords } from "lucide-react";
import { getTileIcon, getTileColor } from "@/lib/tileUtils";

interface GameLogProps {
  gameLog: GameLogEntry[];
}

const playerColorClasses: Record<PlayerColor, string> = {
  red: "text-red-600 dark:text-red-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function GameLog({ gameLog }: GameLogProps) {
  // Display logs in reverse chronological order (most recent first)
  const reversedLog = [...gameLog].reverse();

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Scroll className="w-5 h-5" />
        <h3 className="font-serif font-bold text-lg">Historial de Jugadas</h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {reversedLog.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay jugadas registradas
            </p>
          ) : (
            reversedLog.map((entry) => (
              <div
                key={entry.id}
                className="text-sm border-l-2 pl-3 py-2 hover-elevate rounded"
                style={{
                  borderLeftColor: entry.action === 'EPOCH_SCORE' 
                    ? 'var(--primary)' 
                    : `var(--${entry.playerColor})`,
                }}
                data-testid={`log-entry-${entry.id}`}
              >
                {entry.action === 'EPOCH_SCORE' ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span>Época {entry.epoch} Finalizada</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(entry.timestamp)}
                    </div>
                    {entry.scores && (
                      <div className="mt-2 space-y-1">
                        {entry.scores.map((score, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className={playerColorClasses[score.playerColor]}>
                              {score.playerName}
                            </span>
                            <span className="font-mono font-semibold">
                              {score.gold} 🪙
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {entry.action === 'PLACE_CASTLE' && (
                        <Castle className="w-4 h-4" />
                      )}
                      {(entry.action === 'PLACE_TILE' || entry.action === 'PLAY_SECRET_TILE') && entry.tile && (
                        <div 
                          className={`w-4 h-4 flex items-center justify-center rounded text-xs ${getTileColor(entry.tile.type)}`}
                        >
                          {getTileIcon(entry.tile.type)}
                        </div>
                      )}
                      {entry.action === 'DRAW_TILE' && (
                        <Swords className="w-4 h-4" />
                      )}
                      <span className={`font-semibold ${playerColorClasses[entry.playerColor]}`}>
                        {entry.playerName}
                      </span>
                    </div>
                    <div className="text-xs">
                      {entry.details}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Época {entry.epoch} • {formatTime(entry.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
