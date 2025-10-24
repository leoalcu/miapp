import { GameState, Player, BoardCell, TileConfig, Castle, PlayerColor, GameAction, GameLogEntry } from "@shared/schema";
import { randomUUID } from "crypto";

// Helper function to create a log entry
function createLogEntry(
  gameState: GameState,
  player: Player,
  action: 'PLACE_CASTLE' | 'DRAW_TILE' | 'PLACE_TILE' | 'PLAY_SECRET_TILE' | 'EPOCH_SCORE',
  details: string,
  options?: {
    position?: { row: number; col: number };
    tile?: TileConfig;
    castle?: { rank: 1 | 2 | 3 | 4 };
    scores?: Array<{ playerName: string; playerColor: PlayerColor; gold: number }>;
  }
): GameLogEntry {
  return {
    id: randomUUID(),
    timestamp: Date.now(),
    epoch: gameState.epoch,
    playerName: player.name,
    playerColor: player.color,
    action,
    details,
    ...options,
  };
}

// Create initial tile deck according to official Kingdoms rules
export function createTileDeck(): TileConfig[] {
  const tiles: TileConfig[] = [];
  
  // 12 Resource tiles: 2 of each value from +1 to +6
  for (let value = 1; value <= 6; value++) {
    tiles.push({ id: randomUUID(), type: 'resource', value, image: '' });
    tiles.push({ id: randomUUID(), type: 'resource', value, image: '' });
  }
  
  // 6 Hazard tiles: 1 of each value from -1 to -6
  for (let value = -1; value >= -6; value--) {
    tiles.push({ id: randomUUID(), type: 'hazard', value, image: '' });
  }
  
  // Special tiles: 2 Mountains, 1 Dragon, 1 Gold Mine, 1 Wizard
  tiles.push({ id: randomUUID(), type: 'mountain', value: 0, image: '' });
  tiles.push({ id: randomUUID(), type: 'mountain', value: 0, image: '' });
  tiles.push({ id: randomUUID(), type: 'dragon', value: 0, image: '' });
  tiles.push({ id: randomUUID(), type: 'goldmine', value: 0, image: '' });
  tiles.push({ id: randomUUID(), type: 'wizard', value: 0, image: '' });
  
  // Total: 12 + 6 + 5 = 23 tiles (matching official component list)
  
  // Shuffle using Fisher-Yates algorithm
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  
  return tiles;
}

// Create initial empty board (5 rows x 6 columns)
export function createEmptyBoard(): BoardCell[][] {
  return Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => ({ row, col }))
  );
}

// Get initial castles for a player based on player count
export function getInitialCastles(playerCount: number): Player['castles'] {
  const rank1Count = playerCount === 2 ? 4 : playerCount === 3 ? 3 : 2;
  return {
    rank1: rank1Count,
    rank2: 3,
    rank3: 2,
    rank4: 1,
  };
}

// Initialize game state
export function initializeGame(roomCode: string, players: Player[]): GameState {
  const tileDeck = createTileDeck();
  const board = createEmptyBoard();
  
  // Give each player their secret tile
  const playersWithSecretTiles = players.map(player => ({
    ...player,
    secretTile: tileDeck.pop(),
    drawnTile: undefined,
    gold: 50,
    castles: getInitialCastles(players.length),
  }));
  
  return {
    id: randomUUID(),
    roomCode,
    phase: 'playing',
    epoch: 1,
    currentPlayerIndex: 0,
    players: playersWithSecretTiles,
    board,
    tileDeck,
    gameLog: [],
    lastPlayedTile: undefined,
    createdAt: Date.now(),
  };
}

