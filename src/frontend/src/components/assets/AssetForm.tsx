import { useState } from 'react';
import { useAddAsset } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface AssetFormProps {
  onClose: () => void;
}

export default function AssetForm({ onClose }: AssetFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [supplier, setSupplier] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addAsset = useAddAsset();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addAsset.mutateAsync({
        name: name.trim(),
        type: type.trim(),
        supplier: supplier.trim(),
        amountInCurrency: parseFloat(value) || 0,
        currency: 'INR',
        description: description.trim(),
        purchaseDate: BigInt(Date.now()),
        lifespan: 0n,
      });
      onClose();
    } catch (error) {
      console.error('Failed to add asset:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>Enter the asset details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Camera, Printer"
                className="mt-1"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Asset type"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Supplier name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="value">Value (Optional)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Asset description"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addAsset.isPending}>
              {addAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
