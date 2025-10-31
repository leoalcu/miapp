// db/schema.ts
import { pgTable, serial, varchar, timestamp, integer, boolean, text, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabla de usuarios/jugadores
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla de partidas completas (3 épocas)
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
  status: varchar("status", { length: 20 }).default("in_progress").notNull(),
  durationMinutes: integer("duration_minutes"),
  variant: varchar("variant", { length: 50 }).default("standard"),
});

// Tabla de épocas individuales dentro de cada partida
export const epochs = pgTable("epochs", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  epochNumber: integer("epoch_number").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
  boardState: jsonb("board_state"),
});

// Tabla de participación en partidas
export const gamePlayers = pgTable("game_players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  color: varchar("color", { length: 20 }).notNull(),
  finalGold: integer("final_gold").default(0).notNull(),
  finalPosition: integer("final_position"),
  isWinner: boolean("is_winner").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Tabla de resultados por época para cada jugador
export const epochScores = pgTable("epoch_scores", {
  id: serial("id").primaryKey(),
  epochId: integer("epoch_id").notNull().references(() => epochs.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  goldAtStart: integer("gold_at_start").notNull(),
  goldEarned: integer("gold_earned").notNull(),
  goldAtEnd: integer("gold_at_end").notNull(),
  castlesPlaced: integer("castles_placed").default(0),
  rank1Used: integer("rank_1_used").default(0),
  rank2Used: integer("rank_2_used").default(0),
  rank3Used: integer("rank_3_used").default(0),
  rank4Used: integer("rank_4_used").default(0),
});

// Relaciones para consultas fáciles
export const usersRelations = relations(users, ({ many }) => ({
  gamePlayers: many(gamePlayers),
  epochScores: many(epochScores),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  players: many(gamePlayers),
  epochs: many(epochs),
}));

export const gamePlayersRelations = relations(gamePlayers, ({ one }) => ({
  game: one(games, {
    fields: [gamePlayers.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [gamePlayers.userId],
    references: [users.id],
  }),
}));

export const epochsRelations = relations(epochs, ({ one, many }) => ({
  game: one(games, {
    fields: [epochs.gameId],
    references: [games.id],
  }),
  scores: many(epochScores),
}));

export const epochScoresRelations = relations(epochScores, ({ one }) => ({
  epoch: one(epochs, {
    fields: [epochScores.epochId],
    references: [epochs.id],
  }),
  user: one(users, {
    fields: [epochScores.userId],
    references: [users.id],
  }),
}));

// Tipos TypeScript para usar en el código
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GamePlayer = typeof gamePlayers.$inferSelect;
export type NewGamePlayer = typeof gamePlayers.$inferInsert;
export type Epoch = typeof epochs.$inferSelect;
export type NewEpoch = typeof epochs.$inferInsert;
export type EpochScore = typeof epochScores.$inferSelect;
export type NewEpochScore = typeof epochScores.$inferInsert;