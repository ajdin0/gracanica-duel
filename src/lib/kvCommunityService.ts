
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
      '****************************************************************************\n' +
      '** Vercel KV environment variables NOT FOUND or incomplete.               **\n' +
      '** Falling back to IN-MEMORY store.                                       **\n' +
      '** IMPORTANT: Data will NOT PERSIST reliably in a deployed environment!   **\n' +
      '** Please ensure Vercel KV is correctly set up and connected.             **\n' +
      '****************************************************************************'
    );
  }
}

const canUseKv = (): boolean => {
  const hasUrl = !!process.env.KV_REST_API_URL;
  const hasToken = !!process.env.KV_REST_API_TOKEN;
  if (!hasUrl || !hasToken) {
    // console.log('KV check: URL or Token missing. URL found:', hasUrl, 'Token found:', hasToken);
    return false;
  }
  // console.log('KV check: URL and Token found. Using Vercel KV.');
  return true;
};

async function initializeCommunitiesIfNeeded(): Promise<Community[]> {
  if (canUseKv()) {
    console.log(`Attempting to get communities from Vercel KV with key: ${COMMUNITIES_KEY}`);
    try {
      let communities: Community[] | null = await kv.get<Community[]>(COMMUNITIES_KEY);
      if (!communities || communities.length === 0) {
        console.log(`No communities found in Vercel KV or array is empty. Initializing with mock data.`);
        communities = JSON.parse(JSON.stringify(mockCommunities)); // Deep copy
        await kv.set(COMMUNITIES_KEY, communities);
        console.log('Vercel KV Store initialized and seeded with mock data.');
      } else {
        console.log('Successfully retrieved communities from Vercel KV.');
      }
      return communities;
    } catch (error) {
      console.error('Error during Vercel KV get/initialization:', error);
      console.warn('Falling back to in-memory store due to Vercel KV error during get/initialization.');
      initializeInMemoryStore();
      return JSON.parse(JSON.stringify(inMemoryStore!));
    }
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
    console.log(`Attempting to set communities in Vercel KV for key: ${COMMUNITIES_KEY}`);
    try {
      await kv.set(COMMUNITIES_KEY, updatedCommunities);
      console.log('Successfully set communities in Vercel KV.');
    } catch (error) {
      console.error('Error setting communities in Vercel KV:', error);
      // Not falling back here as the intent was to use KV.
      // The calling function should handle the error if persistence is critical.
      throw error; // Re-throw to indicate KV operation failed
    }
  } else {
    console.log('Setting communities in in-memory store (Vercel KV not configured).');
    initializeInMemoryStore(); // Ensure it's initialized
    inMemoryStore = JSON.parse(JSON.stringify(updatedCommunities)); // Ensure deep copy
  }
}
