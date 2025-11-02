// server/routes/games.ts
import { Router } from "express";
import { db } from "../../db";
import { games, gamePlayers, users, epochs, epochScores } from "../../db/schema";
import { eq, desc, and, sql, count, sum } from "drizzle-orm";

const router = Router();

// Crear nueva partida
router.post("/", async (req, res) => {
  try {
    const { playerIds, variant = "standard" } = req.body;

    if (!playerIds || playerIds.length < 1 || playerIds.length > 4) {
      return res.status(400).json({ error: "Debe haber entre 1 y 4 jugadores" });
    }

    const [game] = await db.insert(games).values({ variant }).returning();

    const colors = ["red", "blue", "yellow", "green"];

    const playerPromises = playerIds.map((userId: number, index: number) =>
      db.insert(gamePlayers).values({
        gameId: game.id,
        userId,
        color: colors[index],
      })
    );

    await Promise.all(playerPromises);

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

// Finalizar partida completa
router.post("/:gameId/finish", async (req, res) => {
  try {
    const { gameId } = req.params;
    const { finalGolds } = req.body;

    const finishedAt = new Date();

    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, parseInt(gameId)))
      .limit(1);

    if (!game) {
      return res.status(404).json({ error: "Partida no encontrada" });
    }

    const durationMinutes = Math.round(
      (finishedAt.getTime() - game.startedAt.getTime()) / 60000
    );

    const sortedPlayers = [...finalGolds].sort((a, b) => b.finalGold - a.finalGold);

    let currentPosition = 1;
    let previousGold = sortedPlayers[0]?.finalGold;

    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];
      
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

// Obtener historial completo (SIN requireAuth)
router.get("/history", async (req, res) => {
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

// Ranking general (SIN requireAuth)
router.get("/rankings", async (req, res) => {
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

// Obtener lista de usuarios
router.get("/users", async (req, res) => {
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