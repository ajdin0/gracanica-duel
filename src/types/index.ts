
export interface Community {
  id: string;
  name: string;
  imageUrl: string;
  elo: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  // description?: string; // Removed
  // detailsImageUrl?: string; // Removed
}
