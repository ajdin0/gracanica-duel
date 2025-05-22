
import { getCommunityById } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface CommunityDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CommunityDetailPage({ params }: CommunityDetailPageProps) {
  const community = await getCommunityById(params.id);

  if (!community) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/zajednice" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Nazad na sve zajednice
            </Button>
          </Link>
        </div>

        <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">
            {community.name}
          </h1>

          {community.detailsImageUrl && (
            <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-md overflow-hidden mb-6 shadow">
              <Image
                src={community.detailsImageUrl}
                alt={`Detaljna slika zajednice ${community.name}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="community detail landscape"
              />
            </div>
          )}
          
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-foreground">
            <p className="text-muted-foreground text-center mb-1">ELO: {community.elo} | Pobjede: {community.wins} | Porazi: {community.losses}</p>
            <hr className="my-4"/>
            <h2 className="text-2xl font-semibold text-primary mt-6 mb-3">O zajednici</h2>
            <p>
              {community.description || 'Nema dostupnog detaljnog opisa za ovu zajednicu.'}
            </p>
            {/* You can add more structured content here later if available */}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

// Optional: Generate static paths if you know all community IDs at build time
// This can improve performance but requires a rebuild if communities change often.
// export async function generateStaticParams() {
//   const communities = await getAllCommunities(); // Assuming you have this action or direct store access
//   return communities.map((community) => ({
//     id: community.id,
//   }));
// }
