
import React from 'react';
import AdminLoginButton from './AdminLoginButton'; // Assuming AdminLoginButton exists if admin features are re-enabled
import { Facebook, Twitter, MessageSquare } from 'lucide-react'; // Using MessageSquare for generic share or WhatsApp

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://gracanica-duel.vercel.app';
  const shareTitle = "Gračanica Duel - Glasajte za omiljenu zajednicu!";

  return (
    <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          {/* <AdminLoginButton /> */} {/* Conditionally render or remove if admin panel is not active */}
        </div>
        <div className="flex justify-center space-x-4 mb-4">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Podijeli na Facebooku"
            className="text-secondary-foreground hover:text-primary transition-colors"
          >
            <Facebook size={24} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Podijeli na Twitteru"
            className="text-secondary-foreground hover:text-primary transition-colors"
          >
            <Twitter size={24} />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Podijeli na WhatsAppu"
            className="text-secondary-foreground hover:text-primary transition-colors"
          >
            <MessageSquare size={24} /> {/* Using MessageSquare as a stand-in for WhatsApp if specific icon isn't available */}
          </a>
        </div>
        <p className="text-sm">
          &copy; {currentYear} Gračanica Duel. Sva prava zadržana.
        </p>
        <p className="text-xs mt-2">
          <a href="/admin" className="hover:underline">Admin Panel</a> {/* Simple link, relies on middleware for auth */}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
