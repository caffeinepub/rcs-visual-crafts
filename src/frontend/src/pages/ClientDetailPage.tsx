import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useClients, useOrdersByClient } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
import OrderForm from '../components/orders/OrderForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '../utils/dates';

export default function ClientDetailPage() {
  const { clientId } = useParams({ from: '/clients/$clientId' });
  const { data: clients = [] } = useClients();
  const { data: orders = [], isLoading } = useOrdersByClient(BigInt(clientId));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const client = clients.find((c) => c.id.toString() === clientId);

  const filteredOrders = orders
    .filter((order) => statusFilter === 'all' || order.status === statusFilter)
    .sort((a, b) => Number(b.dueDate - a.dueDate));

  if (!client) {
    return (
      <div className="space-y-6">
        <Link to="/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Client not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/clients">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{client.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Phone:</span>
              <p className="text-base">{client.phone}</p>
            </div>
            {client.email && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <p className="text-base">{client.email}</p>
              </div>
            )}
            {client.address && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-muted-foreground">Address:</span>
                <p className="text-base">{client.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No orders found. Add the first order for this client.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id.toString()}>
                    <TableCell className="font-medium">{order.description}</TableCell>
                    <TableCell>{formatDate(Number(order.startDate))}</TableCell>
                    <TableCell>{formatDate(Number(order.dueDate))}</TableCell>
                    <TableCell>₹{order.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{order.remainingBalance.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showAddDialog && (
        <OrderForm clientId={BigInt(clientId)} onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  );
}
