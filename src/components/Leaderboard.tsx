
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Community } from '@/types';
import { getLeaderboard } from '@/app/actions'; // Import Server Action
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from './LoadingSpinner';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Image from 'next/image';

const Leaderboard: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previousElo, setPreviousElo] = useState<Record<string, number>>({});

  const fetchAndSetLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedCommunities = await getLeaderboard();
      
      setCommunities(currentCommunitiesState => {
        const snapshotOfOldElosForUpdate: Record<string, number> = {};
        updatedCommunities.forEach(communityInUpdate => {
          const communityAsItWas = currentCommunitiesState.find(c => c.id === communityInUpdate.id);
          if (communityAsItWas) {
            snapshotOfOldElosForUpdate[communityInUpdate.id] = communityAsItWas.elo;
          } else {
            // If it's a new community in the update, its "previous" ELO for THIS update cycle is its current ELO.
            snapshotOfOldElosForUpdate[communityInUpdate.id] = communityInUpdate.elo;
          }
        });

        setPreviousElo(currentPreviousEloMap => ({
          ...currentPreviousEloMap, // Preserve history for communities not in the immediate last update
          ...snapshotOfOldElosForUpdate,
        }));
        
        return updatedCommunities;
      });
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      // Optionally, set an error state here to display to the user
    } finally {
      setIsLoading(false); 
    }
  }, []); // No dependencies, so it's stable

  useEffect(() => {
    fetchAndSetLeaderboard();
    // The page refresh triggered by router.refresh() in VotingArea will cause this component to re-mount
    // or its parent to re-render, triggering this effect again if dependencies change or if it's part of the refreshed tree.
    // For a direct re-fetch without full re-mount, a more complex state management or prop drilling for a trigger would be needed.
    // However, router.refresh() typically re-runs Server Components and fetches fresh data for Client Components.
  }, [fetchAndSetLeaderboard]); // Rely on router.refresh() to trigger updates by re-rendering the page component tree

  const getEloChangeIcon = (community: Community) => {
    const oldElo = previousElo[community.id];
    // If oldElo is not available, or if it's the same as current (e.g. first load for this community), show Minus
    if (oldElo === undefined || oldElo === community.elo) {
      return <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground inline-block ml-1" />;
    }
    if (community.elo > oldElo) {
      return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 inline-block ml-1" />;
    }
    return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 inline-block ml-1" />;
  };


  if (isLoading && communities.length === 0) { 
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground">Učitavanje rang liste...</p>
      </div>
    );
  }
  
  return (
    <Card className="shadow-xl my-8 md:my-12">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-primary flex items-center justify-center">
          <Trophy className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-yellow-500" />
          Rang Lista Zajednica
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-2 md:px-4 lg:px-6">
        {communities.length === 0 && !isLoading ? (
          <p className="text-center text-muted-foreground py-4">Rang lista je trenutno prazna.</p>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] sm:w-[50px] px-1 py-2 sm:px-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">Poz.</TableHead>
                <TableHead className="px-1 py-2 sm:px-2 sm:py-3 font-semibold text-xs sm:text-sm">Zajednica</TableHead>
                <TableHead className="w-[60px] sm:w-auto px-1 py-2 sm:px-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">ELO</TableHead>
                <TableHead className="w-[50px] sm:w-auto px-1 py-2 sm:px-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">Pobj.</TableHead>
                <TableHead className="w-[50px] sm:w-auto px-1 py-2 sm:px-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">Por.</TableHead>
                <TableHead className="hidden sm:table-cell w-[70px] px-1 py-2 sm:px-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">Odig.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map((community, index) => (
                <TableRow key={community.id} className={`transition-colors duration-300 hover:bg-muted/50 ${index < 3 ? 'bg-primary/10' : ''}`}>
                  <TableCell className="text-center font-normal text-xs sm:text-base p-1 sm:p-2">
                    {index === 0 && <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 inline-block mr-0.5 sm:mr-1" />}
                    {index === 1 && <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 inline-block mr-0.5 sm:mr-1" />}
                    {index === 2 && <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 inline-block mr-0.5 sm:mr-1" />}
                    {index + 1}
                  </TableCell>
                  <TableCell className="p-1 sm:p-2">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div className="relative h-5 w-5 sm:h-6 md:h-8 sm:w-6 md:w-8 rounded-full overflow-hidden border border-primary/30 flex-shrink-0">
                        <Image 
                          src={community.imageUrl} 
                          alt={community.name} 
                          layout="fill" 
                          objectFit="cover"
                          data-ai-hint="mosque community" 
                        />
                      </div>
                      <span className="font-medium text-[11px] sm:text-xs md:text-sm">{community.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-xs sm:text-sm md:text-base p-1 sm:p-2">
                    {community.elo} {getEloChangeIcon(community)}
                  </TableCell>
                  <TableCell className="text-center text-green-600 font-medium text-[11px] sm:text-xs md:text-sm p-1 sm:p-2">{community.wins}</TableCell>
                  <TableCell className="text-center text-red-600 font-medium text-[11px] sm:text-xs md:text-sm p-1 sm:p-2">{community.losses}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center text-[11px] sm:text-xs md:text-sm p-1 sm:p-2">{community.gamesPlayed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;

