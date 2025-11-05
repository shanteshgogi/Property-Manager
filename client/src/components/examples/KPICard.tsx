import KPICard from "../KPICard";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";

export default function KPICardExample() {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Income"
          value="₹54,000"
          icon={TrendingUp}
          trend={{ value: "12% from last month", isPositive: true }}
          valueColor="text-green-600 dark:text-green-400"
        />
        <KPICard
          title="Total Expense"
          value="₹6,500"
          icon={TrendingDown}
          trend={{ value: "8% from last month", isPositive: false }}
          valueColor="text-red-600 dark:text-red-400"
        />
        <KPICard
          title="Net Balance"
          value="₹47,500"
          icon={DollarSign}
          trend={{ value: "15% from last month", isPositive: true }}
        />
        <KPICard
          title="Occupancy Rate"
          value="75%"
          icon={Users}
          trend={{ value: "3 of 4 units occupied", isPositive: true }}
        />
      </div>
    </div>
  );
}
