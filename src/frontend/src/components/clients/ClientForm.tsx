import { useState } from 'react';
import { useAddClient } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface ClientFormProps {
  onClose: () => void;
}

export default function ClientForm({ onClose }: ClientFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addClient = useAddClient();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addClient.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        contactPerson: contactPerson.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Enter the client details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client name"
                className="mt-1"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 1234567890"
                className="mt-1"
              />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Client address"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addClient.isPending}>
              {addClient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
