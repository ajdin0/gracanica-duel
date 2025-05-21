
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Gračanica Duel. Sva prava zadržana.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
