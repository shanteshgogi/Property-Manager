import { useState } from "react";
import PropertySelector from "../PropertySelector";

export default function PropertySelectorExample() {
  const [selectedId, setSelectedId] = useState("1");

  const mockProperties = [
    {
      id: "1",
      name: "Sunrise Apartments",
      address: "123 Main Street, Downtown",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Green Valley Complex",
      address: "456 Oak Avenue, Westside",
      createdAt: new Date("2024-02-20"),
    },
  ];

  return (
    <div className="p-6">
      <PropertySelector
        properties={mockProperties}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          console.log("Selected property:", id);
        }}
      />
    </div>
  );
}
