import { useState, useEffect } from 'react';
import { useDocuments, useAddDocument, useDeleteDocument } from '../hooks/useQueries';
import { useDocumentsOfflineQueue } from '../hooks/useDocumentsOfflineQueue';
import { getCachedDocuments, setCachedDocuments } from '../utils/documentsCache';
import DocumentUploadCard from '../components/documents/DocumentUploadCard';
import DocumentsTable from '../components/documents/DocumentsTable';
import DocumentsSyncStatus from '../components/documents/DocumentsSyncStatus';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const { data: documents, isLoading, error } = useDocuments();
  const addDocumentMutation = useAddDocument();
  const deleteDocumentMutation = useDeleteDocument();
  const offlineQueue = useDocumentsOfflineQueue();

  const [displayDocuments, setDisplayDocuments] = useState(getCachedDocuments());

  // Update cache and display when online data arrives
  useEffect(() => {
    if (documents) {
      setCachedDocuments(documents);
      setDisplayDocuments(documents);
    }
  }, [documents]);

  // Sync queued operations when online
  useEffect(() => {
    if (!offlineQueue.isOnline) return;

    const syncQueue = async () => {
      for (const op of offlineQueue.queue) {
        if (op.status !== 'pending') continue;

        offlineQueue.updateOperationStatus(op.id, 'syncing');

        try {
          if (op.type === 'upload' && op.data) {
            const { name, fileData, description, type, author, size, fileType } = op.data;
            if (!name || !fileData || !description || !type || !author || !size || !fileType) {
              throw new Error('Missing upload data');
            }

            // Decode base64 back to bytes
            const binaryString = atob(fileData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = ExternalBlob.fromBytes(bytes);
            await addDocumentMutation.mutateAsync({
              name,
              blob,
              description,
              type,
              author,
              size,
              fileType,
            });

            offlineQueue.updateOperationStatus(op.id, 'succeeded');
            toast.success('Document uploaded successfully');
          } else if (op.type === 'delete' && op.data?.documentId) {
            await deleteDocumentMutation.mutateAsync(op.data.documentId);
            offlineQueue.updateOperationStatus(op.id, 'succeeded');
            toast.success('Document deleted successfully');
          }
        } catch (err: any) {
          offlineQueue.updateOperationStatus(op.id, 'failed', err.message || 'Sync failed');
          toast.error(`Failed to sync: ${err.message || 'Unknown error'}`);
        }
      }

      // Clean up succeeded operations after a delay
      setTimeout(() => {
        offlineQueue.clearSucceeded();
      }, 2000);
    };

    syncQueue();
  }, [offlineQueue.isOnline, offlineQueue.queue.length]);

  const handleUpload = async (
    name: string,
    blob: ExternalBlob,
    description: string,
    type: string,
    author: string,
    size: bigint,
    fileType: string
  ) => {
    if (offlineQueue.isOnline) {
      try {
        await addDocumentMutation.mutateAsync({
          name,
          blob,
          description,
          type,
          author,
          size,
          fileType,
        });
        toast.success('Document uploaded successfully');
      } catch (err: any) {
        toast.error(`Upload failed: ${err.message || 'Unknown error'}`);
        throw err;
      }
    } else {
      await offlineQueue.enqueueUpload(name, blob, description, type, author, size, fileType);
      toast.info('Document queued for upload when online');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (offlineQueue.isOnline) {
      try {
        await deleteDocumentMutation.mutateAsync(id);
        toast.success('Document deleted successfully');
      } catch (err: any) {
        toast.error(`Delete failed: ${err.message || 'Unknown error'}`);
        throw err;
      }
    } else {
      offlineQueue.enqueueDelete(id);
      toast.info('Delete queued for when online');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Store and manage PDF, Word, and Excel documents
          </p>
        </div>
      </div>

      <DocumentsSyncStatus
        isOnline={offlineQueue.isOnline}
        pendingCount={offlineQueue.pendingCount}
        failedCount={offlineQueue.failedCount}
        queue={offlineQueue.queue}
        onRetry={offlineQueue.retryOperation}
      />

      <DocumentUploadCard onUpload={handleUpload} />

      <DocumentsTable
        documents={displayDocuments}
        isLoading={isLoading && !displayDocuments.length}
        onDelete={handleDelete}
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error loading documents: {error.message}
          </p>
        </div>
      )}
    </div>
  );
}
