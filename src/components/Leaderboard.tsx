
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Community } from '@/types';
import { subscribeToLeaderboard } from '@/services/communityService';
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

  useEffect(() => {
    setIsLoading(true); // Set loading for the initial fetch
    const unsubscribe = subscribeToLeaderboard((updatedCommunitiesFromSubscription) => {
      
      // Use functional update for setCommunities to access the most recent state
      setCommunities(currentCommunitiesState => {
        // This is the state of 'communities' *before* this update.
        // We'll create a snapshot of ELOs from this current state for communities
        // that are present in the incoming update.
        const snapshotOfOldElosForUpdate: Record<string, number> = {};
        updatedCommunitiesFromSubscription.forEach(communityInUpdate => {
          const communityAsItWas = currentCommunitiesState.find(c => c.id === communityInUpdate.id);
          if (communityAsItWas) {
            // If the community existed, its old ELO is from currentCommunitiesState
            snapshotOfOldElosForUpdate[communityInUpdate.id] = communityAsItWas.elo;
          } else {
            // If the community is new in this update, its "previous" ELO is its current ELO,
            // implying no change will be shown by getEloChangeIcon.
            snapshotOfOldElosForUpdate[communityInUpdate.id] = communityInUpdate.elo;
          }
        });

        // Update the persistent `previousElo` state.
        // This merges the ELOs we just captured (from before the update)
        // into the overall previousElo map.
        setPreviousElo(currentPreviousEloMap => ({
          ...currentPreviousEloMap,
          ...snapshotOfOldElosForUpdate,
        }));
        
        // Return the new data from the subscription to update the `communities` state.
        return updatedCommunitiesFromSubscription;
      });

      setIsLoading(false); // Set loading to false after data is processed
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Empty dependency array: runs only on mount and unmount

  const getEloChangeIcon = (community: Community) => {
    const oldElo = previousElo[community.id];
    // If oldElo is not set (e.g. first load, or new item not yet in previousElo with its *actual* old value),
    // or if ELO hasn't changed, show Minus.
    if (oldElo === undefined || oldElo === community.elo) {
      return <Minus className="h-4 w-4 text-muted-foreground inline-block ml-1" />;
    }
    if (community.elo > oldElo) {
      return <TrendingUp className="h-4 w-4 text-green-500 inline-block ml-1" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500 inline-block ml-1" />;
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
        <CardTitle className="text-3xl font-bold text-center text-primary flex items-center justify-center">
          <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
          Rang Lista Zajednica
        </CardTitle>
      </CardHeader>
      <CardContent>
        {communities.length === 0 && !isLoading ? (
          <p className="text-center text-muted-foreground py-4">Rang lista je trenutno prazna.</p>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center font-semibold">Pozicija</TableHead>
                <TableHead className="font-semibold">Zajednica</TableHead>
                <TableHead className="text-center font-semibold">ELO Ocjena</TableHead>
                <TableHead className="text-center font-semibold">Pobjede</TableHead>
                <TableHead className="text-center font-semibold">Porazi</TableHead>
                <TableHead className="text-center font-semibold">Odigrano</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map((community, index) => (
                <TableRow key={community.id} className={`transition-all duration-500 ${index < 3 ? 'bg-primary/10 hover:bg-primary/20' : ''}`}>
                  <TableCell className="text-center font-medium text-lg">
                    {index === 0 && <Trophy className="h-6 w-6 text-yellow-400 inline-block mr-1" />}
                    {index === 1 && <Trophy className="h-6 w-6 text-gray-400 inline-block mr-1" />}
                    {index === 2 && <Trophy className="h-6 w-6 text-orange-400 inline-block mr-1" />}
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-primary/50">
                        <Image 
                          src={community.imageUrl} 
                          alt={community.name} 
                          layout="fill" 
                          objectFit="cover"
                          data-ai-hint="mosque community" 
                        />
                      </div>
                      <span className="font-medium">{community.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-lg">
                    {community.elo} {getEloChangeIcon(community)}
                  </TableCell>
                  <TableCell className="text-center text-green-600 font-medium">{community.wins}</TableCell>
                  <TableCell className="text-center text-red-600 font-medium">{community.losses}</TableCell>
                  <TableCell className="text-center">{community.gamesPlayed}</TableCell>
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
