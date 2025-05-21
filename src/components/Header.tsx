
import React from 'react';
import { Swords } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-6 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <Swords className="h-10 w-10 mr-3 text-primary-foreground" />
        <h1 className="text-4xl font-bold tracking-tight">
          Gračanica Duel
        </h1>
      </div>
    </header>
  );
};

export default Header;
