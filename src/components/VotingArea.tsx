
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Community } from '@/types';
import { getTwoRandomCommunities, recordVote } from '@/services/communityService';
import CommunityCard from './CommunityCard';
import LoadingSpinner from './LoadingSpinner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VotingArea: React.FC = () => {
  const [communities, setCommunities] = useState<[Community, Community] | []>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCommunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newCommunities = await getTwoRandomCommunities();
      if (newCommunities.length < 2) {
        setError('Nije dostupno dovoljno zajednica za glasanje.');
        setCommunities([]);
      } else {
        setCommunities(newCommunities as [Community, Community]);
      }
    } catch (err) {
      setError('Greška pri učitavanju zajednica.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleVote = async (winnerId: string) => {
    if (communities.length < 2) return;
    setIsVoting(true);
    const winner = communities.find(c => c.id === winnerId);
    const loser = communities.find(c => c.id !== winnerId);

    if (!winner || !loser) {
      toast({
        variant: "destructive",
        title: "Greška",
        description: "Problem prilikom odabira pobjednika.",
      });
      setIsVoting(false);
      return;
    }

    try {
      await recordVote(winner.id, loser.id);
      toast({
        title: "Glas zabilježen!",
        description: `${winner.name} je pobijedio/la ${loser.name}.`,
      });
      await fetchCommunities(); // Fetch new pair after vote
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Došlo je do greške prilikom glasanja.';
      toast({
        variant: "destructive",
        title: "Greška pri glasanju",
        description: errorMessage,
      });
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
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
        <Button onClick={fetchCommunities} className="mt-6" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Pokušaj ponovo
        </Button>
      </div>
    );
  }

  if (communities.length < 2) {
    return (
      <div className="py-10 text-center">
        <p className="text-lg text-muted-foreground">Trenutno nema zajednica za prikazati.</p>
         <Button onClick={fetchCommunities} className="mt-6" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Osvježi
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-primary">
        Koja zajednica je bolja? Izaberite!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-stretch justify-items-center relative">
        <CommunityCard
          community={communities[0]}
          onVote={handleVote}
          disabled={isVoting}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block
                        bg-background p-3 rounded-full border-2 border-primary shadow-lg">
          <span className="text-2xl font-bold text-primary">VS</span>
        </div>
        <CommunityCard
          community={communities[1]}
          onVote={handleVote}
          disabled={isVoting}
        />
      </div>
      {isVoting && (
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner size={64} />
          <p className="ml-4 text-xl text-primary font-semibold">Glasanje u toku...</p>
        </div>
      )}
    </div>
  );
};

export default VotingArea;
