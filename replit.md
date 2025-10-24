# Kingdoms Digital Board Game

## Overview

Kingdoms is a digital recreation of the physical board game where 2-4 players strategically place castles and tiles on a 5×6 grid to maximize territory scores across three epochs. The application is a real-time multiplayer web game built with React frontend and Express backend, using Socket.IO for live game state synchronization.

The game follows the official Kingdoms rules: players take turns placing castles (ranks 1-4) or drawing/placing tiles (resources, hazards, and special tiles like dragons, wizards, mountains, and gold mines). Scoring occurs at the end of each epoch by evaluating rows and columns, with gold awarded based on castle rank and territory value.

## Recent Enhancements (October 2025)

The following UX improvements were implemented to enhance gameplay experience:

1. **Secret Tile Visibility**: Players can now see their own secret tile with complete information (type, value, icon, background color) in the player panel, while other players see only a generic "hidden" indicator.

2. **Two-Step Tile Drawing**: Tile drawing now uses a deliberate two-phase approach:
   - Players click "Robar Ficha" to draw a tile
   - A modal displays the drawn tile details before placement
   - Players then choose where to place the tile on the board
   - Players cannot perform other actions until the drawn tile is placed

3. **Tile Deck Counter**: A visible counter shows remaining tiles in the deck to all players, updating in real-time as tiles are drawn.

4. **Automatic Reconnection**: Players who disconnect (browser refresh, network interruption) automatically reconnect to their active game using localStorage session persistence. The system validates player identity and restores their game state seamlessly.

5. **Automatic Epoch Ending**: The game now automatically detects when an epoch should end and displays a pulsing "Finalizar Época" (Finish Epoch) button:
   - Appears when the board is completely full (all 30 cells occupied)
   - Appears when no player can make any more moves (no tiles in deck, no castles available, no secret tiles, and no pending drawn tiles)
   - Validates that no player has a pending drawn tile before allowing epoch completion
   - Works in both 'playing' and 'scoring' phases
   - Button text indicates when the board is full

6. **Final Score Display**: After the third epoch completes, players see a comprehensive final scoreboard:
   - Winner highlighted with golden gradient background and crown icon
   - Top 3 players receive medals (gold, silver, bronze)
   - Complete leaderboard showing all players ranked by gold total
   - Game summary statistics (number of epochs, players, score difference)
   - Distinct from the epoch score display used for intermediate scoring

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using functional components and hooks pattern.

**Routing**: Wouter for lightweight client-side routing with three main views:
- Home page (lobby creation/joining)
- Room lobby (player ready-up)
- Game page (active gameplay)

**State Management**: 
- Local component state via `useState` for UI interactions
- Game state managed through custom `useGameSocket` hook that wraps Socket.IO client
- No global state library - all game state comes from server via WebSocket updates

**UI Component Library**: Radix UI primitives with shadcn/ui styling system:
- Provides accessible, unstyled components (Dialog, Card, Button, etc.)
- Custom theming via CSS variables defined in `index.css`
- Tailwind CSS for utility-first styling
- Design follows medieval fantasy aesthetic per `design_guidelines.md`

**Styling Approach**:
- Tailwind CSS with custom configuration extending neutral color palette
- CSS custom properties for theme variables (light/dark mode support)
- Medieval-inspired typography: Cinzel/IM Fell English for headings, Lato/Open Sans for body
- Consistent spacing using Tailwind's scale (2, 4, 6, 8 units)

**Real-time Communication**: Socket.IO client for bidirectional event-based communication with server. All game actions emit events and state updates arrive via socket listeners. Features automatic reconnection using localStorage session persistence (stores roomCode and playerId).

### Backend Architecture

**Framework**: Express.js server with TypeScript, using ES modules.

**Real-time Layer**: Socket.IO server manages:
- Room creation and joining with unique room codes
- Player connection/disconnection handling
- Automatic reconnection via `rejoin-room` event
- Broadcasting game state updates to all players in a room
- Action execution and validation

