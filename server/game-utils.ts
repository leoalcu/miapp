import { GameState, Player, TileConfig } from "@shared/schema";

/**
 * Create a player-specific view of the game state
 * Hides other players' secret tiles and the tile deck to prevent cheating
 */
export function createPlayerView(gameState: GameState, playerId: string): GameState {
  const sanitizedState = JSON.parse(JSON.stringify(gameState)) as GameState;
  
  // Remove secret tiles and drawn tiles from all players except the current player
  sanitizedState.players = sanitizedState.players.map(player => {
    if (player.id === playerId) {
      // Keep this player's secret tile and drawn tile
      return player;
    } else {
      // Hide other players' secret tiles and drawn tiles
      return {
        ...player,
        secretTile: player.secretTile ? { 
          id: 'hidden', 
          type: 'resource', 
          value: 0, 
          image: '' 
        } : undefined,
        drawnTile: player.drawnTile ? { 
          id: 'hidden', 
          type: 'resource', 
          value: 0, 
          image: '' 
        } : undefined,
      };
    }
  });
  
  // Hide the tile deck contents - only reveal the deck size
  // Players should not know what tiles are coming up
  const deckSize = sanitizedState.tileDeck.length;
  sanitizedState.tileDeck = Array(deckSize).fill({
    id: 'hidden',
    type: 'resource',
    value: 0,
    image: '',
  }) as TileConfig[];
  
  return sanitizedState;
}

/**
 * Check if a player has a secret tile (without revealing what it is)
 */
export function hasSecretTile(player: Player): boolean {
  return player.secretTile !== undefined;
}
