import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import { Plus } from "lucide-react";
import type { Property, Unit } from "@shared/schema";

export default function Properties() {
  const { data: properties = [], isLoading } = useQuery<Property[]>({ 
    queryKey: ["/api/properties"] 
  });

  const { data: units = [] } = useQuery<Unit[]>({ 
    queryKey: ["/api/units"] 
  });

  const getUnitCount = (propertyId: string) => {
    return units.filter(u => u.propertyId === propertyId).length;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Properties</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Properties</h1>
          <p className="text-muted-foreground">{properties.length} {properties.length === 1 ? "property" : "properties"} total</p>
        </div>
        <Button data-testid="button-add-property">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            unitCount={getUnitCount(property.id)}
            onClick={() => console.log("Navigate to property:", property.id)}
          />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No properties yet</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Property
          </Button>
        </div>
      )}
    </div>
  );
}
