import Breadcrumb from "../Breadcrumb";

export default function BreadcrumbExample() {
  const items = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" },
    { label: "Sunrise Apartments" },
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={items} />
    </div>
  );
}