// Validate if a move is legal
export function isValidMove(
  gameState: GameState,
  playerId: string,
  action: GameAction
): { valid: boolean; error?: string } {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  if (currentPlayer.id !== playerId) {
    return { valid: false, error: 'Not your turn' };
  }
  
  // If player has a drawn tile, they MUST place it before doing anything else
  if (currentPlayer.drawnTile && action.type !== 'PLACE_DRAWN_TILE') {
    return { valid: false, error: 'You must place your drawn tile first' };
  }
  
  // Handle DRAW_TILE action (no position needed)
  if (action.type === 'DRAW_TILE') {
    if (gameState.tileDeck.length === 0) {
      return { valid: false, error: 'No tiles left in deck' };
    }
    if (currentPlayer.drawnTile) {
      return { valid: false, error: 'Already have a drawn tile to place' };
    }
    return { valid: true };
  }
  
  // For actions that require a position
  const targetCell = gameState.board[action.row]?.[action.col];
  if (!targetCell) {
    return { valid: false, error: 'Invalid position' };
  }
  
  if (targetCell.tile || targetCell.castle) {
    return { valid: false, error: 'Cell already occupied' };
  }
  
  // Validate specific action types
  if (action.type === 'PLACE_CASTLE') {
    const castleCount = currentPlayer.castles[`rank${action.castleRank}` as keyof typeof currentPlayer.castles];
    if (castleCount <= 0) {
      return { valid: false, error: 'No castles of this rank available' };
    }
  }
  
  if (action.type === 'PLACE_DRAWN_TILE') {
    if (!currentPlayer.drawnTile) {
      return { valid: false, error: 'No drawn tile to place' };
    }
  }
  
  if (action.type === 'PLAY_SECRET_TILE') {
    if (!currentPlayer.secretTile) {
      return { valid: false, error: 'No secret tile available' };
    }
  }
  
  if (action.type === 'DRAW_AND_PLACE_TILE') {
    if (gameState.tileDeck.length === 0) {
      return { valid: false, error: 'No tiles left in deck' };
    }
  }
  
  return { valid: true };
}

// Execute a game action
export function executeAction(gameState: GameState, playerId: string, action: GameAction): GameState {
  const validation = isValidMove(gameState, playerId, action);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
  const currentPlayerIndex = newState.currentPlayerIndex;
  const currentPlayer = newState.players[currentPlayerIndex];
  
  // Handle DRAW_TILE (doesn't advance turn)
  if (action.type === 'DRAW_TILE') {
    const drawnTile = newState.tileDeck.pop();
    if (drawnTile) {
      currentPlayer.drawnTile = drawnTile;
      // Log the action
      newState.gameLog.push(createLogEntry(
        newState,
        currentPlayer,
        'DRAW_TILE',
        `Robó una ficha del mazo`,
        { tile: drawnTile }
      ));
    }
    // Don't advance turn - player needs to place the tile
    return newState;
  }
  
  if (action.type === 'PLACE_CASTLE') {
    // Place castle on board
    newState.board[action.row][action.col].castle = {
      rank: action.castleRank,
      color: currentPlayer.color,
    };
    
    // Decrease castle count
    currentPlayer.castles[`rank${action.castleRank}` as keyof typeof currentPlayer.castles]--;
    
    // Log the action
    newState.gameLog.push(createLogEntry(
      newState,
      currentPlayer,
      'PLACE_CASTLE',
      `Colocó un castillo de rango ${action.castleRank} en (${action.row}, ${action.col})`,
      {
        position: { row: action.row, col: action.col },
        castle: { rank: action.castleRank }
      }
    ));
  }
  
  if (action.type === 'PLACE_DRAWN_TILE') {
    // Place the previously drawn tile
    if (currentPlayer.drawnTile) {
      const placedTile = currentPlayer.drawnTile;
      newState.board[action.row][action.col].tile = placedTile;
      newState.lastPlayedTile = placedTile;
      currentPlayer.drawnTile = undefined;
      
      // Log the action
      newState.gameLog.push(createLogEntry(
        newState,
        currentPlayer,
        'PLACE_TILE',
        `Colocó una ficha ${placedTile.type} (${placedTile.value > 0 ? '+' : ''}${placedTile.value}) en (${action.row}, ${action.col})`,
        {
          position: { row: action.row, col: action.col },
          tile: placedTile
        }
      ));
    }
  }
  
  if (action.type === 'DRAW_AND_PLACE_TILE') {
    // Draw tile from deck (legacy action - still supported)
    const drawnTile = newState.tileDeck.pop();
    if (drawnTile) {
      newState.board[action.row][action.col].tile = drawnTile;
      newState.lastPlayedTile = drawnTile;
      
      // Log the action
      newState.gameLog.push(createLogEntry(
        newState,
        currentPlayer,
        'PLACE_TILE',
        `Colocó una ficha ${drawnTile.type} (${drawnTile.value > 0 ? '+' : ''}${drawnTile.value}) en (${action.row}, ${action.col})`,
        {
          position: { row: action.row, col: action.col },
          tile: drawnTile
        }
      ));
    }
  }
  
  if (action.type === 'PLAY_SECRET_TILE') {
    // Play secret tile
    if (currentPlayer.secretTile) {
      const secretTile = currentPlayer.secretTile;
      newState.board[action.row][action.col].tile = secretTile;
      newState.lastPlayedTile = secretTile;
      currentPlayer.secretTile = undefined;
      
      // Log the action
      newState.gameLog.push(createLogEntry(
        newState,
        currentPlayer,
        'PLAY_SECRET_TILE',
        `Jugó su ficha secreta ${secretTile.type} (${secretTile.value > 0 ? '+' : ''}${secretTile.value}) en (${action.row}, ${action.col})`,
        {
          position: { row: action.row, col: action.col },
          tile: secretTile
        }
      ));
    }
  }
  
  // Move to next player (except for DRAW_TILE which was handled above)
  newState.currentPlayerIndex = (currentPlayerIndex + 1) % newState.players.length;
  
  // Check if epoch is complete (board is full)
  const isBoardFull = newState.board.every(row =>
    row.every(cell => cell.tile || cell.castle)
  );
  
  if (isBoardFull) {
    newState.phase = 'scoring';
  }
  
  return newState;
}

