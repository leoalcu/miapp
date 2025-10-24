import { Card } from "@/components/ui/card";
import { Layers } from "lucide-react";

interface TileDeckCounterProps {
  count: number;
}

export default function TileDeckCounter({ count }: TileDeckCounterProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Layers className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium">Fichas Restantes</p>
          <p className="text-2xl font-bold" data-testid="tile-deck-count">{count}</p>
        </div>
      </div>
    </Card>
  );
}
