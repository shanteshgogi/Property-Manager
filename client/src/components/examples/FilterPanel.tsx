import { useState } from "react";
import FilterPanel from "../FilterPanel";

export default function FilterPanelExample() {
  const [filters, setFilters] = useState<any>({});

  const mockUnits = [
    { id: "1", name: "A-101" },
    { id: "2", name: "A-102" },
    { id: "3", name: "B-201" },
  ];

  return (
    <div className="p-6">
      <FilterPanel
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          console.log("Filters changed:", newFilters);
        }}
        units={mockUnits}
        showStatus={true}
        showUnit={true}
        showDateRange={true}
      />
      {Object.keys(filters).length > 0 && (
        <pre className="mt-4 p-4 bg-muted rounded-lg text-sm">
          {JSON.stringify(filters, null, 2)}
        </pre>
      )}
    </div>
  );
}
