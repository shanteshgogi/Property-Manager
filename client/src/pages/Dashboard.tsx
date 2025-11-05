import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KPICard from "@/components/KPICard";
import IncomeExpenseChart from "@/components/IncomeExpenseChart";
import PropertySelector from "@/components/PropertySelector";
import { DollarSign, TrendingUp, TrendingDown, Users, Plus } from "lucide-react";
import type { Property, Transaction } from "@shared/schema";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({ 
    queryKey: ["/api/properties"] 
  });

  const [selectedProperty, setSelectedProperty] = useState<string | undefined>(undefined);

  const effectiveProperty = selectedProperty || properties[0]?.id;

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    occupancyRate: number;
    totalUnits: number;
    occupiedUnits: number;
  }>({
    queryKey: ["/api/dashboard/stats", effectiveProperty],
    enabled: !!effectiveProperty,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({ 
    queryKey: ["/api/transactions"],
    enabled: !!effectiveProperty,
  });

  const { data: reminders = [] } = useQuery<any[]>({ 
    queryKey: ["/api/reminders"] 
  });

  const isLoading = propertiesLoading || statsLoading || transactionsLoading;

  const totalIncome = stats?.totalIncome || 0;
  const totalExpense = stats?.totalExpense || 0;
  const netBalance = stats?.netBalance || 0;
  const occupancyRate = stats?.occupancyRate || 0;

  const getMonthlyData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      last6Months.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
      });
    }

    return last6Months.map(({ month, year }) => {
      const monthIndex = monthNames.indexOf(month);
      const monthTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === monthIndex && txDate.getFullYear() === year;
      });

      const income = monthTransactions
        .filter(t => t.isIncome)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expense = monthTransactions
        .filter(t => !t.isIncome)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return { month, income, expense };
    });
  };

  const chartData = getMonthlyData();
  const selectedPropertyData = properties.find(p => p.id === effectiveProperty);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Dashboard</h1>
          {properties.length > 1 && (
            <PropertySelector
              properties={properties}
              selectedId={effectiveProperty}
              onSelect={setSelectedProperty}
            />
          )}
          {properties.length === 1 && selectedPropertyData && (
            <p className="text-lg text-muted-foreground">{selectedPropertyData.name}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "monthly" | "yearly")}>
            <TabsList data-testid="tabs-view-mode">
              <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" data-testid="tab-yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button data-testid="button-add-transaction">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Income"
          value={`₹${totalIncome.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: "12% from last month", isPositive: true }}
          valueColor="text-green-600 dark:text-green-400"
        />
        <KPICard
          title="Total Expense"
          value={`₹${totalExpense.toLocaleString()}`}
          icon={TrendingDown}
          trend={{ value: "8% from last month", isPositive: false }}
          valueColor="text-red-600 dark:text-red-400"
        />
        <KPICard
          title="Net Balance"
          value={`₹${netBalance.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: "15% from last month", isPositive: true }}
        />
        <KPICard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={Users}
          trend={{ value: `${stats?.occupiedUnits || 0} of ${stats?.totalUnits || 0} units`, isPositive: true }}
        />
      </div>

      <IncomeExpenseChart data={chartData} title={`${viewMode === "monthly" ? "Monthly" : "Yearly"} Income vs Expense`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
              <div>
                <p className="text-sm font-medium">Highest Expense Category</p>
                <p className="text-sm text-muted-foreground">Repairs - ₹3,500 (53% of total expenses)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div>
                <p className="text-sm font-medium">Income Growth</p>
                <p className="text-sm text-muted-foreground">+12% increase compared to last month</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
              <div>
                <p className="text-sm font-medium">Contract Renewals</p>
                <p className="text-sm text-muted-foreground">{reminders.length} pending renewal reminders</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Properties</span>
              <span className="font-medium">{properties.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Units</span>
              <span className="font-medium">{stats?.totalUnits || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Tenants</span>
              <span className="font-medium">{stats?.occupiedUnits || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transactions This Month</span>
              <span className="font-medium">{transactions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Reminders</span>
              <span className="font-medium">{reminders.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
