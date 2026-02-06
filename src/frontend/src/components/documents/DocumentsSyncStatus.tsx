import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import type { QueuedOperation } from '../../hooks/useDocumentsOfflineQueue';

interface DocumentsSyncStatusProps {
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  queue: QueuedOperation[];
  onRetry: (id: string) => void;
}

export default function DocumentsSyncStatus({
  isOnline,
  pendingCount,
  failedCount,
  queue,
  onRetry,
}: DocumentsSyncStatusProps) {
  const failedOps = queue.filter((op) => op.status === 'failed');

  if (isOnline && pendingCount === 0 && failedCount === 0) {
    return null;
  }

  return (
    <Card className={isOnline ? 'border-primary/50' : 'border-warning/50'}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-primary mt-0.5" />
            ) : (
              <WifiOff className="h-5 w-5 text-warning mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                {pendingCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {pendingCount} pending
                  </Badge>
                )}
                {failedCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {failedCount} failed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isOnline
                  ? pendingCount > 0
                    ? 'Syncing queued operations...'
                    : 'All changes synced'
                  : 'Changes will sync when connection is restored'}
              </p>
            </div>
          </div>
        </div>

        {failedOps.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-destructive">Failed Operations:</p>
            {failedOps.map((op) => (
              <div
                key={op.id}
                className="flex items-center justify-between rounded-md bg-destructive/10 p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {op.type === 'upload' ? 'Upload' : 'Delete'}: {op.data?.name || 'Document'}
                  </p>
                  {op.error && (
                    <p className="text-xs text-muted-foreground mt-1">{op.error}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(op.id)}
                  disabled={!isOnline}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
