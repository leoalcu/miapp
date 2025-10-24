import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Game types and constants
export type PlayerColor = 'red' | 'yellow' | 'blue' | 'green';
export type TileType = 'resource' | 'hazard' | 'mountain' | 'dragon' | 'goldmine' | 'wizard';
export type GamePhase = 'lobby' | 'playing' | 'scoring' | 'finished';

export const PLAYER_COLORS: PlayerColor[] = ['red', 'yellow', 'blue', 'green'];

// Tile configuration
export interface TileConfig {
  id: string;
  type: TileType;
  value: number;
  image: string;
}

// Castle configuration
export interface Castle {
  rank: 1 | 2 | 3 | 4;
  color: PlayerColor;
}

// Board cell
export interface BoardCell {
  row: number;
  col: number;
  tile?: TileConfig;
  castle?: Castle;
}

// Player state
export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  gold: number;
  castles: {
    rank1: number;
    rank2: number;
    rank3: number;
    rank4: number;
  };
  secretTile?: TileConfig;
  drawnTile?: TileConfig; // Ficha robada pendiente de colocar
  isReady: boolean;
}

// Game state
export interface GameState {
  id: string;
  roomCode: string;
  phase: GamePhase;
  epoch: 1 | 2 | 3;
  currentPlayerIndex: number;
  players: Player[];
  board: BoardCell[][];
  tileDeck: TileConfig[];
  createdAt: number;
}

// Zod schemas for validation
export const playerColorSchema = z.enum(['red', 'yellow', 'blue', 'green']);
export const tileTypeSchema = z.enum(['resource', 'hazard', 'mountain', 'dragon', 'goldmine', 'wizard']);
export const gamePhaseSchema = z.enum(['lobby', 'playing', 'scoring', 'finished']);

export const tileConfigSchema = z.object({
  id: z.string(),
  type: tileTypeSchema,
  value: z.number(),
  image: z.string(),
});

export const castleSchema = z.object({
  rank: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  color: playerColorSchema,
});

export const boardCellSchema = z.object({
  row: z.number(),
  col: z.number(),
  tile: tileConfigSchema.optional(),
  castle: castleSchema.optional(),
});

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: playerColorSchema,
  gold: z.number(),
  castles: z.object({
    rank1: z.number(),
    rank2: z.number(),
    rank3: z.number(),
    rank4: z.number(),
  }),
  secretTile: tileConfigSchema.optional(),
  drawnTile: tileConfigSchema.optional(), // Ficha robada pendiente de colocar
  isReady: z.boolean(),
});

export const gameStateSchema = z.object({
  id: z.string(),
  roomCode: z.string(),
  phase: gamePhaseSchema,
  epoch: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  currentPlayerIndex: z.number(),
  players: z.array(playerSchema),
  board: z.array(z.array(boardCellSchema)),
  tileDeck: z.array(tileConfigSchema),
  createdAt: z.number(),
});

// Action types for game moves
export type GameAction =
  | { type: 'PLACE_CASTLE'; castleRank: 1 | 2 | 3 | 4; row: number; col: number }
  | { type: 'DRAW_TILE' } // Robar una ficha del mazo
  | { type: 'PLACE_DRAWN_TILE'; row: number; col: number } // Colocar la ficha robada
  | { type: 'DRAW_AND_PLACE_TILE'; row: number; col: number } // Mantener para compatibilidad
  | { type: 'PLAY_SECRET_TILE'; row: number; col: number };

// Legacy user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
