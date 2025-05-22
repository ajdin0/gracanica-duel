
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
    console.log('Admin login successful.');
    return { success: true };
  } else {
    console.log('Admin login failed: Incorrect password.');
    return { success: false, message: 'Netačna lozinka.' };
  }
}

export async function logout() {
  console.log('Admin logout initiated.');
  cookies().delete(ADMIN_COOKIE_NAME);
  redirect('/'); // Redirect to main page after logout
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.has(ADMIN_COOKIE_NAME) && cookieStore.get(ADMIN_COOKIE_NAME)?.value === 'true';
  // console.log('Admin auth check, isAuthenticated:', isAuthenticated);
  return isAuthenticated;
}

export async function getAdminCommunities(): Promise<Community[]> {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    console.log('getAdminCommunities: Not authorized.');
    return []; 
  }
  // console.log('getAdminCommunities: Authorized, fetching communities.');
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
    console.log('adminUpdateCommunityStats: Not authorized.');
    return { success: false, message: 'Niste ovlašteni za ovu akciju.' };
  }
  
  console.log(`adminUpdateCommunityStats: Authorized. Attempting to update community ${communityId} with ELO: ${elo}, Wins: ${wins}, Losses: ${losses}, Games: ${gamesPlayed}`);
  
  try {
    const result = await updateCommunityStatsDb(communityId, elo, wins, losses, gamesPlayed);
    if (result.success) {
      console.log(`adminUpdateCommunityStats: Successfully updated community ${communityId}.`);
    } else {
      console.warn(`adminUpdateCommunityStats: Failed to update community ${communityId}. Message: ${result.message}`);
    }
    return result;
  } catch (error) {
    console.error(`adminUpdateCommunityStats: Error updating community ${communityId}:`, error);
    return { success: false, message: 'Došlo je do greške na serveru prilikom ažuriranja.' };
  }
}
