
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Community } from '@/types';
import { adminUpdateCommunityStats, getAdminCommunities, adminResetAllCommunityStats } from '@/app/admin/actions';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Pencil, Save, RefreshCw, Ban, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditableCommunity extends Community {
  isEditing?: boolean;
  originalElo?: number;
  originalWins?: number;
  originalLosses?: number;
  originalGamesPlayed?: number;
}

interface AdminDashboardPageProps {
  initialCommunities: Community[];
}

export default function AdminDashboardPage({ initialCommunities: ssrCommunities }: AdminDashboardPageProps) {
  const [communities, setCommunities] = useState<EditableCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
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

  const fetchAndSetCommunities = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedCommunitiesFromServer = await getAdminCommunities();
      setCommunities(mapToEditable(updatedCommunitiesFromServer));
    } catch (error) {
      console.error("Error fetching admin communities:", error);
      toast({ variant: "destructive", title: "Greška pri učitavanju", description: "Nije moguće učitati podatke o zajednicama." });
      setCommunities(mapToEditable(ssrCommunities)); // Fallback to SSR data on fetch error
    } finally {
      setIsLoading(false);
    }
  }, [mapToEditable, toast, ssrCommunities]);

  useEffect(() => {
    // Use SSR data for initial render, then fetch fresh data on client
    setCommunities(mapToEditable(ssrCommunities));
    fetchAndSetCommunities();
  }, [fetchAndSetCommunities, ssrCommunities, mapToEditable]);

  const handleEdit = (id: string) => {
    setCommunities(prev =>
      prev.map(c =>
        c.id === id ? { 
          ...c, 
          isEditing: true,
          originalElo: c.elo,
          originalWins: c.wins,
          originalLosses: c.losses,
          originalGamesPlayed: c.gamesPlayed,
        } : { ...c, isEditing: false }
      )
    );
  };

  const handleCancelEdit = (id: string) => {
    setCommunities(prev =>
      prev.map(c =>
        c.id === id ? { 
          ...c, 
          isEditing: false,
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
          const currentFieldValue = c[field] as number;
          const newFieldValue = isNaN(numValue) ? currentFieldValue : numValue < 0 ? 0 : numValue; // Prevent negative numbers
          const updatedCommunity = { ...c, [field]: newFieldValue };
          
          // Automatically update gamesPlayed if wins or losses change, unless gamesPlayed itself is being edited
          if (field === 'wins' || field === 'losses') {
             const wins = field === 'wins' ? newFieldValue : c.wins;
             const losses = field === 'losses' ? newFieldValue : c.losses;
             updatedCommunity.gamesPlayed = wins + losses;
          } else if (field === 'gamesPlayed') {
            // If gamesPlayed is edited directly, ensure wins + losses don't exceed it (or adjust them proportionally)
            // For simplicity, we'll let gamesPlayed be set independently here.
            // A more complex validation could be added if needed.
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
        await fetchAndSetCommunities(); 
        router.refresh(); 
      } else {
        toast({ variant: "destructive", title: "Greška", description: result.message || "Nije uspjelo ažuriranje." });
        await fetchAndSetCommunities(); 
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({ variant: "destructive", title: "Greška", description: "Došlo je do neočekivane greške." });
      await fetchAndSetCommunities(); 
    } finally {
      // setIsLoading(false); fetchAndSetCommunities handles its own isLoading
    }
  };

  const handleResetAllStats = async () => {
    setIsResetting(true);
    try {
      const result = await adminResetAllCommunityStats();
      if (result.success) {
        toast({ title: "Uspjeh", description: "Sve statistike zajednica su resetirane na početne vrijednosti." });
        await fetchAndSetCommunities();
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Greška pri resetiranju", description: result.message || "Nije uspjelo resetiranje statistika." });
      }
    } catch (error) {
      console.error("Error resetting all stats:", error);
      toast({ variant: "destructive", title: "Greška", description: "Došlo je do neočekivane greške prilikom resetiranja." });
    } finally {
      setIsResetting(false);
    }
  };

  const refreshListButtonAction = useCallback(async () => {
    await fetchAndSetCommunities();
    toast({ title: "Lista osvježena", description: "Podaci o zajednicama su ponovo učitani." });
  }, [fetchAndSetCommunities, toast]);
  
  if (isLoading && communities.length === 0 && !communities.some(c => c.isEditing)) {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <LoadingSpinner size={48} />
            <p className="mt-4 text-lg text-muted-foreground">Učitavanje administrativnog panela...</p>
        </div>
    );
  }

  if (communities.length === 0 && !isLoading) {
    return (
        <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">Nema zajednica za prikaz.</p>
            <Button onClick={refreshListButtonAction} variant="outline" disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" /> Osvježi Listu
                {isLoading && <LoadingSpinner size={16} className="ml-2" />}
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-end gap-2 items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isLoading || isResetting}>
              <AlertTriangle className="mr-2 h-4 w-4" /> Resetuj Sve Statistike
              {isResetting && <LoadingSpinner size={16} className="ml-2" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Potvrdi Resetiranje</AlertDialogTitle>
              <AlertDialogDescription>
                Da li ste sigurni da želite resetirati statistike SVIH zajednica na početne vrijednosti? Ova akcija se ne može poništiti.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isResetting}>Odustani</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetAllStats} disabled={isResetting} className="bg-destructive hover:bg-destructive/90">
                {isResetting ? <LoadingSpinner size={16} /> : "Resetuj"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={refreshListButtonAction} variant="outline" disabled={isLoading || isResetting}>
          <RefreshCw className="mr-2 h-4 w-4" /> Osvježi Listu
          {(isLoading && !isResetting) && <LoadingSpinner size={16} className="ml-2" />}
        </Button>
      </div>
      <UICard>
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
                          disabled={isLoading && community.isEditing}
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
                          disabled={isLoading && community.isEditing}
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
                          disabled={isLoading && community.isEditing}
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
                          disabled={(isLoading && community.isEditing) || true} // Make gamesPlayed always readonly in edit mode
                          readOnly // Ensure it's clear this is auto-calculated or for display
                        />
                      ) : (
                        community.gamesPlayed
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {community.isEditing ? (
                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => handleSave(community.id)} size="sm" disabled={isLoading && community.isEditing}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleCancelEdit(community.id)} variant="outline" size="sm" disabled={isLoading && community.isEditing}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleEdit(community.id)} variant="outline" size="sm" disabled={isLoading || communities.some(c => c.isEditing && c.id !== community.id)}>
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
      </UICard>
    </div>
  );
}

