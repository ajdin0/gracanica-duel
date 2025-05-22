
'use server';

import type { Community } from '@/types';
import { 
  getRandomPairForVoting as getRandomPairDb, 
  recordVoteAndUpdateElo as recordVoteDb,
  getAllCommunities as getAllCommunitiesDb,
  // getCommunityById as getCommunityByIdDb // No longer needed here if not used by public pages
} from '@/lib/communityStore'; // Updated to use renamed functions from communityStore

export async function getCommunitiesForVoting(): Promise<[Community, Community] | []> {
  return await getRandomPairDb();
}

export async function submitVote(winnerId: string, loserId: string): Promise<{ success: boolean; message?: string }> {
  return await recordVoteDb(winnerId, loserId);
}

export async function getLeaderboard(): Promise<Community[]> {
  const communities = await getAllCommunitiesDb();
  // Sort by ELO descending
  return communities.sort((a, b) => b.elo - a.elo);
}

// Removed getAllCommunities and getCommunityById as they were for Karta/Zajednice pages
// If any other public part needs them, they can be re-added.
