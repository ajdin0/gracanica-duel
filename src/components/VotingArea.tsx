
"use client";

import React, { useState, useEffect } from 'react';
import type { Community } from '@/types';
import CommunityCard from './CommunityCard';
import LoadingSpinner from './LoadingSpinner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, SkipForward } from 'lucide-react';

interface VotingAreaProps {
  communities: [Community, Community] | [];
  onVote: (winnerId: string) => void;
  onSkip: () => void; // New prop for skipping
  isLoading: boolean; 
  isVotingProcessing: boolean; 
}

const VotingArea: React.FC<VotingAreaProps> = ({
  communities,
  onVote,
  onSkip, // New prop
  isLoading,
  isVotingProcessing,
}) => {
  const [voteHighlight, setVoteHighlight] = useState<{ winnerId: string | null; loserId: string | null }>({ winnerId: null, loserId: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVotingProcessing) {
      setVoteHighlight({ winnerId: null, loserId: null });
    }
  }, [communities, isVotingProcessing]);
  
  useEffect(() => {
    if (communities.length < 2 && !isLoading) {
       // setError('Nije dostupno dovoljno zajednica za glasanje.');
    } else {
      setError(null);
    }
  }, [communities, isLoading]);


  const handleCardVote = (winnerId: string) => {
    if (communities.length < 2) return;
    const winnerCommunity = communities.find(c => c.id === winnerId);
    const loserCommunity = communities.find(c => c.id !== winnerId);
    if (winnerCommunity && loserCommunity) {
      setVoteHighlight({ winnerId: winnerCommunity.id, loserId: loserCommunity.id });
      onVote(winnerId);
    }
  };
  
  const triggerManualRefresh = () => {
    // This might be better handled by onSkip if the error state is due to no pairs
    onSkip(); 
    console.log("Manual refresh triggered in VotingArea");
  };


  if (isLoading && communities.length === 0 && !isVotingProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground">Učitavanje zajednica...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="text-xl font-semibold">Došlo je do greške</p>
        <p className="mt-2 text-center">{error}</p>
        <Button onClick={triggerManualRefresh} className="mt-6" variant="outline" disabled={isLoading || isVotingProcessing}>
          <RefreshCw className="mr-2 h-4 w-4" /> Pokušaj ponovo
        </Button>
      </div>
    );
  }
  
  if (communities.length < 2 && !isLoading && !isVotingProcessing) {
    return (
      <div className="py-10 text-center">
        <p className="text-lg text-muted-foreground">Trenutno nema zajednica za prikazati.</p>
         <Button onClick={triggerManualRefresh} className="mt-6" variant="outline" disabled={isLoading || isVotingProcessing}>
          <RefreshCw className="mr-2 h-4 w-4" /> Osvježi
        </Button>
      </div>
    );
  }
  
  let overlayTextToShow = "Molimo sačekajte...";
  if (isVotingProcessing) {
    overlayTextToShow = isLoading ? "Učitavanje nove runde..." : "Vaš glas se obrađuje...";
  } else if (isLoading) { 
    overlayTextToShow = "Učitavanje nove runde...";
  }

  const showProcessingOrLoadingOverlay = isVotingProcessing || (isLoading && communities.length > 0);

  return (
    <div className="py-8 md:py-12 relative">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-primary">
        Koja zajednica je bolja? Izaberite!
      </h2>
      {communities.length === 2 && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 items-stretch justify-items-center relative">
          <CommunityCard
            community={communities[0]}
            onVote={handleCardVote}
            disabled={isVotingProcessing || isLoading}
            highlight={
              voteHighlight.winnerId === communities[0].id ? 'winner' :
              (isVotingProcessing && voteHighlight.loserId === communities[0].id) ? 'loser' : null
            }
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block
                          bg-background p-3 rounded-full border-2 border-primary shadow-lg">
            <span className="text-2xl font-bold text-primary">VS</span>
          </div>
          <CommunityCard
            community={communities[1]}
            onVote={handleCardVote}
            disabled={isVotingProcessing || isLoading}
            highlight={
              voteHighlight.winnerId === communities[1].id ? 'winner' :
              (isVotingProcessing && voteHighlight.loserId === communities[1].id) ? 'loser' : null
            }
          />
        </div>
      )}
      {communities.length === 2 && (
         <div className="mt-6 text-center">
            <Button
                onClick={onSkip}
                variant="outline"
                disabled={isLoading || isVotingProcessing}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-transform transform hover:scale-105"
            >
                <SkipForward className="mr-2 h-4 w-4" /> Preskoči
            </Button>
         </div>
      )}

      {showProcessingOrLoadingOverlay && (
        <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center z-10 rounded-lg">
          <LoadingSpinner size={64} />
          <p className="mt-3 text-xl text-primary font-semibold">
            {overlayTextToShow}
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingArea;
