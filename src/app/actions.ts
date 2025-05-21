
'use server';

import type { Community } from '@/types';
import { mockCommunities } from '@/data/mockCommunities';
import { calculateElo } from '@/lib/elo';

// Initialize the store with a deep copy to avoid modifying the mock data directly
let communitiesStore: Community[] = JSON.parse(JSON.stringify(mockCommunities));

export async function getCommunitiesForVoting(): Promise<[Community, Community] | []> {
  if (communitiesStore.length < 2) {
    return [];
  }
  let indexA = Math.floor(Math.random() * communitiesStore.length);
  let indexB = Math.floor(Math.random() * communitiesStore.length);
  while (indexA === indexB) {
    indexB = Math.floor(Math.random() * communitiesStore.length);
  }
  // Return copies to prevent direct modification of store objects by clients if they were to hold references
  return [
    JSON.parse(JSON.stringify(communitiesStore[indexA])),
    JSON.parse(JSON.stringify(communitiesStore[indexB])),
  ];
}

export async function submitVote(winnerId: string, loserId: string): Promise<{ success: boolean; message?: string }> {
  const winnerIndex = communitiesStore.findIndex(c => c.id === winnerId);
  const loserIndex = communitiesStore.findIndex(c => c.id === loserId);

  if (winnerIndex === -1 || loserIndex === -1) {
    return { success: false, message: 'Pobjednik ili gubitnik nisu pronađeni.' };
  }

  const winner = { ...communitiesStore[winnerIndex] };
  const loser = { ...communitiesStore[loserIndex] };

  const { newWinnerElo, newLoserElo } = calculateElo(winner.elo, loser.elo);

  winner.elo = newWinnerElo;
  winner.wins += 1;
  winner.gamesPlayed += 1;

  loser.elo = newLoserElo;
  loser.losses += 1;
  loser.gamesPlayed += 1;
  
  communitiesStore[winnerIndex] = winner;
  communitiesStore[loserIndex] = loser;

  return { success: true };
}

export async function getLeaderboard(): Promise<Community[]> {
  const sortedCommunities = [...communitiesStore].sort((a, b) => b.elo - a.elo);
  // Return copies
  return JSON.parse(JSON.stringify(sortedCommunities));
}
