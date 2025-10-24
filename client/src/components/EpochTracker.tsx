import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EpochTrackerProps {
  currentEpoch: 1 | 2 | 3;
}

export default function EpochTracker({ currentEpoch }: EpochTrackerProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-center gap-4">
        <span className="text-sm font-serif font-semibold text-muted-foreground">Época:</span>
        <div className="flex gap-2">
          {[1, 2, 3].map((epoch) => (
            <Badge
              key={epoch}
              variant={currentEpoch === epoch ? 'default' : 'outline'}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-serif ${
                currentEpoch === epoch ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              data-testid={`epoch-${epoch}`}
            >
              {epoch}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
