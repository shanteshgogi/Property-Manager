import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Phone, Mail, Home, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Tenant } from "@shared/schema";

interface TenantCardProps {
  tenant: Tenant;
  unitName?: string;
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
}

export default function TenantCard({ tenant, unitName, onEdit, onDelete }: TenantCardProps) {
  const initials = tenant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = tenant.status === "Active";

  return (
    <Card className="p-6 hover-elevate" data-testid={`card-tenant-${tenant.id}`}>
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg truncate" data-testid={`text-tenant-name-${tenant.id}`}>{tenant.name}</h3>
              <Badge variant={isActive ? "default" : "secondary"} data-testid={`badge-tenant-status-${tenant.id}`} className="mt-1">
                {tenant.status}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-menu-${tenant.id}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(tenant)} data-testid={`button-edit-${tenant.id}`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(tenant)} 
                  className="text-destructive focus:text-destructive"
                  data-testid={`button-delete-${tenant.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
