
'use server';
import { kv } from '@vercel/kv';
import type { Community } from '@/types';
import { mockCommunities } from '@/data/mockCommunities';

const COMMUNITIES_KEY = 'gracanica_duel_communities_v2'; // Updated key to ensure fresh start if needed

async function initializeCommunitiesIfNeeded(): Promise<Community[]> {
  let communities: Community[] | null = await kv.get<Community[]>(COMMUNITIES_KEY);
  if (!communities || communities.length === 0) {
    // Seed data from mockCommunities if KV store is empty or uninitialized for this key
    communities = JSON.parse(JSON.stringify(mockCommunities)); // Deep copy
    await kv.set(COMMUNITIES_KEY, communities);
    console.log('KV Store initialized with mock data.');
  }
  return communities;
}

export async function getKvCommunities(): Promise<Community[]> {
  return await initializeCommunitiesIfNeeded();
}

export async function setKvCommunities(updatedCommunities: Community[]): Promise<void> {
  await kv.set(COMMUNITIES_KEY, updatedCommunities);
}
