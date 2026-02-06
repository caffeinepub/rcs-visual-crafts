import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Edit2, Save, X, CheckCircle2, AlertCircle, HelpCircle, Info, ExternalLink } from 'lucide-react';
import { useApkDownloadInfo, useUpdateApkDownloadInfo } from '../../hooks/useApkDownloadInfo';
import { useApkLinkHealthCheck } from '../../hooks/useApkLinkHealthCheck';
import { useAuthorization } from '../../hooks/useAuthorization';
import { validateHttpUrl } from '../../utils/validateHttpUrl';
import { toast } from 'sonner';

export default function ApkDownloadSection() {
  const { isAdmin } = useAuthorization();
  const { data: apkInfo, isLoading } = useApkDownloadInfo();
  const updateMutation = useUpdateApkDownloadInfo();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editVersion, setEditVersion] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Prefer the stored url field when present; otherwise fall back to diskFile.getDirectURL()
  const downloadUrl = apkInfo?.url || apkInfo?.diskFile?.getDirectURL();
  
  // Health check for the current URL
  const { data: healthCheck, isLoading: healthCheckLoading } = useApkLinkHealthCheck(downloadUrl);

  const handleEdit = () => {
    setEditUrl(downloadUrl || '');
    setEditVersion(apkInfo?.version || '');
    setValidationError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationError(null);
  };

  const handleSave = async () => {
    const trimmedUrl = editUrl.trim();
    
    // Validate URL
    const validation = validateHttpUrl(trimmedUrl);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid URL');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        url: trimmedUrl,
        version: editVersion.trim() || 'Latest',
      });
      setIsEditing(false);
      setValidationError(null);
      toast.success('APK information updated successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save APK information';
      setValidationError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) {
      toast.error('Download URL is not available');
      return;
    }

    try {
      // Open in new tab for reliable cross-platform download
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      toast.success('Opening download link');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to open download link');
    }
  };

  const getHealthIcon = () => {
    if (!healthCheck) return null;
    
    switch (healthCheck.status) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'broken':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'unknown':
        return <HelpCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Android App</CardTitle>
          <CardDescription>Download the mobile application</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Android App</CardTitle>
        <CardDescription>Download the mobile application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!apkInfo && !isEditing && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The Android APK is not available yet. {isAdmin ? 'Click Edit to configure the download link.' : 'Please contact an administrator.'}
            </AlertDescription>
          </Alert>
        )}

        {apkInfo && !isEditing && (
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Version:</span>
              <p className="text-base">{apkInfo.version || 'Not specified'}</p>
            </div>

            {downloadUrl && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Download Link:</span>
                <div className="flex items-center gap-2">
                  <a 
                    href={downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate max-w-md"
                  >
                    {downloadUrl}
                  </a>
                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            )}

            {downloadUrl && (
              <div className="flex items-center gap-2">
                {healthCheckLoading ? (
                  <HelpCircle className="h-4 w-4 text-muted-foreground animate-pulse" />
                ) : (
                  getHealthIcon()
                )}
                <span className="text-sm text-muted-foreground">
                  {healthCheckLoading ? 'Checking link...' : healthCheck?.message || 'Status unknown'}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleDownload} 
                className="w-full sm:w-auto"
                disabled={!downloadUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download APK
              </Button>

              {isAdmin && (
                <Button onClick={handleEdit} variant="outline" className="w-full sm:w-auto">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        )}

        {isEditing && isAdmin && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Enter a stable, publicly reachable direct-download URL for the APK file. 
                The URL must be accessible from laptop browsers without authentication.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="apk-url">APK URL *</Label>
              <Input
                id="apk-url"
                type="url"
                placeholder="https://example.com/app.apk"
                value={editUrl}
                onChange={(e) => {
                  setEditUrl(e.target.value);
                  setValidationError(null);
                }}
                disabled={updateMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Must be a direct download link (HTTP or HTTPS)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apk-version">Version Label</Label>
              <Input
                id="apk-version"
                type="text"
                placeholder="v1.0.0"
                value={editVersion}
                onChange={(e) => setEditVersion(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={updateMutation.isPending || !editUrl.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline"
                disabled={updateMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isEditing && !isAdmin && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to edit APK information. Admin access required.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
