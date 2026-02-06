import { useState, useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { ExternalBlob } from '../backend';

export interface QueuedOperation {
  id: string;
  type: 'upload' | 'delete';
  status: 'pending' | 'syncing' | 'failed' | 'succeeded';
  error?: string;
  data?: {
    name?: string;
    fileData?: string; // base64 encoded
    description?: string;
    type?: string;
    author?: string;
    size?: bigint;
    fileType?: string;
    documentId?: bigint;
  };
}

const QUEUE_STORAGE_KEY = 'documents_offline_queue';

export function useDocumentsOfflineQueue() {
  const [queue, setQueue] = useState<QueuedOperation[]>([]);
  const isOnline = useOnlineStatus();

  // Load queue from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setQueue(parsed);
      } catch (e) {
        console.error('Failed to parse offline queue:', e);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  const enqueueUpload = async (
    name: string,
    blob: ExternalBlob,
    description: string,
    type: string,
    author: string,
    size: bigint,
    fileType: string
  ) => {
    const bytes = await blob.getBytes();
    const base64 = btoa(String.fromCharCode(...bytes));
    
    const operation: QueuedOperation = {
      id: `upload-${Date.now()}-${Math.random()}`,
      type: 'upload',
      status: 'pending',
      data: {
        name,
        fileData: base64,
        description,
        type,
        author,
        size,
        fileType,
      },
    };

    setQueue((prev) => [...prev, operation]);
    return operation.id;
  };

  const enqueueDelete = (documentId: bigint) => {
    const operation: QueuedOperation = {
      id: `delete-${Date.now()}-${Math.random()}`,
      type: 'delete',
      status: 'pending',
      data: {
        documentId,
      },
    };

    setQueue((prev) => [...prev, operation]);
    return operation.id;
  };

  const updateOperationStatus = (
    id: string,
    status: QueuedOperation['status'],
    error?: string
  ) => {
    setQueue((prev) =>
      prev.map((op) => (op.id === id ? { ...op, status, error } : op))
    );
  };

  const removeOperation = (id: string) => {
    setQueue((prev) => prev.filter((op) => op.id !== id));
  };

  const retryOperation = (id: string) => {
    setQueue((prev) =>
      prev.map((op) =>
        op.id === id ? { ...op, status: 'pending' as const, error: undefined } : op
      )
    );
  };

  const clearSucceeded = () => {
    setQueue((prev) => prev.filter((op) => op.status !== 'succeeded'));
  };

  const pendingCount = queue.filter((op) => op.status === 'pending').length;
  const failedCount = queue.filter((op) => op.status === 'failed').length;
  const hasFailedOps = failedCount > 0;

  return {
    queue,
    isOnline,
    pendingCount,
    failedCount,
    hasFailedOps,
    enqueueUpload,
    enqueueDelete,
    updateOperationStatus,
    removeOperation,
    retryOperation,
    clearSucceeded,
  };
}
