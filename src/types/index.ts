
export interface Community {
  id: string;
  name: string;
  imageUrl: string; // Main image for voting/leaderboard
  elo: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  description?: string; // For the community detail page
  detailsImageUrl?: string; // Specific image for the detail page, if different
}
