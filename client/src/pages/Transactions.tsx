import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionRow from "@/components/TransactionRow";
import TransactionDialog from "@/components/TransactionDialog";
import DeleteDialog from "@/components/DeleteDialog";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import { Plus, Download } from "lucide-react";
import type { Transaction, Unit } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Transactions() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({ 
    queryKey: ["/api/transactions"] 
  });

  const { data: units = [] } = useQuery<Unit[]>({ 
    queryKey: ["/api/units"] 
  });

  const getUnitName = (unitId: string) => {
    return units.find(u => u.id === unitId)?.name || "Unknown";
  };

  const filteredTransactions = transactions.filter(transaction => {
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Success", description: "Transaction deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedTransaction(undefined);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete transaction", variant: "destructive" });
    },
  });

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTransaction(undefined);
    setDialogOpen(true);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (typeFilter === "income") params.append("isIncome", "true");
    if (typeFilter === "expense") params.append("isIncome", "false");
    if (filters.unitId) params.append("unitId", filters.unitId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    window.location.href = `/api/export/transactions?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Transactions</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Transactions</h1>
          <p className="text-muted-foreground">{filteredTransactions.length} transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} data-testid="button-export-csv">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleAdd} data-testid="button-add-transaction">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1 p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Income</p>
          <p className="text-xl font-bold font-mono text-green-600 dark:text-green-400">
            ₹{totalIncome.toLocaleString()}
          </p>
        </Card>
        <Card className="flex-1 p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Expense</p>
          <p className="text-xl font-bold font-mono text-red-600 dark:text-red-400">
            ₹{totalExpense.toLocaleString()}
          </p>
        </Card>
        <Card className="flex-1 p-4">
          <p className="text-xs text-muted-foreground mb-1">Net</p>
          <p className="text-xl font-bold font-mono">
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
          units={units.map(u => ({ id: u.id, name: u.name }))}
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
            onEdit={() => handleEdit(transaction)}
            onDelete={() => handleDelete(transaction)}
          />
        ))}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </Card>

      <TransactionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        transaction={selectedTransaction}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedTransaction && deleteMutation.mutate(selectedTransaction.id)}
        title="Delete Transaction"
        description={`Are you sure you want to delete this transaction "${selectedTransaction?.name}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
