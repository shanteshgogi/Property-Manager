import TransactionRow from "../TransactionRow";
import { Card } from "@/components/ui/card";

export default function TransactionRowExample() {
  const mockIncome = {
    id: "1",
    name: "Monthly Rent - January",
    transactionType: "Rent",
    isIncome: true,
    amount: "12000.00",
    date: "2024-01-05",
    paidBy: "Rajesh Kumar",
    receiptUrl: null,
    unitId: "1",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  };

  const mockExpense = {
    id: "2",
    name: "Plumbing Repair",
    transactionType: "Repair",
    isIncome: false,
    amount: "3500.00",
    date: "2024-01-15",
    paidBy: "Property Manager",
    receiptUrl: "/uploads/receipt.jpg",
    unitId: "1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  };

  return (
    <div className="p-6 max-w-3xl">
      <Card>
        <TransactionRow
          transaction={mockIncome}
          unitName="A-101"
          onEdit={() => console.log("Edit income")}
          onDelete={() => console.log("Delete income")}
        />
        <TransactionRow
          transaction={mockExpense}
          unitName="A-101"
          onEdit={() => console.log("Edit expense")}
          onDelete={() => console.log("Delete expense")}
        />
      </Card>
    </div>
  );
}
