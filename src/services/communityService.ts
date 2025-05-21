
import type { Community } from '@/types';
import { mockCommunities } from '@/data/mockCommunities';
import { calculateElo } from '@/lib/elo';

// Simulate a data store
let communitiesStore: Community[] = JSON.parse(JSON.stringify(mockCommunities)); // Deep copy

// Simulate listeners for real-time updates
type LeaderboardListener = (communities: Community[]) => void;
const leaderboardListeners: Set<LeaderboardListener> = new Set();

function notifyLeaderboardListeners() {
  const sortedCommunities = [...communitiesStore].sort((a, b) => b.elo - a.elo);
  leaderboardListeners.forEach(listener => listener(sortedCommunities));
}

export async function getTwoRandomCommunities(): Promise<[Community, Community] | []> {
  if (communitiesStore.length < 2) {
    return [];
  }
  let indexA = Math.floor(Math.random() * communitiesStore.length);
  let indexB = Math.floor(Math.random() * communitiesStore.length);
  while (indexA === indexB) {
    indexB = Math.floor(Math.random() * communitiesStore.length);
  }
  return [communitiesStore[indexA], communitiesStore[indexB]];
}

export function subscribeToLeaderboard(listener: LeaderboardListener): () => void {
  leaderboardListeners.add(listener);
  // Initial emit
  const sortedCommunities = [...communitiesStore].sort((a, b) => b.elo - a.elo);
  listener(sortedCommunities);

  return () => {
    leaderboardListeners.delete(listener);
  };
}

export async function recordVote(winnerId: string, loserId: string): Promise<void> {
  const winner = communitiesStore.find(c => c.id === winnerId);
  const loser = communitiesStore.find(c => c.id === loserId);

  if (!winner || !loser) {
    throw new Error('Pobjednik ili gubitnik nisu pronađeni.');
  }

  const { newWinnerElo, newLoserElo } = calculateElo(winner.elo, loser.elo);

  winner.elo = newWinnerElo;
  winner.wins += 1;
  winner.gamesPlayed += 1;

  loser.elo = newLoserElo;
  loser.losses += 1;
  loser.gamesPlayed += 1;
  
  // Update the store directly (simulating Firestore update)
  communitiesStore = communitiesStore.map(c => {
    if (c.id === winnerId) return winner;
    if (c.id === loserId) return loser;
    return c;
  });

  notifyLeaderboardListeners(); // Notify all listeners about the change
}
