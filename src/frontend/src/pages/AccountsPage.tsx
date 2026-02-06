import { useState } from 'react';
import { useDailyEntries } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DailyEntryForm from '../components/accounts/DailyEntryForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '../utils/dates';

export default function AccountsPage() {
  const { data: entries = [], isLoading } = useDailyEntries();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [entryType, setEntryType] = useState<'Income' | 'Expense'>('Income');

  const filteredEntries = entries
    .filter((entry) => typeFilter === 'all' || entry.entryType === typeFilter)
    .sort((a, b) => Number(b.date - a.date));

  const handleAddClick = (type: 'Income' | 'Expense') => {
    setEntryType(type);
    setShowAddDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Accounts</h2>
        <div className="flex gap-2">
          <Button onClick={() => handleAddClick('Income')} variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
          <Button onClick={() => handleAddClick('Expense')} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No transactions yet. Add your first income or expense entry.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id.toString()}>
                    <TableCell>{formatDate(Number(entry.date))}</TableCell>
                    <TableCell>
                      <Badge variant={entry.entryType === 'Income' ? 'default' : 'secondary'}>
                        {entry.entryType}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.description || '-'}</TableCell>
                    <TableCell>{entry.paymentType}</TableCell>
                    <TableCell className={`text-right font-medium ${entry.entryType === 'Income' ? 'text-chart-4' : 'text-destructive'}`}>
                      {entry.entryType === 'Income' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showAddDialog && (
        <DailyEntryForm entryType={entryType} onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  );
}
