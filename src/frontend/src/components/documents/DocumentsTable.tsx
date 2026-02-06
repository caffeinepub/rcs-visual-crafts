import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Trash2, FileText, Loader2 } from 'lucide-react';
import type { Document } from '../../backend';

interface DocumentsTableProps {
  documents: Document[];
  isLoading: boolean;
  onDelete: (id: bigint) => Promise<void>;
}

export default function DocumentsTable({ documents, isLoading, onDelete }: DocumentsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDownload = (doc: Document) => {
    const url = doc.blob.getDirectURL();
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (doc: Document) => {
    setSelectedDocument(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;

    setDeleting(true);
    try {
      await onDelete(selectedDocument.id);
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return 'N/A';
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: bigint) => {
    const kb = Number(bytes) / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No documents yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload your first document to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id.toString()}>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell>{doc.fileType}</TableCell>
                <TableCell>{formatSize(doc.size)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(doc.uploadedAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">{doc.author}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDocument?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
