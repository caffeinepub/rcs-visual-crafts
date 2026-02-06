import { useState } from 'react';
import { useDailyEntries, useDeleteDailyEntry } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import DailyEntryForm from '../components/accounts/DailyEntryForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '../utils/dates';
import { useAuthorization } from '../hooks/useAuthorization';
import ConfirmDeleteDialog from '../components/common/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { getErrorMessage } from '../utils/errors';
import type { DailyEntry } from '../backend';

export default function AccountsPage() {
  const { data: entries = [], isLoading } = useDailyEntries();
  const { isAuthorized } = useAuthorization();
  const deleteDailyEntry = useDeleteDailyEntry();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [entryType, setEntryType] = useState<'Income' | 'Expense'>('Income');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<DailyEntry | null>(null);

  const filteredEntries = entries
    .filter((entry) => typeFilter === 'all' || entry.entryType === typeFilter)
    .sort((a, b) => Number(b.date - a.date));

  const handleAddClick = (type: 'Income' | 'Expense') => {
    setEntryType(type);
    setShowAddDialog(true);
  };

  const handleDeleteClick = (entry: DailyEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;

    try {
      await deleteDailyEntry.mutateAsync(entryToDelete.id);
      toast.success('Entry deleted successfully');
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Accounts</h2>
        {isAuthorized && (
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
        )}
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
                  {isAuthorized && <TableHead className="text-right">Actions</TableHead>}
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
                    {isAuthorized && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(entry)}
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

      {showAddDialog && (
        <DailyEntryForm entryType={entryType} onClose={() => setShowAddDialog(false)} />
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Entry"
        description={`Are you sure you want to delete this ${entryToDelete?.entryType.toLowerCase()} entry? This action cannot be undone.`}
        isDeleting={deleteDailyEntry.isPending}
      />
    </div>
  );
}
