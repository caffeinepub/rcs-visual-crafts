import { useDailyEntries } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { getToday, getCurrentMonth, isToday, isCurrentMonth } from '../utils/dates';

export default function DashboardPage() {
  const { data: entries = [], isLoading } = useDailyEntries();

  // Calculate today's income and expenses
  const todayEntries = entries.filter((entry) => isToday(Number(entry.date)));
  const todayIncome = todayEntries
    .filter((e) => e.entryType === 'Income')
    .reduce((sum, e) => sum + e.amount, 0);
  const todayExpenses = todayEntries
    .filter((e) => e.entryType === 'Expense')
    .reduce((sum, e) => sum + e.amount, 0);

  // Calculate total balance
  const totalIncome = entries
    .filter((e) => e.entryType === 'Income')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = entries
    .filter((e) => e.entryType === 'Expense')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Calculate monthly summary
  const monthlyEntries = entries.filter((entry) => isCurrentMonth(Number(entry.date)));
  const monthlyIncome = monthlyEntries
    .filter((e) => e.entryType === 'Income')
    .reduce((sum, e) => sum + e.amount, 0);
  const monthlyExpenses = monthlyEntries
    .filter((e) => e.entryType === 'Expense')
    .reduce((sum, e) => sum + e.amount, 0);
  const monthlyNet = monthlyIncome - monthlyExpenses;

  const kpis = [
    {
      title: "Today's Income",
      value: todayIncome,
      icon: TrendingUp,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      title: "Today's Expenses",
      value: todayExpenses,
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Total Balance',
      value: totalBalance,
      icon: Wallet,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Monthly Net',
      value: monthlyNet,
      icon: DollarSign,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <div className={`rounded-full p-2 ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{kpi.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Income</span>
              <span className="text-lg font-semibold text-chart-4">
                ₹{monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Expenses</span>
              <span className="text-lg font-semibold text-destructive">
                ₹{monthlyExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net</span>
                <span className={`text-xl font-bold ${monthlyNet >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                  ₹{monthlyNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
