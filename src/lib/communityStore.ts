
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

export async function getAllCommunitiesDb(): Promise<Community[]> { // Renamed to avoid conflict if exported directly
  const communities = await getKvCommunities();
  return JSON.parse(JSON.stringify(communities)); // Return deep copy
}

export async function getCommunityByIdDb(id: string): Promise<Community | undefined> { // Renamed
  const communities = await getKvCommunities();
  const community = communities.find(c => c.id === id);
  return community ? JSON.parse(JSON.stringify(community)) : undefined;
}

export async function getRandomPairForVotingDb(): Promise<[Community, Community] | []> { // Renamed
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

export async function recordVoteAndUpdateEloDb(winnerId: string, loserId: string): Promise<{ success: boolean; message?: string }> { // Renamed
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

export async function updateCommunityStatsDb( // Renamed
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
  updatedCommunity.gamesPlayed = gamesPlayed; 

  communities[communityIndex] = updatedCommunity;
  await setKvCommunities(communities);
  return { success: true };
}

export async function resetAllCommunitiesToMockDataDb(): Promise<{ success: boolean; message?: string }> { // Renamed
  try {
    const pristineMockData = JSON.parse(JSON.stringify(mockCommunities));
    await setKvCommunities(pristineMockData);
    return { success: true };
  } catch (error)
 {
    console.error("Error resetting communities to mock data in store:", error);
    return { success: false, message: "Greška prilikom resetiranja podataka o zajednicama." };
  }
}

// Renamed functions to getAllCommunities, getCommunityById etc. so they can be called by server actions with those names
// These will be the functions actually exported and used by actions.ts etc.
export const getAllCommunities = getAllCommunitiesDb;
export const getCommunityById = getCommunityByIdDb;
export const getRandomPairForVoting = getRandomPairForVotingDb;
export const recordVoteAndUpdateElo = recordVoteAndUpdateEloDb;
export const updateCommunityStats = updateCommunityStatsDb;
export const resetAllCommunitiesToMockData = resetAllCommunitiesToMockDataDb;
