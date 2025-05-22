
import { redirect } from 'next/navigation';
import { checkAdminAuth, getAdminCommunities, logout } from './actions';
import AdminDashboardPage from '@/components/admin/AdminDashboardPage';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import type { Community } from '@/types';

export default async function AdminPage() {
  const isAuthenticated = await checkAdminAuth();

  if (!isAuthenticated) {
    redirect('/'); // Redirect to main page if not authenticated
  }

  let initialCommunities: Community[] = [];
  try {
    initialCommunities = await getAdminCommunities();
  } catch (error) {
    console.error("Failed to fetch communities for admin dashboard:", error);
    // Optionally, you could pass an error message to the client component
  }
  

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Admin Panel - Gračanica Duel</h1>
        <form action={logout}>
          <Button type="submit" variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Odjavi se
          </Button>
        </form>
      </header>
      <AdminDashboardPage initialCommunities={initialCommunities} />
    </div>
  );
}
