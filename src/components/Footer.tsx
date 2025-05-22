
"use client";
import React from 'react';
import { Facebook, Twitter, MessageSquare, Share2, Shield } from 'lucide-react'; // Added Shield
import AdminLoginButton from './AdminLoginButton'; // Assuming this is the button for admin login

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  // Use the canonical production URL for sharing. 
  // Ensure NEXT_PUBLIC_APP_URL is set in your Vercel environment variables for production.
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gracanica-duel.vercel.app';
  const shareTitle = "Gračanica Duel - Glasajte za omiljenu zajednicu!";

  const viberShareText = encodeURIComponent(`${shareTitle} ${APP_URL}`);

  return (
    <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <AdminLoginButton />
        </div>
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
            <Share2 size={24} /> {/* Using Share2 icon for Viber */}
          </a>
        </div>
        <p className="text-sm">
          &copy; {currentYear} Gračanica Duel. Sva prava zadržana.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