// Calculate score for a row or column
export function calculateLineScore(
  cells: BoardCell[],
  playerColor: PlayerColor,
  board: BoardCell[][]
): number {
  // Check if there's a mountain that divides the line
  const mountainIndex = cells.findIndex(cell => cell.tile?.type === 'mountain');
  
  if (mountainIndex !== -1) {
    // Split into two segments and calculate separately
    const segment1 = cells.slice(0, mountainIndex);
    const segment2 = cells.slice(mountainIndex + 1);
    return calculateSegmentScore(segment1, playerColor, board) + calculateSegmentScore(segment2, playerColor, board);
  }
  
  return calculateSegmentScore(cells, playerColor, board);
}

function calculateSegmentScore(cells: BoardCell[], playerColor: PlayerColor, board: BoardCell[][]): number {
  // Find all player's castles in this segment
  const playerCastles = cells.filter(cell => cell.castle?.color === playerColor);
  
  if (playerCastles.length === 0) {
    return 0; // No castles = no score
  }
  
  // Calculate total castle rank
  const totalRank = playerCastles.reduce((sum, cell) => {
    let rank = cell.castle!.rank;
    
    // Check if adjacent to wizard (increases rank by 1)
    if (isAdjacentToWizard(cell, board)) {
      rank = Math.min(rank + 1, 4) as 1 | 2 | 3 | 4;
    }
    
    return sum + rank;
  }, 0);
  
  // Check if there's a dragon in this segment
  const hasDragon = cells.some(cell => cell.tile?.type === 'dragon');
  
  // Calculate tile values
  let tileValue = 0;
  for (const cell of cells) {
    if (!cell.tile) continue;
    
    const type = cell.tile.type;
    const value = cell.tile.value;
    
    if (type === 'resource') {
      // Dragon cancels all resource tiles
      tileValue += hasDragon ? 0 : value;
    } else if (type === 'hazard') {
      // Hazards always count
      tileValue += value;
    }
  }
  
  // Check if there's a gold mine (doubles the value)
  const hasGoldMine = cells.some(cell => cell.tile?.type === 'goldmine');
  if (hasGoldMine) {
    tileValue *= 2;
  }
  
  return tileValue * totalRank;
}

