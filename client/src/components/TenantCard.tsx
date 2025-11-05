import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, Home } from "lucide-react";
import type { Tenant } from "@shared/schema";

interface TenantCardProps {
  tenant: Tenant;
  unitName?: string;
  onClick?: () => void;
}

export default function TenantCard({ tenant, unitName, onClick }: TenantCardProps) {
  const initials = tenant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = tenant.status === "Active";

  return (
    <Card className="p-6 hover-elevate cursor-pointer" onClick={onClick} data-testid={`card-tenant-${tenant.id}`}>
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg truncate" data-testid={`text-tenant-name-${tenant.id}`}>{tenant.name}</h3>
            <Badge variant={isActive ? "default" : "secondary"} data-testid={`badge-tenant-status-${tenant.id}`}>
              {tenant.status}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{tenant.phone}</span>
            </div>
            {tenant.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{tenant.email}</span>
              </div>
            )}
            {unitName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Unit {unitName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
