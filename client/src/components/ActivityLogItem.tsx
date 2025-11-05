import { Circle } from "lucide-react";
import type { ActivityLog } from "@shared/schema";

interface ActivityLogItemProps {
  log: ActivityLog;
  isLast?: boolean;
}

export default function ActivityLogItem({ log, isLast }: ActivityLogItemProps) {
  return (
    <div className="flex gap-3" data-testid={`log-item-${log.id}`}>
      <div className="flex flex-col items-center">
        <Circle className="w-2 h-2 fill-primary text-primary mt-2" />
        {!isLast && <div className="w-px bg-border flex-1 my-1" />}
      </div>
      <div className="flex-1 pb-6">
        <p className="text-sm font-medium mb-1">{log.message}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(log.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
