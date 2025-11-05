import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TenantCard from "@/components/TenantCard";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import { Plus, Download } from "lucide-react";
import type { Tenant, Unit } from "@shared/schema";

export default function Tenants() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [activeTab, setActiveTab] = useState("active");

  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({ 
    queryKey: ["/api/tenants"] 
  });

  const { data: units = [] } = useQuery<Unit[]>({ 
    queryKey: ["/api/units"] 
  });

  const getUnitName = (unitId: string | null) => {
    if (!unitId) return undefined;
    return units.find(u => u.id === unitId)?.name;
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.phone.includes(search) ||
      tenant.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = activeTab === "all" || tenant.status === (activeTab === "active" ? "Active" : "Inactive");
    const matchesUnit = !filters.unitId || tenant.unitId === filters.unitId;

    return matchesSearch && matchesStatus && matchesUnit;
  });

  const activeTenants = filteredTenants.filter(t => t.status === "Active");
  const inactiveTenants = filteredTenants.filter(t => t.status === "Inactive");

  const handleExport = () => {
    window.location.href = `/api/export/tenants?status=${activeTab !== "all" ? (activeTab === "active" ? "Active" : "Inactive") : ""}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Tenants</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Tenants</h1>
          <p className="text-muted-foreground">
            {activeTenants.length} active, {inactiveTenants.length} inactive
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} data-testid="button-export-csv">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button data-testid="button-add-tenant">
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={setSearch}
          />
        </div>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          units={units.map(u => ({ id: u.id, name: u.name }))}
          showUnit={true}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-tenant-status">
          <TabsTrigger value="active" data-testid="tab-active">Active</TabsTrigger>
          <TabsTrigger value="inactive" data-testid="tab-inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                unitName={getUnitName(tenant.unitId)}
                onClick={() => console.log("Navigate to tenant:", tenant.id)}
              />
            ))}
          </div>
          {activeTenants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active tenants found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveTenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                unitName={getUnitName(tenant.unitId)}
                onClick={() => console.log("Navigate to tenant:", tenant.id)}
              />
            ))}
          </div>
          {inactiveTenants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No inactive tenants found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
