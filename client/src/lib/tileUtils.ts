import { TileType } from "@shared/schema";
import { Mountain, Flame, Gem, Sparkles } from "lucide-react";

export function getTileIcon(type: TileType) {
  switch (type) {
    case 'mountain':
      return '⛰️';
    case 'dragon':
      return '🐉';
    case 'goldmine':
      return '💎';
    case 'wizard':
      return '✨';
    case 'resource':
      return '🌿';
    case 'hazard':
      return '⚠️';
    default:
      return '';
  }
}

export function getTileIconComponent(type: TileType) {
  switch (type) {
    case 'mountain':
      return Mountain;
    case 'dragon':
      return Flame;
    case 'goldmine':
      return Gem;
    case 'wizard':
      return Sparkles;
    default:
      return null;
  }
}

export function getTileColor(type: TileType): string {
  switch (type) {
    case 'resource':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'hazard':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    case 'mountain':
      return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    case 'dragon':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    case 'goldmine':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'wizard':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    default:
      return 'bg-card text-card-foreground';
  }
}

export function getTileBackground(type: TileType, value?: number): string {
  switch (type) {
    case 'resource':
      return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
    case 'hazard':
      return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    case 'mountain':
      return 'bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600';
    case 'dragon':
      return 'bg-orange-100 dark:bg-orange-900/30 border-orange-400 dark:border-orange-700';
    case 'goldmine':
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-700';
    case 'wizard':
      return 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 dark:border-purple-700';
    default:
      return 'bg-card border-border';
  }
}
