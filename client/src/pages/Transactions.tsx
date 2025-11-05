import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionRow from "@/components/TransactionRow";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import { Plus, Download } from "lucide-react";
import { mockTransactions, mockUnits } from "@/lib/mockData";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

  const getUnitName = (unitId: string) => {
    return mockUnits.find(u => u.id === unitId)?.name || "Unknown";
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.name.toLowerCase().includes(search.toLowerCase()) ||
      transaction.transactionType.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "all" ||
      (typeFilter === "income" && transaction.isIncome) ||
      (typeFilter === "expense" && !transaction.isIncome);
    
    const matchesUnit = !filters.unitId || transaction.unitId === filters.unitId;
    
    const matchesDate = (!filters.startDate || new Date(transaction.date) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(transaction.date) <= new Date(filters.endDate));

    return matchesSearch && matchesType && matchesUnit && matchesDate;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.isIncome)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const totalExpense = filteredTransactions
    .filter(t => !t.isIncome)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Transactions</h1>
          <p className="text-muted-foreground">{filteredTransactions.length} transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" data-testid="button-export-csv">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button data-testid="button-add-transaction">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Income</p>
          <p className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
            ₹{totalIncome.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Expense</p>
          <p className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
            ₹{totalExpense.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Net</p>
          <p className="text-2xl font-bold font-mono">
            ₹{(totalIncome - totalExpense).toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search transactions..."
              value={search}
              onChange={setSearch}
            />
          </div>
          <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <TabsList data-testid="tabs-transaction-type">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="income" data-testid="tab-income">Income</TabsTrigger>
              <TabsTrigger value="expense" data-testid="tab-expense">Expense</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          units={mockUnits.map(u => ({ id: u.id, name: u.name }))}
          showUnit={true}
          showDateRange={true}
        />
      </div>

      <Card>
        {filteredTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            unitName={getUnitName(transaction.unitId)}
            onEdit={() => console.log("Edit transaction:", transaction.id)}
            onDelete={() => console.log("Delete transaction:", transaction.id)}
          />
        ))}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
