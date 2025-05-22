
import React from 'react';
import { Facebook, Twitter, MessageSquare, Share2 } from 'lucide-react'; // Added Share2 for Viber

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [shareUrl, setShareUrl] = React.useState('https://gracanica-duel.vercel.app');
  const shareTitle = "Gračanica Duel - Glasajte za omiljenu zajednicu!";

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const viberShareText = encodeURIComponent(`${shareTitle} ${shareUrl}`);

  return (
    <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        {/* AdminLoginButton can be added here if needed later */}
        {/* <div className="mb-4"> */}
        {/*   <AdminLoginButton /> */}
        {/* </div> */}
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
        {/* 
          If admin panel is not active, you might want to remove this link or comment it out.
          The AdminLoginButton is a more interactive way if admin features are re-enabled.
        */}
        {/* <p className="text-xs mt-2">
          <a href="/admin" className="hover:underline">Admin Panel</a>
        </p> */}
      </div>
    </footer>
  );
};

export default Footer;
