import { useState } from 'react';
import { useAssignUserRole } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, UserPlus } from 'lucide-react';
import { UserRole } from '../../backend';

export default function AllowlistManager() {
  const [principal, setPrincipal] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.user);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const assignRole = useAssignUserRole();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!principal.trim()) {
      setError('Principal ID is required');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      await assignRole.mutateAsync({ principal: principal.trim(), role });
      setPrincipal('');
      setRole(UserRole.user);
      setShowConfirm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to assign role');
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage User Access</CardTitle>
          <CardDescription>
            Add or update user permissions by entering their Principal ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="principal">Principal ID</Label>
              <Input
                id="principal"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="Enter user's principal ID"
                className="mt-1 font-mono text-xs"
              />
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.user}>User</SelectItem>
                  <SelectItem value={UserRole.admin}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={assignRole.isPending}>
              {assignRole.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Assign Role
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to assign the <strong>{role}</strong> role to this principal?
              This will grant them access to the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
