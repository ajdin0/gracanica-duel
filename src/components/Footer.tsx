
"use client";
import React from 'react';
import { Facebook, Twitter, MessageSquare, Share2 } from 'lucide-react';
import AdminLoginButton from './AdminLoginButton'; // Import the button

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gracanica-duel.vercel.app';
  const shareTitle = "Gračanica Duel - Glasajte za omiljenu zajednicu!";

  const viberShareText = encodeURIComponent(`${shareTitle} ${APP_URL}`);

  return (
    <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-4 mb-4">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Podijeli na Facebooku"
            className="text-secondary-foreground hover:text-primary transition-colors"
          >
            <Facebook size={24} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Podijeli na Twitteru"
            className="text-secondary-foreground hover:text-primary transition-colors"
          >
            <Twitter size={24} />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + APP_URL)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Podijeli na WhatsAppu"
            className="text-secondary-foreground hover:text-primary transition-colors"
          >
            <MessageSquare size={24} />
          </a>
          <a
            href={`viber://forward?text=${viberShareText}`}
            aria-label="Podijeli na Viberu"
            className="text-secondary-foreground hover:text-primary transition-colors"
          >
            <Share2 size={24} />
          </a>
        </div>
        <div className="flex items-center justify-center text-sm">
          <span>&copy; {currentYear} Gračanica Duel. Sva prava zadržana.</span>
          <AdminLoginButton /> 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
