
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Community } from '@/types';
import { adminUpdateCommunityStats, getAdminCommunities } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Pencil, Save, RefreshCw, Ban } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EditableCommunity extends Community {
  isEditing?: boolean;
  // Store original values in case of cancel
  originalElo?: number;
  originalWins?: number;
  originalLosses?: number;
  originalGamesPlayed?: number;
}

interface AdminDashboardPageProps {
  initialCommunities: Community[];
}

export default function AdminDashboardPage({ initialCommunities }: AdminDashboardPageProps) {
  const [communities, setCommunities] = useState<EditableCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const mapToEditable = useCallback((comm: Community[]): EditableCommunity[] => {
    return comm.map(c => ({
      ...c,
      isEditing: false,
      originalElo: c.elo,
      originalWins: c.wins,
      originalLosses: c.losses,
      originalGamesPlayed: c.gamesPlayed,
    }));
  }, []);

  useEffect(() => {
    setCommunities(mapToEditable(initialCommunities));
  }, [initialCommunities, mapToEditable]);

  const handleEdit = (id: string) => {
    setCommunities(prev =>
      prev.map(c =>
        c.id === id ? { 
          ...c, 
          isEditing: true,
          // Store current values as original for potential cancel
          originalElo: c.elo,
          originalWins: c.wins,
          originalLosses: c.losses,
          originalGamesPlayed: c.gamesPlayed,
        } : c
      )
    );
  };

  const handleCancelEdit = (id: string) => {
    setCommunities(prev =>
      prev.map(c =>
        c.id === id ? { 
          ...c, 
          isEditing: false,
          // Restore original values
          elo: c.originalElo !== undefined ? c.originalElo : c.elo,
          wins: c.originalWins !== undefined ? c.originalWins : c.wins,
          losses: c.originalLosses !== undefined ? c.originalLosses : c.losses,
          gamesPlayed: c.originalGamesPlayed !== undefined ? c.originalGamesPlayed : c.gamesPlayed,
        } : c
      )
    );
  };

  const handleInputChange = (id: string, field: keyof Community, value: string) => {
    const numValue = parseInt(value, 10);
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updatedCommunity = { ...c, [field]: isNaN(numValue) ? 0 : numValue };
          // If wins or losses are changed, update gamesPlayed
          if (field === 'wins' || field === 'losses') {
            updatedCommunity.gamesPlayed = (field === 'wins' ? numValue : c.wins) + (field === 'losses' ? numValue : c.losses);
          }
          return updatedCommunity;
        }
        return c;
      })
    );
  };

  const handleSave = async (id: string) => {
    const communityToSave = communities.find(c => c.id === id);
    if (!communityToSave) return;

    setIsLoading(true);
    try {
      const result = await adminUpdateCommunityStats(
        id,
        communityToSave.elo,
        communityToSave.wins,
        communityToSave.losses,
        communityToSave.gamesPlayed
      );

      if (result.success) {
        toast({ title: "Uspjeh", description: `Statistika za ${communityToSave.name} je ažurirana.` });
        setCommunities(prev => prev.map(c => (c.id === id ? { ...c, isEditing: false } : c)));
        router.refresh(); // Re-fetch server data to ensure consistency
      } else {
        toast({ variant: "destructive", title: "Greška", description: result.message || "Nije uspjelo ažuriranje." });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({ variant: "destructive", title: "Greška", description: "Došlo je do neočekivane greške." });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const updatedCommunities = await getAdminCommunities();
      setCommunities(mapToEditable(updatedCommunities));
      toast({ title: "Lista osvježena", description: "Podaci o zajednicama su ponovo učitani." });
    } catch (error) {
      toast({ variant: "destructive", title: "Greška pri osvježavanju", description: "Nije moguće učitati podatke." });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (initialCommunities.length === 0 && !isLoading) {
    return (
        <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">Nema zajednica za prikaz.</p>
            <Button onClick={refreshList} variant="outline" disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" /> Osvježi Listu
                {isLoading && <LoadingSpinner size={16} className="ml-2" />}
            </Button>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={refreshList} variant="outline" disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Osvježi Listu
          {isLoading && <LoadingSpinner size={16} className="ml-2" />}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Uredi Statistiku Zajednica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv</TableHead>
                  <TableHead className="text-right">ELO</TableHead>
                  <TableHead className="text-right">Pobjede</TableHead>
                  <TableHead className="text-right">Porazi</TableHead>
                  <TableHead className="text-right">Odigrano</TableHead>
                  <TableHead className="text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communities.map(community => (
                  <TableRow key={community.id}>
                    <TableCell className="font-medium">{community.name}</TableCell>
                    <TableCell className="text-right">
                      {community.isEditing ? (
                        <Input
                          type="number"
                          value={community.elo}
                          onChange={e => handleInputChange(community.id, 'elo', e.target.value)}
                          className="max-w-20 text-right mx-auto sm:mx-0 ml-auto"
                          disabled={isLoading}
                        />
                      ) : (
                        community.elo
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {community.isEditing ? (
                        <Input
                          type="number"
                          value={community.wins}
                          onChange={e => handleInputChange(community.id, 'wins', e.target.value)}
                          className="max-w-20 text-right mx-auto sm:mx-0 ml-auto"
                          disabled={isLoading}
                        />
                      ) : (
                        community.wins
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {community.isEditing ? (
                        <Input
                          type="number"
                          value={community.losses}
                          onChange={e => handleInputChange(community.id, 'losses', e.target.value)}
                          className="max-w-20 text-right mx-auto sm:mx-0 ml-auto"
                          disabled={isLoading}
                        />
                      ) : (
                        community.losses
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {community.isEditing ? (
                        <Input
                          type="number"
                          value={community.gamesPlayed}
                          onChange={e => handleInputChange(community.id, 'gamesPlayed', e.target.value)}
                          className="max-w-20 text-right mx-auto sm:mx-0 ml-auto"
                          disabled={isLoading}
                        />
                      ) : (
                        community.gamesPlayed
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {community.isEditing ? (
                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => handleSave(community.id)} size="sm" disabled={isLoading}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleCancelEdit(community.id)} variant="outline" size="sm" disabled={isLoading}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleEdit(community.id)} variant="outline" size="sm" disabled={isLoading}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dummy Card components if not globally available or to avoid circular dependency if needed
// In a real ShadCN setup, these would come from @/components/ui/card
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`border rounded-lg shadow-sm bg-card text-card-foreground ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 flex flex-col space-y-1.5 ${className}`}>
    {children}
  </div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);
