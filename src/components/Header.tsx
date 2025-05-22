
import React from 'react';
import Link from 'next/link';
import { Swords, MapPinned, Users } from 'lucide-react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { Button } from './ui/button';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 sm:py-6 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Swords className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 text-primary-foreground group-hover:animate-pulse" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight group-hover:text-yellow-300 transition-colors">
            Gračanica Duel
          </h1>
        </Link>
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <Link href="/zajednice" passHref>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 px-2 sm:px-3">
              <Users className="mr-0 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Zajednice</span>
            </Button>
          </Link>
          <Link href="/mapa" passHref>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 px-2 sm:px-3">
              <MapPinned className="mr-0 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Mapa</span>
            </Button>
          </Link>
          <ThemeToggleButton />
        </nav>
      </div>
    </header>
  );
};

export default Header;
