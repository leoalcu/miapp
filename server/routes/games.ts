// server/routes/games.ts
import { Router } from "express";
import { db } from "../../db";
import { games, gamePlayers, users, epochs, epochScores } from "../../db/schema";
import { eq, desc, and, sql, count, sum } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

// Crear nueva partida
router.post("/", requireAuth, async (req, res) => {
  try {
    const { playerIds, variant = "standard" } = req.body; // Array de IDs de jugadores y variante

    if (!playerIds || playerIds.length < 2 || playerIds.length > 4) {
      return res.status(400).json({ error: "Debe haber entre 2 y 4 jugadores" });
    }

    // Crear la partida
    const [game] = await db.insert(games).values({ variant }).returning();

    // Colores disponibles
    const colors = ["red", "blue", "yellow", "green"];

    // Agregar jugadores a la partida
    const playerPromises = playerIds.map((userId: number, index: number) =>
      db.insert(gamePlayers).values({
        gameId: game.id,
        userId,
        color: colors[index],
      })
    );

    await Promise.all(playerPromises);

    // Crear la primera época
    await db.insert(epochs).values({
      gameId: game.id,
      epochNumber: 1,
    });

    res.json({ gameId: game.id, message: "Partida creada exitosamente" });
  } catch (error) {
    console.error("Error al crear partida:", error);
    res.status(500).json({ error: "Error al crear partida" });
  }
});

// Finalizar una época y registrar resultados
router.post("/:gameId/epoch/:epochNumber/finish", requireAuth, async (req, res) => {
  try {
    const { gameId, epochNumber } = req.params;
    const { playerScores } = req.body; 
    // playerScores: [{ userId, goldAtStart, goldEarned, goldAtEnd, castlesPlaced, rank1Used, rank2Used, rank3Used, rank4Used }]

    const finishedAt = new Date();

    // Buscar la época
    const [epoch] = await db
      .select()
      .from(epochs)
      .where(
        and(
          eq(epochs.gameId, parseInt(gameId)),
          eq(epochs.epochNumber, parseInt(epochNumber))
        )
      )
      .limit(1);

    if (!epoch) {
      return res.status(404).json({ error: "Época no encontrada" });
    }

    // Actualizar época como finalizada
    await db
      .update(epochs)
      .set({ finishedAt })
      .where(eq(epochs.id, epoch.id));

    // Guardar scores de cada jugador
    for (const score of playerScores) {
      await db.insert(epochScores).values({
        epochId: epoch.id,
        userId: score.userId,
        goldAtStart: score.goldAtStart,
        goldEarned: score.goldEarned,
        goldAtEnd: score.goldAtEnd,
        castlesPlaced: score.castlesPlaced || 0,
        rank1Used: score.rank1Used || 0,
        rank2Used: score.rank2Used || 0,
        rank3Used: score.rank3Used || 0,
        rank4Used: score.rank4Used || 0,
      });
    }

    // Si es la tercera época, crear la siguiente
    if (parseInt(epochNumber) < 3) {
      await db.insert(epochs).values({
        gameId: parseInt(gameId),
        epochNumber: parseInt(epochNumber) + 1,
      });
    }

    res.json({ message: "Época finalizada exitosamente" });
  } catch (error) {
    console.error("Error al finalizar época:", error);
    res.status(500).json({ error: "Error al finalizar época" });
  }
});

