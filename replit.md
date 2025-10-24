# Kingdoms Digital Board Game

## Overview

Kingdoms is a digital recreation of the physical board game where 2-4 players strategically place castles and tiles on a 5×6 grid to maximize territory scores across three epochs. The application is a real-time multiplayer web game built with React frontend and Express backend, using Socket.IO for live game state synchronization.

The game follows the official Kingdoms rules: players take turns placing castles (ranks 1-4) or drawing/placing tiles (resources, hazards, and special tiles like dragons, wizards, mountains, and gold mines). Scoring occurs at the end of each epoch by evaluating rows and columns, with gold awarded based on castle rank and territory value.

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

**Real-time Communication**: Socket.IO client for bidirectional event-based communication with server. All game actions emit events and state updates arrive via socket listeners.

### Backend Architecture

**Framework**: Express.js server with TypeScript, using ES modules.

**Real-time Layer**: Socket.IO server manages:
- Room creation and joining with unique room codes
- Player connection/disconnection handling
- Broadcasting game state updates to all players in a room
- Action execution and validation

**Game Logic Layer** (`server/game-logic.ts`):
- Pure functions for game state transformations
- Tile deck creation with official component counts (12 resources, 6 hazards, 5 special)
- Action execution (place castle, draw/place tile, play secret tile)
- Scoring calculation for rows/columns at epoch end
- Game initialization and turn management

**Data Sanitization** (`server/game-utils.ts`):
- Creates player-specific views of game state
- Hides other players' secret tiles to prevent cheating
- Obfuscates tile deck contents while preserving deck size

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
- Reconnection support after disconnects

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