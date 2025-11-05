import TenantCard from "../TenantCard";

export default function TenantCardExample() {
  const mockTenant = {
    id: "1",
    status: "Active",
    name: "Rajesh Kumar",
    unitId: "1",
    phone: "+91 9876543210",
    email: "rajesh.kumar@email.com",
    aadhar: "1234 5678 9012",
    address: "Chennai, Tamil Nadu",
    extraDetails: "Family of 4",
    emergencyContact: "+91 9876543211",
    dob: new Date("1985-05-15"),
    workDetails: "Software Engineer at Tech Corp",
    gender: "Male",
    idImageUrl: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  return (
    <div className="p-6 max-w-md">
      <TenantCard
        tenant={mockTenant}
        unitName="A-101"
        onClick={() => console.log("Tenant clicked")}
      />
    </div>
  );
}
