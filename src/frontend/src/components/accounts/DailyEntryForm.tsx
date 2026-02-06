import { useState } from 'react';
import { useAddDailyEntry } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface DailyEntryFormProps {
  entryType: 'Income' | 'Expense';
  onClose: () => void;
}

export default function DailyEntryForm({ entryType, onClose }: DailyEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addEntry = useAddDailyEntry();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = 'Date is required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addEntry.mutateAsync({
        entryType,
        date: BigInt(new Date(date).getTime()),
        amount: parseFloat(amount),
        paymentType: paymentMode,
        description: description.trim(),
        notes: notes.trim(),
        currency: 'INR',
        expenseType: '',
        incomeType: '',
        bankAccount: '',
        receiptNumber: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to add entry:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add {entryType} Entry</DialogTitle>
            <DialogDescription>Enter the transaction details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
              {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
              {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount}</p>}
            </div>
            <div>
              <Label htmlFor="paymentMode">Payment Mode *</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addEntry.isPending}>
              {addEntry.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add {entryType}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
