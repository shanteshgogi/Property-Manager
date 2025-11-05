import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, IndianRupee, FileText } from "lucide-react";
import type { Transaction } from "@shared/schema";

interface TransactionRowProps {
  transaction: Transaction;
  unitName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TransactionRow({ transaction, unitName, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.isIncome;
  
  return (
    <div
      className="flex items-center gap-4 p-4 border-b last:border-b-0 hover-elevate"
      data-testid={`row-transaction-${transaction.id}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate" data-testid={`text-transaction-name-${transaction.id}`}>
            {transaction.name}
          </h4>
          <Badge variant={isIncome ? "default" : "secondary"} className="flex-shrink-0">
            {transaction.transactionType}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span>{new Date(transaction.date).toLocaleDateString()}</span>
          {unitName && <span>Unit: {unitName}</span>}
          {transaction.paidBy && <span>By: {transaction.paidBy}</span>}
          {transaction.receiptUrl && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Receipt
            </span>
          )}
        </div>
      </div>

      <div className={`font-mono font-semibold text-lg flex items-center ${isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
        {isIncome ? "+" : "-"}
        <IndianRupee className="w-4 h-4" />
        {parseFloat(transaction.amount).toLocaleString()}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onEdit}
          data-testid={`button-edit-transaction-${transaction.id}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          data-testid={`button-delete-transaction-${transaction.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
