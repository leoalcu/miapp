import { TileConfig } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mountain, Flame, Gem, Sparkles } from "lucide-react";

interface DrawnTileDialogProps {
  open: boolean;
  tile: TileConfig | null;
  onClose: () => void;
  onPlaceTile: () => void;
}

export default function DrawnTileDialog({ open, tile, onClose, onPlaceTile }: DrawnTileDialogProps) {
  if (!tile) return null;

  const getTileIcon = (type: string) => {
    switch (type) {
      case 'mountain': return <Mountain className="w-8 h-8" />;
      case 'dragon': return <Flame className="w-8 h-8" />;
      case 'goldmine': return <Gem className="w-8 h-8" />;
      case 'wizard': return <Sparkles className="w-8 h-8" />;
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

  const getTileTypeName = (type: string) => {
    const names: Record<string, string> = {
      resource: 'Recurso',
      hazard: 'Peligro',
      mountain: 'Montaña',
      dragon: 'Dragón',
      goldmine: 'Mina de Oro',
      wizard: 'Mago',
    };
    return names[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Ficha Robada</DialogTitle>
          <DialogDescription>
            Has robado esta ficha. Ahora elige dónde colocarla en el tablero.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Tile display */}
          <div 
            className={`
              w-32 h-32 border-4 rounded-lg flex flex-col items-center justify-center
              ${getTileBackground(tile.type)}
            `}
            data-testid="drawn-tile-preview"
          >
            {getTileIcon(tile.type)}
            {tile.type !== 'mountain' && (
              <span 
                className={`text-2xl font-bold mt-2 ${tile.value >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
                data-testid={`drawn-tile-value-${tile.value}`}
              >
                {tile.value > 0 ? '+' : ''}{tile.value}
              </span>
            )}
          </div>

          {/* Tile type name */}
          <div className="text-center">
            <p className="text-lg font-semibold">{getTileTypeName(tile.type)}</p>
            {tile.type !== 'mountain' && (
              <p className="text-sm text-muted-foreground">
                Valor: {tile.value > 0 ? '+' : ''}{tile.value}
              </p>
            )}
          </div>

          {/* Action button */}
          <Button 
            onClick={onPlaceTile}
            className="w-full"
            size="lg"
            data-testid="button-place-drawn-tile"
          >
            Colocar Ficha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
