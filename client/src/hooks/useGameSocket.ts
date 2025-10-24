import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, GameAction, PlayerColor } from '@shared/schema';

interface UseGameSocketResult {
  connected: boolean;
  gameState: GameState | null;
  playerId: string | null;
  playerColor: PlayerColor | null;
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  rejoinRoom: (roomCode: string, playerId: string) => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  executeAction: (action: GameAction) => Promise<void>;
  finishEpoch: () => Promise<{ scores: any[] }>;
  error: string | null;
  clearSession: () => void;
}

export function useGameSocket(): UseGameSocketResult {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      
      // Try to automatically reconnect if we have saved session data
      const savedSession = localStorage.getItem('kingdoms_session');
      if (savedSession) {
        try {
          const { roomCode, playerId } = JSON.parse(savedSession);
          console.log('Attempting automatic reconnection...', { roomCode, playerId });
          
          socket.emit('rejoin-room', { roomCode, playerId }, (response: any) => {
            if (response.success) {
              setPlayerId(response.playerId);
              setPlayerColor(response.playerColor);
              setGameState(response.gameState);
              setError(null);
              console.log('Successfully reconnected!');
            } else {
              console.log('Reconnection failed:', response.error);
              // Clear invalid session data
              localStorage.removeItem('kingdoms_session');
            }
          });
        } catch (err) {
          console.error('Failed to parse session data:', err);
          localStorage.removeItem('kingdoms_session');
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socket.on('room-updated', (updatedState: GameState) => {
      console.log('Room updated', updatedState);
      setGameState(updatedState);
    });

    socket.on('game-started', (newState: GameState) => {
      console.log('Game started', newState);
      setGameState(newState);
    });

    socket.on('game-updated', (newState: GameState) => {
      console.log('Game updated', newState);
      setGameState(newState);
    });

    socket.on('epoch-finished', ({ scores, newState }: { scores: any[]; newState: GameState }) => {
      console.log('Epoch finished', scores, newState);
      setGameState(newState);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback(async (playerName: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('create-room', { playerName }, (response: any) => {
        if (response.success) {
          setPlayerId(response.playerId);
          setPlayerColor(response.playerColor);
          setGameState(response.gameState);
          setError(null);
          
          // Save session data for reconnection
          localStorage.setItem('kingdoms_session', JSON.stringify({
            roomCode: response.roomCode,
            playerId: response.playerId,
          }));
          
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('join-room', { roomCode, playerName }, (response: any) => {
        if (response.success) {
          setPlayerId(response.playerId);
          setPlayerColor(response.playerColor);
          setGameState(response.gameState);
          setError(null);
          
          // Save session data for reconnection
          localStorage.setItem('kingdoms_session', JSON.stringify({
            roomCode: response.roomCode,
            playerId: response.playerId,
          }));
          
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const rejoinRoom = useCallback(async (roomCode: string, playerId: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('rejoin-room', { roomCode, playerId }, (response: any) => {
        if (response.success) {
          setPlayerId(response.playerId);
          setPlayerColor(response.playerColor);
          setGameState(response.gameState);
          setError(null);
          
          // Update session data
          localStorage.setItem('kingdoms_session', JSON.stringify({
            roomCode: response.roomCode,
            playerId: response.playerId,
          }));
          
          resolve();
        } else {
          setError(response.error);
          // Clear invalid session data
          localStorage.removeItem('kingdoms_session');
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const toggleReady = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('toggle-ready', (response: any) => {
        if (response.success) {
          setError(null);
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const startGame = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('start-game', (response: any) => {
        if (response.success) {
          setError(null);
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const executeAction = useCallback(async (action: GameAction) => {
    return new Promise<void>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('game-action', { action }, (response: any) => {
        if (response.success) {
          setError(null);
          resolve();
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const finishEpoch = useCallback(async () => {
    return new Promise<{ scores: any[] }>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('finish-epoch', (response: any) => {
        if (response.success) {
          setError(null);
          resolve({ scores: response.scores });
        } else {
          setError(response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('kingdoms_session');
    setGameState(null);
    setPlayerId(null);
    setPlayerColor(null);
  }, []);

  return {
    connected,
    gameState,
    playerId,
    playerColor,
    createRoom,
    joinRoom,
    rejoinRoom,
    toggleReady,
    startGame,
    executeAction,
    finishEpoch,
    error,
    clearSession,
  };
}
