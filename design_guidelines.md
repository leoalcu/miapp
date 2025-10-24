# Design Guidelines for Kingdoms Digital Board Game

## Design Approach

**Reference-Based Approach**: Medieval Fantasy Board Game Aesthetic

This is a faithful digital recreation of the physical board game Kingdoms. The design should evoke the tangible, tabletop experience while leveraging digital advantages for multiplayer functionality. Draw inspiration from successful digital board game adaptations like Ticket to Ride Digital, Splendor, and Carcassonne to balance fidelity with usability.

**Core Design Principle**: Create an interface that feels like gathering around a physical game board with friends, maintaining the medieval fantasy theme while ensuring perfect clarity of game state.

## Typography

**Primary Font**: "Cinzel" or "IM Fell English" (Google Fonts) - Medieval-inspired serif for headings, labels, and important game information

**Secondary Font**: "Lato" or "Open Sans" - Clean sans-serif for body text, rules, and UI controls

**Hierarchy**:
- Game title/headers: 32-40px, bold weight
- Section labels (Epoch, Gold, Player names): 18-24px, semibold
- Tile values/castle ranks: 20-28px, bold (needs high visibility)
- Body text/rules: 14-16px, regular
- Small UI labels: 12-14px, medium

## Layout System

**Spacing Units**: Consistently use Tailwind units of **2, 4, 6, and 8** throughout
- Micro spacing (between related items): p-2, gap-2
- Standard spacing (component padding): p-4, gap-4
- Section separation: p-6, gap-6
- Major layout divisions: p-8, gap-8

**Grid Structure**:
- Game board: 5×6 fixed grid with equal square cells, centered on screen
- Responsive breakpoints: Stack UI panels vertically on mobile (<768px), side-by-side on desktop
- Maximum container width: max-w-7xl for main game area

## Component Library

### Core Game Components

**Game Board**:
- 5×6 grid with visible borders separating each cell
- Cell size: Responsive squares that maintain aspect ratio (e.g., 80-120px per side based on viewport)
- Grid lines: Subtle borders to define rows/columns clearly
- Background: Parchment or aged paper texture behind grid
- Drop zones: Cells highlight on hover when placeable

**Castles**:
- Use tower icons stacked vertically to represent ranks (1-4 towers)
- Four player colors clearly differentiated: Red (#DC2626), Yellow (#EAB308), Blue (#2563EB), Green (#16A34A)
- Size: Fill 70% of cell size
- Visual hierarchy: Higher rank castles appear more prominent through size/glow

**Tiles - Resource (Positive)**:
- Reference the provided farm/village imagery
- Values +1 to +6 displayed prominently in corners
- Warm color palette: Greens, golds, and earth tones
- Icon + number combination for clarity

**Tiles - Hazard (Negative)**:
- Reference the provided monster/danger imagery  
- Values -1 to -6 displayed prominently in corners
- Darker color palette: Grays, purples, ominous reds
- Icon + number combination for clarity

**Special Tiles**:
- Mountain: Gray rocky texture, imposing visual
- Dragon: Red/orange fiery presence
- Gold Mine: Golden/shimmering appearance
- Wizard: Purple/mystical visual with staff/stars

**Coins**:
- Reference provided coin images
- Denominations clearly visible: 1 (copper), 5 (copper), 10 (silver), 50 (gold), 100 (gold)
- Stack visualization for player gold totals

### Navigation & Controls

**Game Lobby/Room System**:
- Room code display: Large, centered, easy to share
- Player list: Vertical cards showing player name, color, ready status
- Start game button: Prominent, disabled until minimum players joined
- Copy room code button with clear feedback

**Turn Indicator**:
- Banner or highlight showing current player's turn
- Countdown timer if implementing turn time limits
- Disabled actions for non-active players (grayed out)

**Action Buttons**:
- Three primary actions per turn:
  - "Place Castle" - Shows available castles to place
  - "Draw & Place Tile" - Initiates tile draw flow
  - "Play Secret Tile" - Only enabled if player has secret tile
- Prominent, equal-sized buttons with icons + labels
- Hover states with subtle lift/shadow

### Game Information Displays

**Player Dashboard** (for each player):
- Player name with color indicator
- Gold total with coin visualization
- Available castles inventory (show rank 1-4 with counts)
- Secret tile slot (face-down or revealed)

**Epoch Counter**:
- Visual track showing epochs 1-2-3
- Current epoch highlighted prominently
- Medieval medallion or banner styling

**Score Display**:
- End-of-epoch scoring breakdown modal
- Row-by-row and column-by-column calculations shown
- Running totals and gold awarded
- Clear visual separation between positive and negative scores

### Form Elements

**Input Fields**:
- Room code entry: Large, centered, 6-character monospace display
- Player name input: Clean, medieval-bordered inputs
- All inputs have clear labels and validation feedback

**Buttons**:
- Primary: Solid fills with medieval border accents
- Secondary: Outlined style
- Disabled: 50% opacity
- All buttons include hover lift and subtle shadow effects

## Animations

**Essential Animations Only**:
- Tile placement: Gentle drop-in (200ms ease-out)
- Castle placement: Scale-in effect (250ms)
- Turn transition: Brief highlight pulse on active player (300ms)
- Gold collection: Coins fly to player total (400ms)
- Tile draw: Card flip animation (300ms)

**No Gratuitous Effects**: Avoid distracting animations during active gameplay. Keep movement purposeful and quick.

## Images

**Board Background**: Parchment/aged paper texture as board surface - full background behind grid

**Component Images**: Use the provided physical game component photos as direct reference for:
- Tile artwork styling (adapt the visual style of farms, villages, monsters, etc.)
- Castle appearance (tower designs by rank)
- Coin designs
- Special tile imagery (dragon, wizard, mountains, gold mine)

**Hero/Loading Screen**: Medieval kingdom landscape or stylized game logo on initial load screen before entering lobby - NOT a large hero section once in-game

## Accessibility & Game State Clarity

- High contrast between tiles, castles, and board
- Color-blind friendly: Use patterns/icons in addition to color for player differentiation
- Clear numerical indicators on all tiles and castles
- Hover tooltips explaining special tile effects
- Game log/history sidebar showing recent actions
- Visual indicators for valid move locations

## Real-Time Multiplayer UI

**Connection Status**: 
- Indicator showing connected players
- Reconnection states clearly communicated

**Action Feedback**:
- Optimistic UI updates (immediate visual feedback)
- Confirmation states when moves are synced
- Clear error messages for invalid actions

**Spectator Mode** (if implemented):
- Grayed-out controls for observers
- Full visibility of game state

## Visual Theme Summary

Medieval fantasy board game brought to digital life - warm parchments, aged wood textures, metallic accents for UI frames, and faithful recreation of physical component artwork. The interface should feel inviting and nostalgic for the physical game while being crystal-clear for remote play.