import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Castle, Layers, Eye } from "lucide-react";

interface ActionPanelProps {
  onPlaceCastle: () => void;
  onDrawTile: () => void;
  onPlaySecretTile: () => void;
  hasSecretTile: boolean;
  hasDrawnTile?: boolean;
  disabled?: boolean;
}

export default function ActionPanel({ 
  onPlaceCastle, 
  onDrawTile, 
  onPlaySecretTile, 
  hasSecretTile,
  hasDrawnTile = false,
  disabled 
}: ActionPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-serif">Tu Turno</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={onPlaceCastle}
          disabled={disabled || hasDrawnTile}
          className="w-full justify-start gap-2"
          variant="default"
          data-testid="button-place-castle"
        >
          <Castle className="w-4 h-4" />
          Colocar Castillo
        </Button>
        
        <Button
          onClick={onDrawTile}
          disabled={disabled || hasDrawnTile}
          className="w-full justify-start gap-2"
          variant="default"
          data-testid="button-draw-tile"
        >
          <Layers className="w-4 h-4" />
          Robar Ficha
        </Button>
        
        <Button
          onClick={onPlaySecretTile}
          disabled={disabled || !hasSecretTile || hasDrawnTile}
          className="w-full justify-start gap-2"
          variant="secondary"
          data-testid="button-play-secret"
        >
          <Eye className="w-4 h-4" />
          Jugar Ficha Secreta
        </Button>
        
        {hasDrawnTile && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Debes colocar tu ficha robada primero
          </p>
        )}
        
        {!hasSecretTile && !hasDrawnTile && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            No tienes ficha secreta
          </p>
        )}
      </CardContent>
    </Card>
  );
}
