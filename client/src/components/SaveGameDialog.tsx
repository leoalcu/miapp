import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRegisteredUsers } from "@/hooks/useRegisteredUsers";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  const { users, loading: loadingUsers } = useRegisteredUsers();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [playerUserMapping, setPlayerUserMapping] = useState<Record<string, number>>({});

  // Auto-map logged in user to their game player
  useEffect(() => {
    if (user && gameState?.players && open) {
      // Try to find if any player matches the logged in user
      setPlayerUserMapping({});
    }
  }, [user, gameState, open]);

  const handleSaveGame = async () => {
    setSaving(true);

    try {
      // Get mapped user IDs (remove duplicates and zeros)
      const mappedUserIds = Array.from(
        new Set(Object.values(playerUserMapping).filter(id => id > 0))
      );

      if (mappedUserIds.length === 0) {
        toast({
          title: "Vincula al menos un jugador",
          description: "Debes vincular al menos un jugador con una cuenta registrada",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      console.log('Creating game with players:', mappedUserIds);

      // 1. Create game
      const createGameResponse = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          playerIds: mappedUserIds,
          variant: 'standard',
        }),
      });

      if (!createGameResponse.ok) {
        const errorData = await createGameResponse.json();
        throw new Error(errorData.error || 'Error al crear partida');
      }

      const { gameId } = await createGameResponse.json();
      console.log('Game created with ID:', gameId);

      // 2. Finish game with final scores
      const finalGolds = gameState.players
        .filter((player: any) => playerUserMapping[player.id])
        .map((player: any) => ({
          userId: playerUserMapping[player.id],
          finalGold: player.gold,
        }));

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
        description: "La partida se ha guardado en el historial",
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
    toast({
      title: "Partida no guardada",
      description: "Puedes iniciar sesión más tarde para guardar futuras partidas",
    });
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
              Inicia sesión para guardar esta partida y ver tus estadísticas
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Guardar Partida
          </DialogTitle>
          <DialogDescription>
            Vincula los jugadores con cuentas registradas para guardar sus resultados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Solo se guardarán las estadísticas de jugadores vinculados a una cuenta
            </AlertDescription>
          </Alert>

          {loadingUsers ? (
            <div className="text-center py-4">Cargando usuarios...</div>
          ) : (
            <div className="space-y-4">
              {gameState.players.map((player: any) => (
                <div key={player.id} className="flex items-center gap-4">
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: player.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.gold} oro</p>
                  </div>
                  <Select
                    value={playerUserMapping[player.id]?.toString() || "0"}
                    onValueChange={(value) => {
                      setPlayerUserMapping(prev => ({
                        ...prev,
                        [player.id]: parseInt(value),
                      }));
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sin vincular" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sin vincular</SelectItem>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveGame} disabled={saving || loadingUsers} className="flex-1">
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