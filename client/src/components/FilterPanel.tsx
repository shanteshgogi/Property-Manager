import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface FilterPanelProps {
  filters: {
    status?: string;
    unitId?: string;
    startDate?: string;
    endDate?: string;
  };
  onFilterChange: (filters: any) => void;
  units?: Array<{ id: string; name: string }>;
  showStatus?: boolean;
  showUnit?: boolean;
  showDateRange?: boolean;
}

export default function FilterPanel({
  filters,
  onFilterChange,
  units = [],
  showStatus = false,
  showUnit = false,
  showDateRange = false,
}: FilterPanelProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v);

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showStatus && (
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, status: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showUnit && units.length > 0 && (
        <Select
          value={filters.unitId || "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, unitId: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-40" data-testid="select-filter-unit">
            <SelectValue placeholder="All Units" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showDateRange && (
        <>
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="w-40"
            data-testid="input-filter-start-date"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="w-40"
            data-testid="input-filter-end-date"
          />
        </>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