**Game Logic Layer** (`server/game-logic.ts`):
- Pure functions for game state transformations
- Tile deck creation with official component counts (12 resources, 6 hazards, 5 special)
- Action execution with new two-step tile drawing:
  - `DRAW_TILE`: Draws tile and stores in `player.drawnTile` without advancing turn
  - `PLACE_DRAWN_TILE`: Places the drawn tile and advances turn
  - `PLACE_CASTLE`: Places a castle of specified rank
  - `PLAY_SECRET_TILE`: Plays the player's secret tile
  - Legacy `DRAW_AND_PLACE_TILE`: Backward compatibility (single-step draw+place)
- Scoring calculation for rows/columns at epoch end
- Game initialization and turn management
- Rule enforcement: blocks all actions except PLACE_DRAWN_TILE when player has pending drawn tile

**Data Sanitization** (`server/game-utils.ts`):
- Creates player-specific views of game state via `createPlayerView()`
- Hides other players' secret tiles (shows placeholder with id='hidden')
- Hides other players' drawn tiles (shows placeholder with id='hidden')
- Obfuscates tile deck contents while preserving deck size
- Prevents information leakage that could give unfair advantage

**Storage Layer** (`server/storage.ts`):
- In-memory storage using Map data structures
- Implements `IStorage` interface for potential database swap
- Manages users, rooms, and game states
- No persistence - games exist only while server runs

**Session Management**: Not currently implemented (no authentication required for MVP).

### Data Storage Solutions

**Current Implementation**: In-memory storage via JavaScript `Map` objects:
- Users stored by ID
- Rooms stored by room code
- All data volatile (lost on server restart)

**Database Configuration**: Drizzle ORM configured for PostgreSQL but not actively used:
- Schema defined in `shared/schema.ts` with user table structure
- Neon serverless Postgres client dependency present
- Migration setup exists but optional for current implementation
- Could be activated by adding database integration to storage layer

**Rationale**: In-memory storage chosen for:
- Simplicity in MVP development
- Fast read/write for real-time game state
- No complex data persistence requirements
- Easy testing and development

**Future Consideration**: Database could be added for:
- User account persistence
- Game history/statistics
- Leaderboards
- Enhanced reconnection with longer session persistence (currently uses localStorage with in-memory validation)

### Authentication and Authorization

**Current State**: No authentication implemented. Players are identified by:
- Randomly generated UUIDs assigned on room creation/joining
- Room codes (6-character uppercase strings) for access control
- Socket connection IDs for session tracking

**Authorization Logic**:
- Room host (first player) has exclusive `startGame` permission
- Turn-based authorization: only current player can execute actions
- Player-specific views prevent information leakage

**Rationale**: Authentication omitted because:
- Casual multiplayer game doesn't require accounts
- Room codes provide sufficient access control
- Anonymous play reduces friction for quick games

## External Dependencies

### Third-Party Services

None currently integrated. The application runs entirely self-contained.

### APIs

No external API integrations. All game logic runs server-side.

### Database

**Configured but Unused**: PostgreSQL via Neon serverless:
- Connection string expected in `DATABASE_URL` environment variable
- Drizzle ORM ready for activation
- Schema includes basic user table structure
- Not required for current functionality

### Key NPM Packages

**Frontend Core**:
- `react`, `react-dom` - UI framework
- `wouter` - Routing
- `socket.io-client` - WebSocket client
- `@tanstack/react-query` - Data fetching (currently minimal use)

**UI Components**:
- `@radix-ui/*` - Accessible component primitives (20+ packages)
- `tailwindcss` - Utility CSS framework
- `class-variance-authority`, `clsx`, `tailwind-merge` - Styling utilities
- `lucide-react` - Icon library

**Backend Core**:
- `express` - HTTP server
- `socket.io` - WebSocket server
- `drizzle-orm`, `@neondatabase/serverless` - Database layer (configured, not active)

**Development**:
- `vite` - Build tool and dev server
- `typescript` - Type safety
- `tsx` - TypeScript execution
- `esbuild` - Server bundling for production

**Build Strategy**: Vite bundles client code, esbuild bundles server code separately. Production serves static assets from Express with SSR-like template injection.