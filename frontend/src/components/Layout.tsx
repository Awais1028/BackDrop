import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, Home, Upload, Search, ShoppingBag, Settings, Users } from 'lucide-react';
import { MadeWithDyad } from './made-with-dyad';

interface NavLink {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const navLinks: NavLink[] = [
  { to: '/', label: 'Home', icon: Home, roles: ['Creator', 'Advertiser', 'Merchant', 'Operator'] },
  { to: '/creator/scripts', label: 'My Scripts', icon: Upload, roles: ['Creator'] },
  { to: '/creator/dashboard', label: 'Financing Dashboard', icon: Settings, roles: ['Creator'] },
  { to: '/discover', label: 'Discover Opportunities', icon: Search, roles: ['Advertiser', 'Merchant'] },
  { to: '/buyer/bids', label: 'My Bids/Reservations', icon: ShoppingBag, roles: ['Advertiser', 'Merchant'] },
  { to: '/merchant/products', label: 'My Products', icon: ShoppingBag, roles: ['Merchant'] },
  { to: '/operator/inventory', label: 'Inventory', icon: Users, roles: ['Operator'] },
  { to: '/operator/workflow', label: 'Workflow Monitoring', icon: Settings, roles: ['Operator'] },
  { to: '/operator/financing', label: 'Financing & Margin', icon: Settings, roles: ['Operator'] },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavLinks = navLinks.filter(link => role && link.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar text-sidebar-foreground p-4">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="text-xl font-bold text-sidebar-primary-foreground">
            BackDrop
          </Link>
        </div>
        <nav className="flex-1 mt-6">
          <ul className="space-y-2">
            {filteredNavLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary hover:bg-sidebar-accent"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-sidebar-border">
          {user && (
            <div className="flex items-center justify-between text-sm text-sidebar-foreground mb-2">
              <span>{user.name} ({user.role})</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sidebar-foreground hover:text-sidebar-primary">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          )}
          <MadeWithDyad />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Header for mobile and larger screens */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground">
              <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary-foreground h-16 px-4">
                <span>BackDrop</span>
              </Link>
              <nav className="grid gap-2 text-lg font-medium mt-6">
                {filteredNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-4 border-t border-sidebar-border">
                {user && (
                  <div className="flex items-center justify-between text-sm text-sidebar-foreground mb-2">
                    <span>{user.name} ({user.role})</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sidebar-foreground hover:text-sidebar-primary">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                  </div>
                )}
                <MadeWithDyad />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1 text-lg font-medium md:hidden">
            BackDrop
          </div>
          <div className="ml-auto flex items-center gap-4">
            {user ? (
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Logged in as {user.name} ({user.role})
              </span>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            )}
            {user && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;