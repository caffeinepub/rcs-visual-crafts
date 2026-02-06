import { useState } from 'react';
import { useAssets, useDeleteAsset } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import AssetForm from '../components/assets/AssetForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthorization } from '../hooks/useAuthorization';
import ConfirmDeleteDialog from '../components/common/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { getErrorMessage } from '../utils/errors';
import type { Asset } from '../backend';

export default function AssetsPage() {
  const { data: assets = [], isLoading } = useAssets();
  const { isAuthorized } = useAuthorization();
  const deleteAsset = useDeleteAsset();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      await deleteAsset.mutateAsync(assetToDelete.id);
      toast.success('Asset deleted successfully');
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Assets</h2>
        {isAuthorized && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No assets yet. Add your first asset to track your business equipment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  {isAuthorized && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id.toString()}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.type || '-'}</TableCell>
                    <TableCell>{asset.supplier || '-'}</TableCell>
                    <TableCell className="text-right">
                      {asset.amountInCurrency > 0
                        ? `₹${asset.amountInCurrency.toLocaleString('en-IN')}`
                        : '-'}
                    </TableCell>
                    {isAuthorized && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(asset)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showAddDialog && <AssetForm onClose={() => setShowAddDialog(false)} />}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        description={`Are you sure you want to delete "${assetToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deleteAsset.isPending}
      />
    </div>
  );
}
