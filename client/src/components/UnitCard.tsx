import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Calendar, IndianRupee } from "lucide-react";
import type { Unit } from "@shared/schema";

interface UnitCardProps {
  unit: Unit;
  tenantCount: number;
  onClick?: () => void;
}

export default function UnitCard({ unit, tenantCount, onClick }: UnitCardProps) {
  const isOccupied = tenantCount > 0;
  const hasContract = unit.contractStart && unit.contractEnd;
  
  return (
    <Card className="p-6 hover-elevate cursor-pointer" onClick={onClick} data-testid={`card-unit-${unit.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Home className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg" data-testid={`text-unit-name-${unit.id}`}>{unit.name}</h3>
            <p className="text-sm text-muted-foreground">Floor {unit.floor}</p>
          </div>
        </div>
        <Badge variant={isOccupied ? "default" : "secondary"} data-testid={`badge-unit-status-${unit.id}`}>
          {isOccupied ? "Occupied" : "Vacant"}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Rent</span>
          <span className="font-mono font-medium flex items-center">
            <IndianRupee className="w-3 h-3" />
            {unit.rent.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Deposit</span>
          <span className="font-mono font-medium flex items-center">
            <IndianRupee className="w-3 h-3" />
            {unit.deposit.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Maintenance</span>
          <span className="font-mono font-medium flex items-center">
            <IndianRupee className="w-3 h-3" />
            {unit.maintenance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{tenantCount} {tenantCount === 1 ? "Tenant" : "Tenants"}</span>
        </div>
        {hasContract && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Until {new Date(unit.contractEnd!).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
