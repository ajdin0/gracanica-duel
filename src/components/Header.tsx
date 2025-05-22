
import React from 'react';
import { Swords } from 'lucide-react';
import { ThemeToggleButton } from './ThemeToggleButton'; // Added import

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 sm:py-6 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Swords className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 text-primary-foreground" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Gračanica Duel
          </h1>
        </div>
        <ThemeToggleButton />
      </div>
    </header>
  );
};

export default Header;
