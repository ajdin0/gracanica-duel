
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Community } from '@/types';
import { 
  getAllCommunities as getAllCommunitiesDb, 
  updateCommunityStats as updateCommunityStatsDb 
} from '@/lib/communityStore';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TringAjdin24!";
const ADMIN_COOKIE_NAME = 'admin_authenticated';

export async function login(password: string): Promise<{ success: boolean; message?: string }> {
  if (password === ADMIN_PASSWORD) {
    cookies().set(ADMIN_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });
    return { success: true };
  } else {
    return { success: false, message: 'Netačna lozinka.' };
  }
}

export async function logout() {
  cookies().delete(ADMIN_COOKIE_NAME);
  redirect('/'); // Redirect to main page after logout
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = cookies();
  return cookieStore.has(ADMIN_COOKIE_NAME) && cookieStore.get(ADMIN_COOKIE_NAME)?.value === 'true';
}

export async function getAdminCommunities(): Promise<Community[]> {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return []; 
  }
  return await getAllCommunitiesDb();
}

export async function adminUpdateCommunityStats(
  communityId: string,
  elo: number,
  wins: number,
  losses: number,
  gamesPlayed: number
): Promise<{ success: boolean; message?: string }> {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return { success: false, message: 'Niste ovlašteni za ovu akciju.' };
  }
  return await updateCommunityStatsDb(communityId, elo, wins, losses, gamesPlayed);
}
