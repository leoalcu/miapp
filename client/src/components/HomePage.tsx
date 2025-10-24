import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Castle, Users, Swords } from "lucide-react";

interface HomePageProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (playerName: string, roomCode: string) => void;
}

export default function HomePage({ onCreateRoom, onJoinRoom }: HomePageProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(playerName.trim(), roomCode.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Castle className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-serif font-bold text-foreground">Kingdoms</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Construye castillos, recolecta recursos y domina el reino
          </p>
        </div>

        {/* Main Card */}
        <Card className="max-w-md mx-auto">
          {mode === 'menu' && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-center">Bienvenido</CardTitle>
                <CardDescription className="text-center">
                  Elige cómo quieres jugar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setMode('create')}
                  className="w-full h-16 text-lg gap-3"
                  variant="default"
                  data-testid="button-create-room"
                >
                  <Users className="w-5 h-5" />
                  Crear Nueva Sala
                </Button>
                <Button
                  onClick={() => setMode('join')}
                  className="w-full h-16 text-lg gap-3"
                  variant="outline"
                  data-testid="button-join-room"
                >
                  <Swords className="w-5 h-5" />
                  Unirse a Sala
                </Button>
              </CardContent>
            </>
          )}

          {mode === 'create' && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Crear Sala</CardTitle>
                <CardDescription>
                  Ingresa tu nombre para crear una nueva sala de juego
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Tu Nombre</Label>
                  <Input
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Ej: Juan"
                    maxLength={20}
                    data-testid="input-player-name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setMode('menu')}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-back"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!playerName.trim()}
                    className="flex-1"
                    data-testid="button-confirm-create"
                  >
                    Crear Sala
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {mode === 'join' && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Unirse a Sala</CardTitle>
                <CardDescription>
                  Ingresa tu nombre y el código de la sala
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playerNameJoin">Tu Nombre</Label>
                  <Input
                    id="playerNameJoin"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Ej: María"
                    maxLength={20}
                    data-testid="input-player-name-join"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomCode">Código de Sala</Label>
                  <Input
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Ej: ABC123"
                    maxLength={6}
                    className="text-center text-xl font-mono tracking-wider"
                    data-testid="input-room-code-join"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setMode('menu')}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-back-join"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || !roomCode.trim()}
                    className="flex-1"
                    data-testid="button-confirm-join"
                  >
                    Unirse
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Game Info */}
        <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            Juego de mesa digital para 2-4 jugadores. Coloca castillos estratégicamente,
            recolecta recursos y evita peligros a lo largo de 3 épocas.
          </p>
        </div>
      </div>
    </div>
  );
}
