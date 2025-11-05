import MobileMenu from "../MobileMenu";

export default function MobileMenuExample() {
  return (
    <div className="p-6">
      <div className="border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">Click the menu icon to open</p>
        <MobileMenu />
      </div>
    </div>
  );
}
