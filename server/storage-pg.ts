// server/storage-pg.ts
import { GameState } from "@shared/schema";
import { generateRoomCode } from "./game-logic";
import postgres from 'postgres';

const PLAYER_COLORS: Array<"red" | "blue" | "yellow" | "green"> = ["red", "blue", "yellow", "green"];

// Crear conexión directa a PostgreSQL
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida');
}

const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export const storage = {
  async createRoom(playerName: string): Promise<{ roomCode: string; playerId: string; playerColor: "red" | "blue" | "yellow" | "green" }> {
    const roomCode = generateRoomCode();
    const playerId = crypto.randomUUID();
    const playerColor = PLAYER_COLORS[0];

    const gameState: GameState = {
      id: crypto.randomUUID(),
      roomCode,
      phase: "lobby",
      epoch: 1,
      currentPlayerIndex: 0,
      players: [
        {
          id: playerId,
          name: playerName,
          color: playerColor,
          gold: 0,
          castles: { rank1: 0, rank2: 0, rank3: 0, rank4: 0 },
          isReady: false,
        },
      ],
      board: [],
      tileDeck: [],
      gameLog: [],
      createdAt: Date.now(),
    };

    await this.saveRoom(roomCode, gameState);

    return { roomCode, playerId, playerColor };
  },

  async joinRoom(roomCode: string, playerName: string): Promise<{ playerId: string; playerColor: "red" | "blue" | "yellow" | "green" } | null> {
    const room = await this.getRoom(roomCode);
    if (!room || room.phase !== "lobby" || room.players.length >= 4) {
      return null;
    }

    const playerId = crypto.randomUUID();
    const playerColor = PLAYER_COLORS[room.players.length];

    room.players.push({
      id: playerId,
      name: playerName,
      color: playerColor,
      gold: 0,
      castles: { rank1: 0, rank2: 0, rank3: 0, rank4: 0 },
      isReady: false,
    });

    await this.saveRoom(roomCode, room);

    return { playerId, playerColor };
  },

  async getRoom(roomCode: string): Promise<GameState | null> {
    try {
      const result = await sql`
        SELECT game_state FROM game_rooms WHERE room_code = ${roomCode}
      `;

      if (!result || result.length === 0) {
        return null;
      }

      return result[0].game_state as GameState;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  },

  async saveRoom(roomCode: string, gameState: GameState): Promise<void> {
    try {
      await sql`
        INSERT INTO game_rooms (room_code, game_state, updated_at)
        VALUES (${roomCode}, ${JSON.stringify(gameState)}, NOW())
        ON CONFLICT (room_code) 
        DO UPDATE SET 
          game_state = ${JSON.stringify(gameState)},
          updated_at = NOW()
      `;
    } catch (error) {
      console.error('Error saving room:', error);
      throw error;
    }
  },

  async updateRoom(roomCode: string, gameState: GameState): Promise<void> {
    await this.saveRoom(roomCode, gameState);
  },

  async deleteRoom(roomCode: string): Promise<void> {
    try {
      await sql`DELETE FROM game_rooms WHERE room_code = ${roomCode}`;
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  },

  async cleanOldRooms(): Promise<void> {
    try {
      await sql`
        DELETE FROM game_rooms 
        WHERE updated_at < NOW() - INTERVAL '24 hours'
      `;
      console.log('🧹 Cleaned old game rooms');
    } catch (error) {
      console.error('Error cleaning old rooms:', error);
    }
  }
};

// Limpiar partidas viejas cada hora
setInterval(() => {
  storage.cleanOldRooms();
}, 1000 * 60 * 60);