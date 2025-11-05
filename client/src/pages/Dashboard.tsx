import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KPICard from "@/components/KPICard";
import IncomeExpenseChart from "@/components/IncomeExpenseChart";
import PropertySelector from "@/components/PropertySelector";
import { DollarSign, TrendingUp, TrendingDown, Users, Plus } from "lucide-react";
import { mockProperties, mockUnits, mockTenants, mockTransactions } from "@/lib/mockData";

export default function Dashboard() {
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]?.id);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

  // TODO: remove mock functionality - calculate from real data
  const totalIncome = 54000;
  const totalExpense = 6500;
  const netBalance = totalIncome - totalExpense;
  
  const propertyUnits = mockUnits.filter(u => u.propertyId === selectedProperty);
  const activeTenants = mockTenants.filter(t => t.status === "Active" && propertyUnits.some(u => u.id === t.unitId));
  const occupancyRate = Math.round((activeTenants.length / propertyUnits.length) * 100);

  const chartData = [
    { month: "Jan", income: 24000, expense: 6500 },
    { month: "Feb", income: 27000, expense: 5800 },
    { month: "Mar", income: 30000, expense: 7200 },
    { month: "Apr", income: 24000, expense: 4500 },
    { month: "May", income: 27000, expense: 6100 },
    { month: "Jun", income: 30000, expense: 5900 },
  ];

  const selectedPropertyData = mockProperties.find(p => p.id === selectedProperty);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Dashboard</h1>
          {mockProperties.length > 1 && (
            <PropertySelector
              properties={mockProperties}
              selectedId={selectedProperty}
              onSelect={setSelectedProperty}
            />
          )}
          {mockProperties.length === 1 && selectedPropertyData && (
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
          trend={{ value: `${activeTenants.length} of ${propertyUnits.length} units`, isPositive: true }}
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
                <p className="text-sm text-muted-foreground">1 unit contract expiring in 30 days</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Properties</span>
              <span className="font-medium">{mockProperties.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Units</span>
              <span className="font-medium">{propertyUnits.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Tenants</span>
              <span className="font-medium">{activeTenants.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transactions This Month</span>
              <span className="font-medium">{mockTransactions.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
