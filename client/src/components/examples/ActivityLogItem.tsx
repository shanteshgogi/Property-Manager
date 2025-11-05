import ActivityLogItem from "../ActivityLogItem";
import { Card } from "@/components/ui/card";

export default function ActivityLogItemExample() {
  const mockLogs = [
    {
      id: "1",
      entityType: "unit",
      entityId: "1",
      action: "tenant_added",
      message: "Tenant Rajesh Kumar added to unit A-101",
      createdAt: new Date("2024-01-01T10:30:00"),
    },
    {
      id: "2",
      entityType: "unit",
      entityId: "1",
      action: "transaction_added",
      message: "Security deposit of ₹15,000 received",
      createdAt: new Date("2024-01-01T09:15:00"),
    },
    {
      id: "3",
      entityType: "unit",
      entityId: "1",
      action: "contract_updated",
      message: "Contract end date updated to Dec 31, 2024",
      createdAt: new Date("2023-12-28T14:20:00"),
    },
  ];

  return (
    <div className="p-6 max-w-lg">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Activity Log</h3>
        {mockLogs.map((log, index) => (
          <ActivityLogItem
            key={log.id}
            log={log}
            isLast={index === mockLogs.length - 1}
          />
        ))}
      </Card>
    </div>
  );
}
