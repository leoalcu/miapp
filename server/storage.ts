import { type User, type InsertUser, GameState, Player, PlayerColor, PLAYER_COLORS } from "@shared/schema";
import { randomUUID } from "crypto";
import { generateRoomCode, initializeGame } from "./game-logic";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game storage methods
  createRoom(hostName: string): Promise<{ roomCode: string; playerId: string; playerColor: PlayerColor }>;
  getRoom(roomCode: string): Promise<GameState | undefined>;
  joinRoom(roomCode: string, playerName: string): Promise<{ playerId: string; playerColor: PlayerColor } | undefined>;
  updateRoom(roomCode: string, gameState: GameState): Promise<void>;
  deleteRoom(roomCode: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rooms: Map<string, GameState>;

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRoom(hostName: string): Promise<{ roomCode: string; playerId: string; playerColor: PlayerColor }> {
    const roomCode = generateRoomCode();
    const playerId = randomUUID();
    const playerColor: PlayerColor = 'red'; // Host always gets red
    
    const hostPlayer: Player = {
      id: playerId,
      name: hostName,
      color: playerColor,
      gold: 50,
      castles: { rank1: 4, rank2: 3, rank3: 2, rank4: 1 },
      isReady: false,
    };
    
    const gameState: GameState = {
      id: randomUUID(),
      roomCode,
      phase: 'lobby',
      epoch: 1,
      currentPlayerIndex: 0,
      players: [hostPlayer],
      board: [],
      tileDeck: [],
      createdAt: Date.now(),
    };
    
    this.rooms.set(roomCode, gameState);
    return { roomCode, playerId, playerColor };
  }

  async getRoom(roomCode: string): Promise<GameState | undefined> {
    return this.rooms.get(roomCode);
  }

  async joinRoom(roomCode: string, playerName: string): Promise<{ playerId: string; playerColor: PlayerColor } | undefined> {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'lobby' || room.players.length >= 4) {
      return undefined;
    }
    
    // Assign next available color
    const usedColors = new Set(room.players.map(p => p.color));
    const availableColor = PLAYER_COLORS.find(c => !usedColors.has(c));
    if (!availableColor) {
      return undefined;
    }
    
    const playerId = randomUUID();
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      color: availableColor,
      gold: 50,
      castles: { rank1: 4, rank2: 3, rank3: 2, rank4: 1 },
      isReady: false,
    };
    
    room.players.push(newPlayer);
    this.rooms.set(roomCode, room);
    
    return { playerId, playerColor: availableColor };
  }

  async updateRoom(roomCode: string, gameState: GameState): Promise<void> {
    this.rooms.set(roomCode, gameState);
  }

  async deleteRoom(roomCode: string): Promise<void> {
    this.rooms.delete(roomCode);
  }
}

export const storage = new MemStorage();
