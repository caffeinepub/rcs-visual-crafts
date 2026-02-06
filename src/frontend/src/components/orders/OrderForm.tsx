import { useState } from 'react';
import { useAddOrder } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface OrderFormProps {
  clientId: bigint;
  onClose: () => void;
}

export default function OrderForm({ clientId, onClose }: OrderFormProps) {
  const [orderType, setOrderType] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addOrder = useAddOrder();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!orderType.trim()) newErrors.orderType = 'Order type is required';
    if (!orderDate) newErrors.orderDate = 'Order date is required';
    if (!deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
    if (!totalAmount || parseFloat(totalAmount) <= 0) newErrors.totalAmount = 'Valid total amount is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const total = parseFloat(totalAmount);
    const advance = parseFloat(advanceAmount) || 0;
    const balance = total - advance;

    try {
      await addOrder.mutateAsync({
        clientId,
        description: orderType.trim(),
        status,
        startDate: BigInt(new Date(orderDate).getTime()),
        dueDate: BigInt(new Date(deliveryDate).getTime()),
        amount: total,
        deposit: advance,
        remainingBalance: balance,
        currency: 'INR',
        invoiceNumber: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to add order:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
            <DialogDescription>Enter the order details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="orderType">Order Type *</Label>
              <Input
                id="orderType"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                placeholder="e.g., Crafts, Mini Polaroids, Gift Box"
                className="mt-1"
              />
              {errors.orderType && <p className="mt-1 text-xs text-destructive">{errors.orderType}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderDate">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="mt-1"
                />
                {errors.orderDate && <p className="mt-1 text-xs text-destructive">{errors.orderDate}</p>}
              </div>
              <div>
                <Label htmlFor="deliveryDate">Delivery Date *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="mt-1"
                />
                {errors.deliveryDate && <p className="mt-1 text-xs text-destructive">{errors.deliveryDate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalAmount">Total Amount *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
                {errors.totalAmount && <p className="mt-1 text-xs text-destructive">{errors.totalAmount}</p>}
              </div>
              <div>
                <Label htmlFor="advanceAmount">Advance Amount</Label>
                <Input
                  id="advanceAmount"
                  type="number"
                  step="0.01"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addOrder.isPending}>
              {addOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
