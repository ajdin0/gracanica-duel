
import type { Community } from '@/types';
import { getKvCommunities, setKvCommunities } from './kvCommunityService';
import { mockCommunities } from '@/data/mockCommunities'; // Import mockCommunities

const K_FACTOR = 32;

// Internal helper for ELO calculation
function calculateEloInternal(winnerElo: number, loserElo: number): { newWinnerElo: number; newLoserElo: number } {
  const getExpectedScore = (eloA: number, eloB: number): number => {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  };
  const expectedWinnerScore = getExpectedScore(winnerElo, loserElo);
  const expectedLoserScore = getExpectedScore(loserElo, winnerElo);
  const newWinnerElo = Math.round(winnerElo + K_FACTOR * (1 - expectedWinnerScore));
  const newLoserElo = Math.round(loserElo + K_FACTOR * (0 - expectedLoserScore));
  return { newWinnerElo, newLoserElo };
}

export async function getAllCommunities(): Promise<Community[]> {
  const communities = await getKvCommunities();
  return JSON.parse(JSON.stringify(communities)); // Return deep copy
}

export async function getCommunityById(id: string): Promise<Community | undefined> {
  const communities = await getKvCommunities();
  const community = communities.find(c => c.id === id);
  return community ? JSON.parse(JSON.stringify(community)) : undefined;
}

export async function getRandomPairForVoting(): Promise<[Community, Community] | []> {
  const communities = await getKvCommunities();
  if (communities.length < 2) {
    return [];
  }
  let indexA = Math.floor(Math.random() * communities.length);
  let indexB = Math.floor(Math.random() * communities.length);
  while (indexA === indexB) {
    indexB = Math.floor(Math.random() * communities.length);
  }
  // Return copies to prevent direct modification of store objects by clients
  return [
    JSON.parse(JSON.stringify(communities[indexA])),
    JSON.parse(JSON.stringify(communities[indexB])),
  ];
}

export async function recordVoteAndUpdateElo(winnerId: string, loserId: string): Promise<{ success: boolean; message?: string }> {
  let communities = await getKvCommunities();
  const winnerIndex = communities.findIndex(c => c.id === winnerId);
  const loserIndex = communities.findIndex(c => c.id === loserId);

  if (winnerIndex === -1 || loserIndex === -1) {
    return { success: false, message: 'Pobjednik ili gubitnik nisu pronađeni.' };
  }

  const winner = { ...communities[winnerIndex] }; // Create a copy
  const loser = { ...communities[loserIndex] };   // Create a copy

  const { newWinnerElo, newLoserElo } = calculateEloInternal(winner.elo, loser.elo);

  winner.elo = newWinnerElo;
  winner.wins += 1;
  winner.gamesPlayed += 1;

  loser.elo = newLoserElo;
  loser.losses += 1;
  loser.gamesPlayed += 1;
  
  communities[winnerIndex] = winner;
  communities[loserIndex] = loser;

  await setKvCommunities(communities);
  return { success: true };
}

export async function updateCommunityStats(
  communityId: string,
  elo: number,
  wins: number,
  losses: number,
  gamesPlayed: number
): Promise<{ success: boolean; message?: string }> {
  let communities = await getKvCommunities();
  const communityIndex = communities.findIndex(c => c.id === communityId);

  if (communityIndex === -1) {
    return { success: false, message: 'Zajednica nije pronađena.' };
  }

  const updatedCommunity = { ...communities[communityIndex] }; // Create a copy
  updatedCommunity.elo = elo;
  updatedCommunity.wins = wins;
  updatedCommunity.losses = losses;
  updatedCommunity.gamesPlayed = gamesPlayed; // gamesPlayed is now directly set

  communities[communityIndex] = updatedCommunity;
  await setKvCommunities(communities);
  return { success: true };
}

export async function resetAllCommunitiesToMockData(): Promise<{ success: boolean; message?: string }> {
  try {
    // Create a deep copy of mockCommunities to ensure the original isn't mutated
    // and that KV receives a fresh, serializable object.
    const pristineMockData = JSON.parse(JSON.stringify(mockCommunities));
    await setKvCommunities(pristineMockData);
    return { success: true };
  } catch (error) {
    console.error("Error resetting communities to mock data in store:", error);
    return { success: false, message: "Greška prilikom resetiranja podataka o zajednicama." };
  }
}
