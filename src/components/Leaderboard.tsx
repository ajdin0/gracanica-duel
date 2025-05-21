
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
    setIsLoading(true);
    const unsubscribe = subscribeToLeaderboard((updatedCommunitiesFromSubscription) => {
      
      setCommunities(currentCommunitiesState => {
        const snapshotOfOldElosForUpdate: Record<string, number> = {};
        updatedCommunitiesFromSubscription.forEach(communityInUpdate => {
          const communityAsItWas = currentCommunitiesState.find(c => c.id === communityInUpdate.id);
          if (communityAsItWas) {
            snapshotOfOldElosForUpdate[communityInUpdate.id] = communityAsItWas.elo;
          } else {
            snapshotOfOldElosForUpdate[communityInUpdate.id] = communityInUpdate.elo;
          }
        });

        setPreviousElo(currentPreviousEloMap => ({
          ...currentPreviousEloMap,
          ...snapshotOfOldElosForUpdate,
        }));
        
        return updatedCommunitiesFromSubscription;
      });

      setIsLoading(false); 
    });

    return () => unsubscribe();
  }, []); 

  const getEloChangeIcon = (community: Community) => {
    const oldElo = previousElo[community.id];
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
      <CardContent className="px-2 sm:px-4 md:px-6">
        {communities.length === 0 && !isLoading ? (
          <p className="text-center text-muted-foreground py-4">Rang lista je trenutno prazna.</p>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] sm:w-[80px] px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold text-xs sm:text-sm">Pozicija</TableHead>
                <TableHead className="px-2 py-2 sm:px-4 sm:py-3 font-semibold text-xs sm:text-sm">Zajednica</TableHead>
                <TableHead className="w-[70px] sm:w-auto px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold text-xs sm:text-sm">ELO</TableHead>
                <TableHead className="w-[60px] sm:w-auto px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold text-xs sm:text-sm">Pobjede</TableHead>
                <TableHead className="w-[60px] sm:w-auto px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold text-xs sm:text-sm">Porazi</TableHead>
                <TableHead className="hidden sm:table-cell w-[70px] px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold text-xs sm:text-sm">Odigrano</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map((community, index) => (
                <TableRow key={community.id} className={`transition-all duration-500 ${index < 3 ? 'bg-primary/10 hover:bg-primary/20' : ''}`}>
                  <TableCell className="text-center font-normal text-sm sm:text-lg p-2 sm:p-4">
                    {index === 0 && <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 inline-block mr-1" />}
                    {index === 1 && <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 inline-block mr-1" />}
                    {index === 2 && <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 inline-block mr-1" />}
                    {index + 1}
                  </TableCell>
                  <TableCell className="p-2 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="relative h-6 w-6 sm:h-8 md:h-10 sm:w-8 md:w-10 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
                        <Image 
                          src={community.imageUrl} 
                          alt={community.name} 
                          layout="fill" 
                          objectFit="cover"
                          data-ai-hint="mosque community" 
                        />
                      </div>
                      <span className="font-medium text-xs sm:text-base">{community.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-sm sm:text-lg p-2 sm:p-4">
                    {community.elo} {getEloChangeIcon(community)}
                  </TableCell>
                  <TableCell className="text-center text-green-600 font-medium text-xs sm:text-sm p-2 sm:p-4">{community.wins}</TableCell>
                  <TableCell className="text-center text-red-600 font-medium text-xs sm:text-sm p-2 sm:p-4">{community.losses}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center text-xs sm:text-sm p-2 sm:p-4">{community.gamesPlayed}</TableCell>
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
