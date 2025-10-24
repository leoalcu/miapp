import { Card } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { TileConfig } from "@shared/schema";
import { getTileIcon, getTileColor } from "@/lib/tileUtils";

interface TileDeckCounterProps {
  count: number;
  lastPlayedTile?: TileConfig;
}

export default function TileDeckCounter({ count, lastPlayedTile }: TileDeckCounterProps) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">Fichas Restantes</p>
            <p className="text-2xl font-bold" data-testid="tile-deck-count">{count}</p>
          </div>
        </div>
        
        {lastPlayedTile && (
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground font-medium mb-2">Última Ficha Jugada</p>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 flex items-center justify-center rounded border-2 text-xl ${getTileColor(lastPlayedTile.type)}`} data-testid="last-played-tile">
                {getTileIcon(lastPlayedTile.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold capitalize">{lastPlayedTile.type}</p>
                {lastPlayedTile.type !== 'mountain' && (
                  <p className={`text-sm font-mono ${lastPlayedTile.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {lastPlayedTile.value > 0 ? '+' : ''}{lastPlayedTile.value}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
