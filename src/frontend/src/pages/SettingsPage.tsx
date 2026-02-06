import { useAuthorization } from '../hooks/useAuthorization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import AllowlistManager from '../components/settings/AllowlistManager';

export default function SettingsPage() {
  const { currentPrincipal, userProfile, isAdmin } = useAuthorization();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Name:</span>
            <p className="text-base">{userProfile?.name || 'Not set'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Principal ID:</span>
            <p className="break-all font-mono text-xs">{currentPrincipal}</p>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You have administrator privileges. You can manage user access below.
            </AlertDescription>
          </Alert>
          <AllowlistManager />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>RCS Visual Crafts Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This application helps manage clients, orders, accounts, and assets for RCS Visual Crafts.
            For support or questions, contact your system administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
