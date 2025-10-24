import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { executeAction, applyScoresAndNextEpoch, calculateEpochScores, initializeGame } from "./game-logic";
import { createPlayerView } from "./game-utils";
import { GameAction, GameState } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Create room
    socket.on("create-room", async (data: { playerName: string }, callback) => {
      try {
        const { roomCode, playerId, playerColor } = await storage.createRoom(data.playerName);
        
        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.playerId = playerId;
        
        const room = await storage.getRoom(roomCode);
        
        callback({ 
          success: true, 
          roomCode, 
          playerId, 
          playerColor,
          gameState: room 
        });
        
        // Notify each player with their personalized view
        if (room) {
          for (const player of room.players) {
            const playerSockets = await io.in(roomCode).fetchSockets();
            const playerSocket = playerSockets.find(s => s.data.playerId === player.id);
            if (playerSocket) {
              playerSocket.emit("room-updated", createPlayerView(room, player.id));
            }
          }
        }
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    // Join room
    socket.on("join-room", async (data: { roomCode: string; playerName: string }, callback) => {
      try {
        const result = await storage.joinRoom(data.roomCode, data.playerName);
        
        if (!result) {
          callback({ success: false, error: "Room not found or full" });
          return;
        }
        
        socket.join(data.roomCode);
        socket.data.roomCode = data.roomCode;
        socket.data.playerId = result.playerId;
        
        const room = await storage.getRoom(data.roomCode);
        
        callback({ 
          success: true, 
          roomCode: data.roomCode,
          playerId: result.playerId, 
          playerColor: result.playerColor,
          gameState: createPlayerView(room!, result.playerId)
        });
        
        // Notify each player with their personalized view
        if (room) {
          for (const player of room.players) {
            const playerSockets = await io.in(data.roomCode).fetchSockets();
            const playerSocket = playerSockets.find(s => s.data.playerId === player.id);
            if (playerSocket) {
              playerSocket.emit("room-updated", createPlayerView(room, player.id));
            }
          }
        }
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    // Rejoin room (for reconnection)
    socket.on("rejoin-room", async (data: { roomCode: string; playerId: string }, callback) => {
      try {
        const room = await storage.getRoom(data.roomCode);
        
        if (!room) {
          callback({ success: false, error: "Room not found" });
          return;
        }
        
        const player = room.players.find(p => p.id === data.playerId);
        if (!player) {
          callback({ success: false, error: "Player not found in room" });
          return;
        }
        
        // Rejoin the socket room
        socket.join(data.roomCode);
        socket.data.roomCode = data.roomCode;
        socket.data.playerId = data.playerId;
        
        callback({ 
          success: true, 
          roomCode: data.roomCode,
          playerId: data.playerId, 
          playerColor: player.color,
          gameState: createPlayerView(room, data.playerId)
        });
        
        // Notify all players that someone reconnected
        for (const p of room.players) {
          const playerSockets = await io.in(data.roomCode).fetchSockets();
          const playerSocket = playerSockets.find(s => s.data.playerId === p.id);
          if (playerSocket) {
            playerSocket.emit("room-updated", createPlayerView(room, p.id));
          }
        }
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    // Toggle ready status
    socket.on("toggle-ready", async (callback) => {
      try {
        const roomCode = socket.data.roomCode;
        const playerId = socket.data.playerId;
        
        if (!roomCode || !playerId) {
          callback({ success: false, error: "Not in a room" });
          return;
        }
        
        const room = await storage.getRoom(roomCode);
        if (!room) {
          callback({ success: false, error: "Room not found" });
          return;
        }
        
        const player = room.players.find(p => p.id === playerId);
        if (player) {
          player.isReady = !player.isReady;
        }
        
        await storage.updateRoom(roomCode, room);
        
        callback({ success: true });
        
        // Notify each player with their personalized view
        for (const player of room.players) {
          const playerSockets = await io.in(roomCode).fetchSockets();
          const playerSocket = playerSockets.find(s => s.data.playerId === player.id);
          if (playerSocket) {
            playerSocket.emit("room-updated", createPlayerView(room, player.id));
          }
        }
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    // Start game
    socket.on("start-game", async (callback) => {
      try {
        const roomCode = socket.data.roomCode;
        
        if (!roomCode) {
          callback({ success: false, error: "Not in a room" });
          return;
        }
        
        const room = await storage.getRoom(roomCode);
        if (!room) {
          callback({ success: false, error: "Room not found" });
          return;
        }
        
        // Validate all players are ready and min 2 players
        if (room.players.length < 2) {
          callback({ success: false, error: "Need at least 2 players" });
          return;
        }
        
        if (!room.players.every(p => p.isReady)) {
          callback({ success: false, error: "Not all players are ready" });
          return;
        }
        
        // Initialize game
        const gameState = initializeGame(roomCode, room.players);
        await storage.updateRoom(roomCode, gameState);
        
        callback({ success: true });
        
        // Notify each player with their personalized view
        for (const player of gameState.players) {
          const playerSockets = await io.in(roomCode).fetchSockets();
          const playerSocket = playerSockets.find(s => s.data.playerId === player.id);
          if (playerSocket) {
            playerSocket.emit("game-started", createPlayerView(gameState, player.id));
          }
        }
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    // Execute game action
    socket.on("game-action", async (data: { action: GameAction }, callback) => {
      try {
        const roomCode = socket.data.roomCode;
        const playerId = socket.data.playerId;
        
        if (!roomCode || !playerId) {
          callback({ success: false, error: "Not in a room" });
          return;
        }
        
        const room = await storage.getRoom(roomCode);
        if (!room) {
          callback({ success: false, error: "Room not found" });
          return;
        }
        
        // Execute action
        const newState = executeAction(room, playerId, data.action);
        await storage.updateRoom(roomCode, newState);
        
        callback({ success: true });
        
        // Notify each player with their personalized view
        for (const player of newState.players) {
          const playerSockets = await io.in(roomCode).fetchSockets();
          const playerSocket = playerSockets.find(s => s.data.playerId === player.id);
          if (playerSocket) {
            playerSocket.emit("game-updated", createPlayerView(newState, player.id));
          }
        }
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    // Calculate and apply epoch scores
    socket.on("finish-epoch", async (callback) => {
      try {
        const roomCode = socket.data.roomCode;
        
        if (!roomCode) {
          callback({ success: false, error: "Not in a room" });
          return;
        }
        
        const room = await storage.getRoom(roomCode);
        if (!room) {
          callback({ success: false, error: "Room not found" });
          return;
        }
        
        // Calculate scores
        const scores = calculateEpochScores(room);
        
        // Apply scores and prepare next epoch
        const newState = applyScoresAndNextEpoch(room);
        await storage.updateRoom(roomCode, newState);
        
        callback({ success: true, scores });
        
        // Notify each player with their personalized view
        for (const player of newState.players) {
          const playerSockets = await io.in(roomCode).fetchSockets();
          const playerSocket = playerSockets.find(s => s.data.playerId === player.id);
          if (playerSocket) {
            playerSocket.emit("epoch-finished", { 
              scores, 
              newState: createPlayerView(newState, player.id) 
            });
          }
        }
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    // Abandon game (ends game for all players immediately)
    socket.on("abandon-game", async (callback) => {
      try {
        const roomCode = socket.data.roomCode;
        const playerId = socket.data.playerId;
        
        if (!roomCode) {
          callback({ success: false, error: "Not in a room" });
          return;
        }
        
        const room = await storage.getRoom(roomCode);
        if (!room) {
          callback({ success: false, error: "Room not found" });
          return;
        }
        
        // Set game to finished state
        const abandonedState: GameState = {
          ...room,
          phase: 'finished',
        };
        
        await storage.updateRoom(roomCode, abandonedState);
        
        callback({ success: true });
        
        // Notify all players that the game was abandoned
        const playerSockets = await io.in(roomCode).fetchSockets();
        for (const playerSocket of playerSockets) {
          const socketPlayerId = playerSocket.data.playerId;
          if (socketPlayerId) {
            playerSocket.emit("game-abandoned", {
              abandonedBy: playerId,
              newState: createPlayerView(abandonedState, socketPlayerId)
            });
          }
        }
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // TODO: Handle player disconnect - mark as disconnected but keep in room
      // Could add reconnection logic later
    });
  });

  return httpServer;
}