function isAdjacentToWizard(cell: BoardCell, board: BoardCell[][]): boolean {
  const { row, col } = cell;
  const adjacentCells = [
    board[row - 1]?.[col], // up
    board[row + 1]?.[col], // down
    board[row]?.[col - 1], // left
    board[row]?.[col + 1], // right
  ];
  
  return adjacentCells.some(adjCell => adjCell?.tile?.type === 'wizard');
}

// Calculate scores for all players
export function calculateEpochScores(gameState: GameState): Array<{
  playerId: string;
  rowScores: number[];
  colScores: number[];
  totalScore: number;
}> {
  const scores = gameState.players.map(player => {
    const rowScores: number[] = [];
    const colScores: number[] = [];
    
    // Calculate row scores
    for (let row = 0; row < 5; row++) {
      const rowCells = gameState.board[row];
      rowScores.push(calculateLineScore(rowCells, player.color, gameState.board));
    }
    
    // Calculate column scores
    for (let col = 0; col < 6; col++) {
      const colCells = gameState.board.map(row => row[col]);
      colScores.push(calculateLineScore(colCells, player.color, gameState.board));
    }
    
    const totalScore = [...rowScores, ...colScores].reduce((sum, s) => sum + s, 0);
    
    return {
      playerId: player.id,
      rowScores,
      colScores,
      totalScore,
    };
  });
  
  return scores;
}

// Apply scores and prepare for next epoch
export function applyScoresAndNextEpoch(gameState: GameState): GameState {
  const scores = calculateEpochScores(gameState);
  const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
  
  // Apply gold to players
  scores.forEach(score => {
    const player = newState.players.find(p => p.id === score.playerId);
    if (player) {
      player.gold += score.totalScore;
    }
  });
  
  // Create score summary for log
  const scoreSummary = newState.players.map(player => ({
    playerName: player.name,
    playerColor: player.color,
    gold: player.gold
  }));
  
  // Log epoch scores
  newState.gameLog.push({
    id: randomUUID(),
    timestamp: Date.now(),
    epoch: newState.epoch,
    playerName: 'Sistema',
    playerColor: 'red' as PlayerColor, // System log, color doesn't matter
    action: 'EPOCH_SCORE',
    details: `Época ${newState.epoch} finalizada`,
    scores: scoreSummary
  });
  
  // Check if game is finished (after epoch 3)
  if (newState.epoch === 3) {
    newState.phase = 'finished';
    return newState;
  }
  
  // Prepare for next epoch
  newState.epoch = (newState.epoch + 1) as 1 | 2 | 3;
  newState.phase = 'playing';
  newState.board = createEmptyBoard();
  
  // Create a new shuffled tile deck for the next epoch
  newState.tileDeck = createTileDeck();
  
  // Return only rank 1 castles to players and give new secret tiles
  newState.players.forEach(player => {
    const playerCount = newState.players.length;
    const rank1Count = playerCount === 2 ? 4 : playerCount === 3 ? 3 : 2;
    player.castles.rank1 = rank1Count;
    player.secretTile = newState.tileDeck.pop();
    player.drawnTile = undefined; // Clear any drawn tiles
  });
  
  // Determine first player for next epoch (highest gold)
  const sortedPlayers = [...newState.players].sort((a, b) => b.gold - a.gold);
  const firstPlayerId = sortedPlayers[0].id;
  newState.currentPlayerIndex = newState.players.findIndex(p => p.id === firstPlayerId);
  
  return newState;
}

// Generate random room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
