import IncomeExpenseChart from "../IncomeExpenseChart";

export default function IncomeExpenseChartExample() {
  const mockData = [
    { month: "Jan", income: 24000, expense: 6500 },
    { month: "Feb", income: 27000, expense: 5800 },
    { month: "Mar", income: 30000, expense: 7200 },
    { month: "Apr", income: 24000, expense: 4500 },
    { month: "May", income: 27000, expense: 6100 },
    { month: "Jun", income: 30000, expense: 5900 },
  ];

  return (
    <div className="p-6">
      <IncomeExpenseChart data={mockData} />
    </div>
  );
}
