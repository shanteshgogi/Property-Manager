import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb" data-testid="nav-breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          {item.href ? (
            <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-breadcrumb-${index}`}>
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium" data-testid={`text-breadcrumb-current-${index}`}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
