import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, MapPin, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  unitCount: number;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export default function PropertyCard({ property, unitCount, onEdit, onDelete }: PropertyCardProps) {
  return (
    <Card className="p-6 hover-elevate" data-testid={`card-property-${property.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg" data-testid={`text-property-name-${property.id}`}>{property.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {property.address}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-menu-${property.id}`}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(property)} data-testid={`button-edit-${property.id}`}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(property)} 
              className="text-destructive focus:text-destructive"
              data-testid={`button-delete-${property.id}`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Added {new Date(property.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="text-sm font-medium">
          {unitCount} {unitCount === 1 ? "Unit" : "Units"}
        </div>
      </div>
    </Card>
  );
}
