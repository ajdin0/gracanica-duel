
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function KartaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8">
          Karta Mjesnih Zajednica
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Interaktivna karta zajednica Gračanice će biti dostupna uskoro.
        </p>
        <div className="w-full max-w-3xl aspect-[16/9] relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
           <Image
            src="https://placehold.co/1000x600.png"
            alt="Placeholder karta regije Gračanica"
            layout="fill"
            objectFit="contain"
            data-ai-hint="map bosnia"
          />
          <p className="absolute text-xl text-foreground/50">Uskoro...</p>
        </div>
         <p className="text-sm text-muted-foreground mt-6">
          Radimo na prikupljanju podataka za prikaz interaktivne karte.
        </p>
      </main>
      <Footer />
    </div>
  );
}
