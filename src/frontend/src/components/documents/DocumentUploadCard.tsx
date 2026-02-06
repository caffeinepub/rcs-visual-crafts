import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import { useAuthorization } from '../../hooks/useAuthorization';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
};

interface DocumentUploadCardProps {
  onUpload: (
    name: string,
    blob: ExternalBlob,
    description: string,
    type: string,
    author: string,
    size: bigint,
    fileType: string
  ) => Promise<void>;
}

export default function DocumentUploadCard({ onUpload }: DocumentUploadCardProps) {
  const { userProfile } = useAuthorization();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Only PDF, Word, and Excel documents are allowed');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const fileType = TYPE_LABELS[file.type] || 'Document';
      const author = userProfile?.name || 'Unknown';

      await onUpload(
        file.name,
        blob,
        description,
        'document',
        author,
        BigInt(file.size),
        fileType
      );

      // Reset form
      setFile(null);
      setDescription('');
      setUploadProgress(0);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload PDF, Word, or Excel documents (max 2MB per file)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-input">Select File</Label>
            <Input
              id="file-input"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add notes about this document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/50 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {uploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={!file || uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
