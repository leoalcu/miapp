import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, UserPlus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SaveGameDialogProps {
  open: boolean;
  onClose: () => void;
  gameState: any;
  onGameSaved: () => void;
}

export default function SaveGameDialog({ open, onClose, gameState, onGameSaved }: SaveGameDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSaveGame = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      console.log('Creating game for user:', user.id);

      // 1. Create game (solo con el usuario logueado)
      const createGameResponse = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          playerIds: [user.id],
          variant: 'standard',
        }),
      });

      if (!createGameResponse.ok) {
        const errorData = await createGameResponse.json();
        throw new Error(errorData.error || 'Error al crear partida');
      }

      const { gameId } = await createGameResponse.json();
      console.log('Game created with ID:', gameId);

      // 2. Obtener el oro final del usuario logueado
      // Buscar si algún jugador en la partida tiene un nombre similar al usuario
      const currentPlayerData = gameState.players[0]; // Por simplicidad, tomar el primer jugador
      
      const finalGolds = [{
        userId: user.id,
        finalGold: currentPlayerData.gold,
      }];

      console.log('Finishing game with scores:', finalGolds);

      const finishGameResponse = await fetch(`/api/games/${gameId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ finalGolds }),
      });

      if (!finishGameResponse.ok) {
        const errorData = await finishGameResponse.json();
        throw new Error(errorData.error || 'Error al finalizar partida');
      }

      toast({
        title: "¡Partida guardada!",
        description: "Tu partida se ha guardado en el historial",
      });

      onGameSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving game:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Guardar Partida
            </DialogTitle>
            <DialogDescription>
              Inicia sesión para guardar esta partida
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Crea una cuenta para guardar tu historial y competir en rankings
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/login'} className="flex-1 gap-2">
                <UserPlus className="w-4 h-4" />
                Iniciar Sesión
              </Button>
              <Button onClick={handleSkip} variant="outline">
                Omitir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Guardar Partida
          </DialogTitle>
          <DialogDescription>
            Se guardará la partida en tu cuenta: <strong>{user.displayName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Resultado de la partida:
            </p>
            {gameState.players.map((player: any, index: number) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="text-yellow-600 font-bold">{player.gold} oro</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveGame} disabled={saving} className="flex-1">
              {saving ? "Guardando..." : "Guardar Partida"}
            </Button>
            <Button onClick={handleSkip} variant="outline">
              Omitir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}