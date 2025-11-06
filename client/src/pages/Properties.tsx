import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PropertyCard from "@/components/PropertyCard";
import UnitCard from "@/components/UnitCard";
import PropertyDialog from "@/components/PropertyDialog";
import UnitDialog from "@/components/UnitDialog";
import DeleteDialog from "@/components/DeleteDialog";
import { Plus, ArrowLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Property, Unit, Tenant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Properties() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUnitDialogOpen, setDeleteUnitDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>();
  const [viewingPropertyId, setViewingPropertyId] = useState<string | undefined>();

  const { data: properties = [], isLoading } = useQuery<Property[]>({ 
    queryKey: ["/api/properties"] 
  });

  const { data: units = [] } = useQuery<Unit[]>({ 
    queryKey: ["/api/units"] 
  });

  const { data: tenants = [] } = useQuery<Tenant[]>({ 
    queryKey: ["/api/tenants"] 
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({ title: "Success", description: "Property deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedProperty(undefined);
      setViewingPropertyId(undefined);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete property", variant: "destructive" });
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/units/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Success", description: "Unit deleted successfully" });
      setDeleteUnitDialogOpen(false);
      setSelectedUnit(undefined);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete unit", variant: "destructive" });
    },
  });

  const getUnitCount = (propertyId: string) => {
    return units.filter(u => u.propertyId === propertyId).length;
  };

  const getTenantCount = (unitId: string) => {
    return tenants.filter(t => t.unitId === unitId).length;
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleDelete = (property: Property) => {
    setSelectedProperty(property);
    setDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedProperty(undefined);
    setDialogOpen(true);
  };

  const handleViewProperty = (property: Property) => {
    setViewingPropertyId(property.id);
  };

  const handleAddUnit = () => {
    setSelectedUnit(undefined);
    setUnitDialogOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setUnitDialogOpen(true);
  };

  const handleDeleteUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setDeleteUnitDialogOpen(true);
  };

  const viewingProperty = properties.find(p => p.id === viewingPropertyId);
  const propertyUnits = viewingPropertyId ? units.filter(u => u.propertyId === viewingPropertyId) : [];

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

  if (viewingPropertyId && viewingProperty) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewingPropertyId(undefined)}
              className="mb-2"
              data-testid="button-back-to-properties"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
            <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">{viewingProperty.name}</h1>
            <p className="text-muted-foreground">{propertyUnits.length} {propertyUnits.length === 1 ? "unit" : "units"} total</p>
          </div>
          <Button onClick={handleAddUnit} data-testid="button-add-unit">
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propertyUnits.map((unit) => (
            <div key={unit.id} className="relative group">
              <UnitCard
                unit={unit}
                tenantCount={getTenantCount(unit.id)}
                onClick={() => handleEditUnit(unit)}
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} data-testid={`button-unit-menu-${unit.id}`}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditUnit(unit); }} data-testid={`button-edit-unit-${unit.id}`}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit); }}
                      className="text-destructive focus:text-destructive"
                      data-testid={`button-delete-unit-${unit.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {propertyUnits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No units yet for this property</p>
            <Button onClick={handleAddUnit}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Unit
            </Button>
          </div>
        )}

        <UnitDialog
          open={unitDialogOpen}
          onOpenChange={setUnitDialogOpen}
          unit={selectedUnit}
          propertyId={viewingPropertyId}
        />

        <DeleteDialog
          open={deleteUnitDialogOpen}
          onOpenChange={setDeleteUnitDialogOpen}
          onConfirm={() => selectedUnit && deleteUnitMutation.mutate(selectedUnit.id)}
          title="Delete Unit"
          description={`Are you sure you want to delete unit "${selectedUnit?.name}"? This will also remove all associated tenant data.`}
          isDeleting={deleteUnitMutation.isPending}
        />
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
        <Button onClick={handleAdd} data-testid="button-add-property">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} onClick={() => handleViewProperty(property)} className="cursor-pointer">
            <PropertyCard
              property={property}
              unitCount={getUnitCount(property.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No properties yet</p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Property
          </Button>
        </div>
      )}

      <PropertyDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        property={selectedProperty}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedProperty && deleteMutation.mutate(selectedProperty.id)}
        title="Delete Property"
        description={`Are you sure you want to delete "${selectedProperty?.name}"? This will also delete all associated units and their data.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
