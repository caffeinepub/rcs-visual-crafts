import { useState } from 'react';
import { useAssets } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AssetForm from '../components/assets/AssetForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AssetsPage() {
  const { data: assets = [], isLoading } = useAssets();
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Assets</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showAddDialog && <AssetForm onClose={() => setShowAddDialog(false)} />}
    </div>
  );
}
