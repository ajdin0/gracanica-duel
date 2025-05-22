
'use server';

import type { Community } from '@/types';
import { 
  getRandomPairForVoting as getRandomPairDb, 
  recordVoteAndUpdateElo as recordVoteDb,
  getAllCommunities as getAllCommunitiesDb,
  // getCommunityById as getCommunityByIdDb // Removed
} from '@/lib/communityStore';

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

// Removed getCommunityById
// Removed getAllCommunities (as it was a simple pass-through to the Db one)
