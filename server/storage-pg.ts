// server/storage-pg.ts
import { GameState, Player } from "@shared/schema";
import { generateRoomCode } from "./game-logic";
import { db } from "../db";
import { sql } from "drizzle-orm";

const PLAYER_COLORS: Array<"red" | "blue" | "yellow" | "green"> = ["red", "blue", "yellow", "green"];

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
      const result = await db.execute(
        sql`SELECT game_state FROM game_rooms WHERE room_code = ${roomCode}`
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].game_state as GameState;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  },

  async saveRoom(roomCode: string, gameState: GameState): Promise<void> {
    try {
      await db.execute(
        sql`
          INSERT INTO game_rooms (room_code, game_state, updated_at)
          VALUES (${roomCode}, ${JSON.stringify(gameState)}::jsonb, NOW())
          ON CONFLICT (room_code) 
          DO UPDATE SET 
            game_state = ${JSON.stringify(gameState)}::jsonb,
            updated_at = NOW()
        `
      );
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
      await db.execute(
        sql`DELETE FROM game_rooms WHERE room_code = ${roomCode}`
      );
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  },

  // Limpiar partidas viejas (más de 24 horas sin actualizar)
  async cleanOldRooms(): Promise<void> {
    try {
      await db.execute(
        sql`
          DELETE FROM game_rooms 
          WHERE updated_at < NOW() - INTERVAL '24 hours'
        `
      );
    } catch (error) {
      console.error('Error cleaning old rooms:', error);
    }
  }
};

// Limpiar partidas viejas cada hora
setInterval(() => {
  storage.cleanOldRooms();
}, 1000 * 60 * 60);