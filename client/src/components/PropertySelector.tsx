import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertySelectorProps {
  properties: Property[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function PropertySelector({ properties, selectedId, onSelect }: PropertySelectorProps) {
  return (
    <Select value={selectedId} onValueChange={onSelect}>
      <SelectTrigger className="w-64" data-testid="select-property">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Select property" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {properties.map((property) => (
          <SelectItem key={property.id} value={property.id} data-testid={`option-property-${property.id}`}>
            {property.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
