
import Header from '@/components/Header';
import VotingArea from '@/components/VotingArea';
import Leaderboard from '@/components/Leaderboard';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <VotingArea />
        <Leaderboard />
      </main>
      <Footer />
    </div>
  );
}
