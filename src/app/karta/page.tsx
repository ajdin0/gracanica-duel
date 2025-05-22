
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Sparkles, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function KartaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4 text-center">
          Interaktivna Karta Gračanice
        </h1>
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl">
          Uskoro stiže moderna i zanimljiva karta naših mjesnih zajednica! Planiramo prikazati ključne tačke i znamenitosti kako biste lakše istražili ljepote Gračanice.
        </p>

        <div className="w-full max-w-4xl p-1">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-2xl border-2 border-primary/20 bg-muted/20">
            <Image
              src="https://placehold.co/1200x675.png"
              alt="Placeholder Karta regije Gračanica"
              layout="fill"
              objectFit="cover"
              data-ai-hint="modern map gračanica"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col items-center justify-center p-8 text-center">
              <Sparkles className="w-16 h-16 text-accent mb-4" />
              <h2 className="text-4xl font-bold text-white mb-2 shadow-hard">Velika Mapa Uskoro!</h2>
              <p className="text-xl text-gray-200 shadow-hard">Pripremamo nešto posebno za vas.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12 w-full max-w-4xl">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-primary">
                <MapPin className="mr-3 h-6 w-6" />
                Šta Planiramo?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>Želimo stvoriti kartu koja nije samo funkcionalna, već i vizualno privlačna.</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Jasne granice mjesnih zajednica.</li>
                <li>Istaknute važne znamenitosti i objekti.</li>
                <li>Moderan i čist dizajn.</li>
                <li>Mogućnost interakcije za više informacija.</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-primary">
                <Landmark className="mr-3 h-6 w-6" />
                Vaš Doprinos?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>Imate ideju za znamenitost koju bismo trebali uključiti? </p>
              <p>Slobodno nam javite koje lokacije smatrate važnim za vašu zajednicu! Vaše sugestije pomoći će nam da karta bude što bolja i korisnija za sve.</p>
              <p className="font-semibold">Kontaktirajte nas sa prijedlozima!</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

    