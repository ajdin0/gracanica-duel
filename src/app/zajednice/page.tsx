
import Link from 'next/link';
import Image from 'next/image';
import { getAllCommunities } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function ZajednicePage() {
  const communities = await getAllCommunities();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8 text-center">
          Mjesne Zajednice Gračanice
        </h1>
        {communities && communities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.sort((a,b) => a.name.localeCompare(b.name)).map((community) => (
              <Card key={community.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <div className="relative w-full h-48">
                    <Image
                      src={community.imageUrl}
                      alt={`Slika zajednice ${community.name}`}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="community building"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow flex flex-col">
                  <CardTitle className="text-xl font-semibold mb-2 text-center">{community.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                    {community.description || `Saznajte više o mjesnoj zajednici ${community.name}.`}
                  </p>
                  <div className="mt-auto">
                    <Link href={`/zajednice/${community.id}`} passHref>
                      <Button className="w-full" variant="outline">Saznaj Više</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-lg">
            Nema dostupnih informacija o zajednicama.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
