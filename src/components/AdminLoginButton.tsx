
"use client";

import React, { useState, useCallback } from 'react';
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

const AdminLoginButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
        setIsDialogOpen(false);
        setPasswordInput(''); // Clear password on successful login
      } else {
        toast({
          variant: 'destructive',
          title: 'Prijava neuspješna',
          description: result.message || 'Netačna lozinka ili je došlo do greške.',
        });
        // Keep dialog open for retry, password field can remain for user convenience or be cleared
        // setPasswordInput(''); // Optionally clear password on failed attempt
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

  const handleOpenDialog = () => {
    setPasswordInput(''); // Clear password field when dialog is opened
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpenDialog} className="flex items-center">
        <Shield className="mr-2 h-4 w-4" /> Admin Panel
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setPasswordInput(''); // Clear password if dialog is closed for any reason (X, Esc, Odustani)
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
                <Button type="button" variant="outline"> {/* No need to clear password here, onOpenChange handles it */}
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
