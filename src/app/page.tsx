
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
import LoadingSpinner from '@/components/LoadingSpinner'; // Import LoadingSpinner

export default function HomePage() {
  const [leaderboardData, setLeaderboardData] = useState<Community[]>([]);
  const [votingPair, setVotingPair] = useState<[Community, Community] | []>([]);
  const [previousEloForLeaderboard, setPreviousEloForLeaderboard] = useState<Record<string, number>>({});
  
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isLoadingVotingPair, setIsLoadingVotingPair] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const fetchLeaderboardAndInitPreviousElo = useCallback(async (isInitialLoad = false) => {
    const communitiesFromServer = await getLeaderboard();
    setLeaderboardData(currentDataInState => {
      const newPrevEloSnapshot: Record<string, number> = {};
      const sourceForPreviousElo = isInitialLoad ? communitiesFromServer : currentDataInState.length > 0 ? currentDataInState : communitiesFromServer;
      
      sourceForPreviousElo.forEach(c => {
        newPrevEloSnapshot[c.id] = c.elo;
      });
      setPreviousEloForLeaderboard(prevElo => ({ ...prevElo, ...newPrevEloSnapshot }));
      return communitiesFromServer;
    });
  }, []);

  const fetchVotingPairInternal = useCallback(async () => {
    setIsLoadingVotingPair(true);
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
      try {
        await fetchLeaderboardAndInitPreviousElo(true);
        await fetchVotingPairInternal();
      } catch (error) {
        console.error("Greška pri učitavanju inicijalnih podataka:", error);
        toast({
          variant: "destructive",
          title: "Greška",
          description: "Nije moguće učitati podatke. Molimo pokušajte ponovo kasnije."
        });
      } finally {
        setIsLoadingInitialData(false);
      }
    }
    loadInitialData();
  }, [fetchLeaderboardAndInitPreviousElo, fetchVotingPairInternal, toast]);

  const handleVote = async (winnerId: string) => {
    if (votingPair.length < 2 || isSubmittingVote || isLoadingVotingPair) return;

    setIsSubmittingVote(true);
    const winnerCommunity = votingPair.find(c => c.id === winnerId)!;
    const loserCommunity = votingPair.find(c => c.id !== winnerId)!;

    const { newWinnerElo, newLoserElo } = calculateElo(winnerCommunity.elo, loserCommunity.elo);

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
          router.refresh(); 
          await fetchLeaderboardAndInitPreviousElo(); 
          await fetchVotingPairInternal();     
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
      await fetchLeaderboardAndInitPreviousElo(true);
      await fetchVotingPairInternal();
      setIsSubmittingVote(false);
    }
  };

  const handleSkipVote = async () => {
    if (isSubmittingVote || isLoadingVotingPair) return;
    toast({
      title: "Preskačem...",
      description: "Učitavam novi par zajednica.",
    });
    await fetchVotingPairInternal();
  };

  if (isLoadingInitialData) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
        <LoadingSpinner size={64} />
        <p className="mt-4 text-xl font-semibold">Učitavanje aplikacije...</p>
        <p className="text-muted-foreground">Molimo sačekajte.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <VotingArea
          communities={votingPair}
          onVote={handleVote}
          onSkip={handleSkipVote}
          isLoading={isLoadingVotingPair}
          isVotingProcessing={isSubmittingVote}
          key={votingPair.map(c => c.id).join('-') + (isSubmittingVote ? '-processing' : '')}
        />
        <Leaderboard
          communities={leaderboardData}
          isLoading={false} 
          previousElo={previousEloForLeaderboard}
        />
      </main>
      <Footer />
    </div>
  );
}
