import PropertyCard from "../PropertyCard";

export default function PropertyCardExample() {
  const mockProperty = {
    id: "1",
    name: "Sunrise Apartments",
    address: "123 Main Street, Downtown",
    createdAt: new Date("2024-01-15"),
  };

  return (
    <div className="p-6 max-w-md">
      <PropertyCard
        property={mockProperty}
        unitCount={3}
        onClick={() => console.log("Property clicked")}
      />
    </div>
  );
}
