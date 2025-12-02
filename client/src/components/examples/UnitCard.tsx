import UnitCard from "../UnitCard";

export default function UnitCardExample() {
  const mockUnit = {
    id: "1",
    name: "A-101",
    propertyId: "1",
    deposit: 15000,
    floor: 1,
    rent: 12000,
    maintenance: 2000,
    contractStart: "2024-01-01",
    contractEnd: "2024-12-31",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  };

  return (
    <div className="p-6 max-w-sm">
      <UnitCard
        unit={mockUnit}
        tenantCount={1}
        onClick={() => console.log("Unit clicked")}
      />
    </div>
  );
}
