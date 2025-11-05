import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartData {
  month: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  data: ChartData[];
  title?: string;
}

export default function IncomeExpenseChart({ data, title = "Income vs Expense" }: IncomeExpenseChartProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.375rem",
            }}
          />
          <Legend />
          <Bar dataKey="income" fill="rgb(34 197 94)" name="Income" />
          <Bar dataKey="expense" fill="rgb(239 68 68)" name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
