
"use client";

import Image from 'next/image';
import type { Community } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp } from 'lucide-react';

interface CommunityCardProps {
  community: Community;
  onVote?: (communityId: string) => void;
  disabled?: boolean;
  highlight?: 'winner' | 'loser' | null;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onVote, disabled, highlight }) => {
  const cardClasses = 
    highlight === 'winner' ? 'border-green-500 border-2 shadow-green-300 shadow-lg' :
    highlight === 'loser' ? 'border-red-500 border-2 opacity-70' :
    '';

  return (
    <Card className={`flex flex-col w-full max-w-sm overflow-hidden transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
      <CardHeader className="p-0">
        <div className="relative w-full h-60">
          <Image
            src={community.imageUrl}
            alt={`Slika zajednice ${community.name}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="mosque building"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-2xl font-semibold mb-2 text-center text-primary-foreground bg-primary py-2 rounded-t-md -mx-6 px-6">
          {community.name}
        </CardTitle>
        <div className="text-center mt-4">
          <p className="text-lg">
            <span className="font-semibold">ELO:</span> {community.elo}
          </p>
        </div>
      </CardContent>
      {onVote && (
        <CardFooter className="p-4">
          <Button
            onClick={() => onVote(community.id)}
            disabled={disabled}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-transform transform hover:scale-105"
            aria-label={`Glasaj za ${community.name}`}
          >
            <ThumbsUp className="mr-2 h-5 w-5" />
            Glasaj za {community.name}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CommunityCard;
