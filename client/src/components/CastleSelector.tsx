import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Castle } from "lucide-react";

interface CastleSelectorProps {
  open: boolean;
  onClose: () => void;
  castles: {
    rank1: number;
    rank2: number;
    rank3: number;
    rank4: number;
  };
  playerColor: string;
  onSelectCastle: (rank: 1 | 2 | 3 | 4) => void;
}

export default function CastleSelector({ 
  open, 
  onClose, 
  castles, 
  playerColor,
  onSelectCastle 
}: CastleSelectorProps) {
  const colorClasses: Record<string, string> = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
  };

  const ranks = [
    { rank: 4 as const, count: castles.rank4, label: 'Rango 4 (4 torres)' },
    { rank: 3 as const, count: castles.rank3, label: 'Rango 3 (3 torres)' },
    { rank: 2 as const, count: castles.rank2, label: 'Rango 2 (2 torres)' },
    { rank: 1 as const, count: castles.rank1, label: 'Rango 1 (1 torre)' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Selecciona un Castillo</DialogTitle>
          <DialogDescription>
            Elige el castillo que deseas colocar en el tablero
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-4">
          {ranks.map(({ rank, count, label }) => (
            <Button
              key={rank}
              onClick={() => {
                onSelectCastle(rank);
                onClose();
              }}
              disabled={count === 0}
              className="w-full justify-between gap-4"
              variant="outline"
              data-testid={`select-castle-rank-${rank}`}
            >
              <div className="flex items-center gap-2">
                <div className={`flex flex-col ${colorClasses[playerColor]}`}>
                  {[...Array(rank)].map((_, i) => (
                    <Castle key={i} className="w-4 h-4 -mb-2" />
                  ))}
                </div>
                <span>{label}</span>
              </div>
              <span className="text-muted-foreground">
                {count > 0 ? `x${count}` : 'Agotado'}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
