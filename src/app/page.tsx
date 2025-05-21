
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Community } from '@/types';
import { getLeaderboard, getCommunitiesForVoting, submitVote } from '@/app/actions';
import { calculateElo } from '@/lib/elo';
import Header from '@/components/Header';
import VotingArea from '@/components/VotingArea';
import Leaderboard from '@/components/Leaderboard';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [leaderboardData, setLeaderboardData] = useState<Community[]>([]);
  const [votingPair, setVotingPair] = useState<[Community, Community] | []>([]);
  const [previousEloForLeaderboard, setPreviousEloForLeaderboard] = useState<Record<string, number>>({});
  
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isLoadingVotingPair, setIsLoadingVotingPair] = useState(false); // Specifically for fetching new pairs after a vote
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const fetchLeaderboardAndInitPreviousElo = useCallback(async (isInitialLoad = false) => {
    const communitiesFromServer = await getLeaderboard();
    setLeaderboardData(currentDataInState => {
      const newPrevEloSnapshot: Record<string, number> = {};
      // If initial load, previousElo is same as current ELO (no change)
      // Otherwise, previousElo is based on the state *before* this server update.
      const sourceForPreviousElo = isInitialLoad ? communitiesFromServer : currentDataInState;
      
      sourceForPreviousElo.forEach(c => {
        newPrevEloSnapshot[c.id] = c.elo;
      });
      // Preserve existing previousElo entries not in current snapshot, merge new ones
      setPreviousEloForLeaderboard(prevElo => ({ ...prevElo, ...newPrevEloSnapshot }));
      return communitiesFromServer;
    });
  }, []);

  const fetchVotingPairInternal = useCallback(async () => {
    setIsLoadingVotingPair(true); // Used for subsequent fetches
    const pair = await getCommunitiesForVoting();
    if (pair.length === 2) {
      setVotingPair(pair as [Community, Community]);
    } else {
      setVotingPair([]);
      toast({ title: "Info", description: "Nema više dostupnih parova za glasanje." });
    }
    setIsLoadingVotingPair(false);
  }, [toast]);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingInitialData(true);
      await fetchLeaderboardAndInitPreviousElo(true);
      await fetchVotingPairInternal();
      setIsLoadingInitialData(false);
    }
    loadInitialData();
  }, [fetchLeaderboardAndInitPreviousElo, fetchVotingPairInternal]);

  const handleVote = async (winnerId: string) => {
    if (votingPair.length < 2 || isSubmittingVote || isLoadingVotingPair) return;

    setIsSubmittingVote(true);
    const winnerCommunity = votingPair.find(c => c.id === winnerId)!;
    const loserCommunity = votingPair.find(c => c.id !== winnerId)!;

    const { newWinnerElo, newLoserElo } = calculateElo(winnerCommunity.elo, loserCommunity.elo);

    // Optimistic update for Leaderboard data
    setLeaderboardData(currentLeaderboard => {
      const snapshotOfOldElos: Record<string, number> = {};
      currentLeaderboard.forEach(c => {
        snapshotOfOldElos[c.id] = c.elo;
      });
      setPreviousEloForLeaderboard(prevElo => ({...prevElo, ...snapshotOfOldElos}));

      return currentLeaderboard.map(c => {
        if (c.id === winnerCommunity.id) return { ...c, elo: newWinnerElo, wins: c.wins + 1, gamesPlayed: c.gamesPlayed + 1 };
        if (c.id === loserCommunity.id) return { ...c, elo: newLoserElo, losses: c.losses + 1, gamesPlayed: c.gamesPlayed + 1 };
        return c;
      }).sort((a, b) => b.elo - a.elo);
    });

    // Optimistic update for the voting pair itself (for card display)
    setVotingPair(prevPair => 
      prevPair.map(c => {
        if (c.id === winnerCommunity.id) return { ...c, elo: newWinnerElo };
        if (c.id === loserCommunity.id) return { ...c, elo: newLoserElo };
        return c;
      }) as [Community, Community]
    );

    try {
      const result = await submitVote(winnerCommunity.id, loserCommunity.id);
      if (result.success) {
        toast({
          title: "Glas zabilježen!",
          description: `${winnerCommunity.name} je pobijedio/la ${loserCommunity.name}.`,
        });
        
        setTimeout(async () => {
          router.refresh(); // Request re-fetch of server components data
          await fetchLeaderboardAndInitPreviousElo(); // Re-fetch and update Leaderboard data from server
          await fetchVotingPairInternal();     // Fetch new voting pair
          setIsSubmittingVote(false);
        }, 1500);

      } else {
        throw new Error(result.message || 'Došlo je do greške prilikom glasanja.');
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Greška pri glasanju",
        description: err instanceof Error ? err.message : 'Nepoznata greška',
      });
      // Rollback optimistic updates by re-fetching from server
      await fetchLeaderboardAndInitPreviousElo(true); // Pass true to reset previousElo based on server
      await fetchVotingPairInternal();
      setIsSubmittingVote(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <VotingArea
          communities={votingPair}
          onVote={handleVote}
          isLoading={isLoadingInitialData || isLoadingVotingPair} // Combined loading state for VotingArea
          isVotingProcessing={isSubmittingVote}
          key={votingPair.map(c => c.id).join('-')} // Force re-render of VotingArea with new pair
        />
        <Leaderboard
          communities={leaderboardData}
          isLoading={isLoadingInitialData} // Leaderboard loading state
          previousElo={previousEloForLeaderboard}
        />
      </main>
      <Footer />
    </div>
  );
}
