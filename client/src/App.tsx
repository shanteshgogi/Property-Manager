import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileMenu from "@/components/MobileMenu";
import Breadcrumb from "@/components/Breadcrumb";
import { Building2, Moon, Sun, LayoutDashboard, Home, Users, Receipt, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Property } from "@shared/schema";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Tenants from "@/pages/Tenants";
import Transactions from "@/pages/Transactions";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </Button>
  );
}

function UserProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) return null;

  const displayName = user.displayName || user.email || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getBreadcrumbItems(pathname: string): Array<{ label: string; href?: string }> {
  const items: Array<{ label: string; href?: string }> = [{ label: "Home", href: "/" }];

  if (pathname.startsWith("/properties")) {
    items.push({ label: "Properties" });
  } else if (pathname.startsWith("/tenants")) {
    items.push({ label: "Tenants" });
  } else if (pathname.startsWith("/transactions")) {
    items.push({ label: "Transactions" });
  }

  return items;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/properties">
        <ProtectedRoute>
          <Properties />
        </ProtectedRoute>
      </Route>
      <Route path="/tenants">
        <ProtectedRoute>
          <Tenants />
        </ProtectedRoute>
      </Route>
      <Route path="/transactions">
        <ProtectedRoute>
          <Transactions />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const { data: properties = [] } = useQuery<Property[]>({ queryKey: ["/api/properties"] });
  const selectedProperty = properties.length === 1 ? properties[0] : null;

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Properties", href: "/properties", icon: Home },
    { label: "Tenants", href: "/tenants", icon: Users },
    { label: "Transactions", href: "/transactions", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <MobileMenu />
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                <h1 className="font-semibold text-lg hidden md:block">
                  {selectedProperty?.name || "Property Manager"}
                </h1>
              </div>
              <nav className="hidden md:flex items-center gap-1 ml-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-2"
                        data-testid={`nav-${item.label.toLowerCase()}`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserProfile />
            </div>
          </div>

          <div className="pb-3 hidden md:block">
            <Breadcrumb items={getBreadcrumbItems(location)} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <Router />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
