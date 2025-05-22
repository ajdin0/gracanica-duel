
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { login } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

const REQUIRED_CLICKS = 5;
const MAX_CLICK_INTERVAL_MS = 1000; // Changed back to 1 second (1000ms)

const AdminLoginButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleShieldClick = () => {
    if (isDialogOpen) return; // Don't process clicks if dialog is already open

    const currentTime = Date.now();

    if (currentTime - lastClickTime > MAX_CLICK_INTERVAL_MS) {
      // If too much time has passed since the last click, or if it's the first click
      setClickCount(1);
    } else {
      // Otherwise, increment the count
      setClickCount(prevCount => prevCount + 1);
    }
    setLastClickTime(currentTime);
  };

  useEffect(() => {
    if (clickCount === REQUIRED_CLICKS) {
      setPasswordInput(''); // Clear password input before opening dialog
      setIsDialogOpen(true);
      setClickCount(0); // Reset for next time
      setLastClickTime(0); // Reset time
    }
  }, [clickCount]); // Removed setIsDialogOpen as it's a setter and doesn't need to be a dependency

  const handleAdminLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await login(passwordInput);
      if (result.success) {
        toast({
          title: 'Prijava uspješna!',
          description: 'Preusmjeravanje na admin panel...',
        });
        router.push('/admin');
        setIsDialogOpen(false); // Close dialog on success
        setPasswordInput(''); 
      } else {
        toast({
          variant: 'destructive',
          title: 'Prijava neuspješna',
          description: result.message || 'Netačna lozinka ili je došlo do greške.',
        });
        setPasswordInput(''); // Clear password input on failure to allow re-entry
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Došlo je do neočekivane greške prilikom prijave.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [passwordInput, router, toast]);

  const handleSubmitPassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordInput.trim()) {
      handleAdminLogin();
    } else {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Molimo unesite lozinku.',
      });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleShieldClick}
        className="ml-2 p-1 h-6 w-6 hover:bg-transparent cursor-default" // Added cursor-default and ensured hover:bg-transparent
        aria-label="Admin Panel Access"
      >
        <Shield className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
            // If dialog is closed (e.g., by "Odustani" or 'X'), reset the click sequence
            setPasswordInput(''); 
            setClickCount(0); 
            setLastClickTime(0);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Prijava</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password-admin" className="text-right">
                  Lozinka
                </Label>
                <Input
                  id="password-admin"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="col-span-3"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Odustani
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Prijavljujem...' : 'Prijavi se'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminLoginButton;