// Finalizar partida completa
router.post("/:gameId/finish", requireAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { finalGolds } = req.body; // [{ userId, finalGold }]

    const finishedAt = new Date();

    // Obtener la partida
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, parseInt(gameId)))
      .limit(1);

    if (!game) {
      return res.status(404).json({ error: "Partida no encontrada" });
    }

    // Calcular duración
    const durationMinutes = Math.round(
      (finishedAt.getTime() - game.startedAt.getTime()) / 60000
    );

    // Ordenar jugadores por oro final (mayor a menor)
    const sortedPlayers = [...finalGolds].sort((a, b) => b.finalGold - a.finalGold);

    // Actualizar cada jugador con su posición y oro final
    let currentPosition = 1;
    let previousGold = sortedPlayers[0]?.finalGold;

    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];

      // Si tiene el mismo oro que el anterior, mantiene la posición (empate)
      if (i > 0 && player.finalGold !== previousGold) {
        currentPosition = i + 1;
      }

      const isWinner = currentPosition === 1;

      await db
        .update(gamePlayers)
        .set({
          finalGold: player.finalGold,
          finalPosition: currentPosition,
          isWinner,
        })
        .where(
          and(
            eq(gamePlayers.gameId, parseInt(gameId)),
            eq(gamePlayers.userId, player.userId)
          )
        );

      previousGold = player.finalGold;
    }

    // Actualizar la partida
    await db
      .update(games)
      .set({
        finishedAt,
        durationMinutes,
        status: "finished",
      })
      .where(eq(games.id, parseInt(gameId)));

    res.json({ 
      message: "Partida finalizada", 
      winners: sortedPlayers.filter(p => p.finalGold === sortedPlayers[0].finalGold) 
    });
  } catch (error) {
    console.error("Error al finalizar partida:", error);
    res.status(500).json({ error: "Error al finalizar partida" });
  }
});

// Obtener historial completo de partidas
router.get("/history", requireAuth, async (req, res) => {
  try {
    const allGames = await db
      .select({
        id: games.id,
        startedAt: games.startedAt,
        finishedAt: games.finishedAt,
        durationMinutes: games.durationMinutes,
        status: games.status,
        variant: games.variant,
      })
      .from(games)
      .where(eq(games.status, "finished"))
      .orderBy(desc(games.finishedAt))
      .limit(50);

    // Obtener jugadores de cada partida
    const gamesWithPlayers = await Promise.all(
      allGames.map(async (game) => {
        const players = await db
          .select({
            userId: gamePlayers.userId,
            displayName: users.displayName,
            color: gamePlayers.color,
            finalGold: gamePlayers.finalGold,
            finalPosition: gamePlayers.finalPosition,
            isWinner: gamePlayers.isWinner,
          })
          .from(gamePlayers)
          .innerJoin(users, eq(gamePlayers.userId, users.id))
          .where(eq(gamePlayers.gameId, game.id))
          .orderBy(gamePlayers.finalPosition);

        return { ...game, players };
      })
    );

    res.json(gamesWithPlayers);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// Ranking general
router.get("/rankings", requireAuth, async (req, res) => {
  try {
    const rankings = await db
      .select({
        userId: users.id,
        displayName: users.displayName,
        totalGames: count(gamePlayers.id),
        totalWins: sum(sql<number>`CASE WHEN ${gamePlayers.isWinner} THEN 1 ELSE 0 END`),
        totalGold: sum(gamePlayers.finalGold),
      })
      .from(users)
      .leftJoin(gamePlayers, eq(users.id, gamePlayers.userId))
      .leftJoin(games, and(
        eq(gamePlayers.gameId, games.id),
        eq(games.status, "finished")
      ))
      .groupBy(users.id, users.displayName)
      .orderBy(desc(sum(sql<number>`CASE WHEN ${gamePlayers.isWinner} THEN 1 ELSE 0 END`)));

    const rankingsWithStats = rankings.map((player) => ({
      ...player,
      totalGames: Number(player.totalGames) || 0,
      totalWins: Number(player.totalWins) || 0,
      totalGold: Number(player.totalGold) || 0,
      winRate: player.totalGames > 0 
        ? ((Number(player.totalWins) / Number(player.totalGames)) * 100).toFixed(1)
        : "0.0",
    }));

    res.json(rankingsWithStats);
  } catch (error) {
    console.error("Error al obtener rankings:", error);
    res.status(500).json({ error: "Error al obtener rankings" });
  }
});

// Obtener lista de usuarios para seleccionar jugadores
router.get("/users", requireAuth, async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      })
      .from(users)
      .orderBy(users.displayName);

    res.json(allUsers);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

export default router;