
'use server';
import { kv } from '@vercel/kv';
import type { Community } from '@/types';
import { mockCommunities } from '@/data/mockCommunities';

const COMMUNITIES_KEY = 'gracanica_duel_communities_v2';

// In-memory store for fallback
let inMemoryStore: Community[] | null = null;

function initializeInMemoryStore() {
  if (inMemoryStore === null) {
    inMemoryStore = JSON.parse(JSON.stringify(mockCommunities));
    console.warn(
      'Vercel KV environment variables not found. Falling back to in-memory store. Data will not persist across server restarts.'
    );
  }
}

const canUseKv = (): boolean => {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
};

async function initializeCommunitiesIfNeeded(): Promise<Community[]> {
  if (canUseKv()) {
    let communities: Community[] | null = await kv.get<Community[]>(COMMUNITIES_KEY);
    if (!communities || communities.length === 0) {
      communities = JSON.parse(JSON.stringify(mockCommunities)); // Deep copy
      await kv.set(COMMUNITIES_KEY, communities);
      console.log('Vercel KV Store initialized with mock data.');
    }
    return communities;
  } else {
    initializeInMemoryStore();
    return JSON.parse(JSON.stringify(inMemoryStore!)); // Ensure deep copy
  }
}

export async function getKvCommunities(): Promise<Community[]> {
  return await initializeCommunitiesIfNeeded();
}

export async function setKvCommunities(updatedCommunities: Community[]): Promise<void> {
  if (canUseKv()) {
    await kv.set(COMMUNITIES_KEY, updatedCommunities);
  } else {
    initializeInMemoryStore(); // Ensure it's initialized
    inMemoryStore = JSON.parse(JSON.stringify(updatedCommunities)); // Ensure deep copy
  }
}
