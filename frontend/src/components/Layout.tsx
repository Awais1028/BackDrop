import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, Home, Upload, Search, ShoppingBag, Settings, Users, DollarSign, BarChart, FileText } from 'lucide-react';
import { MadeWithDyad } from './made-with-dyad';
import { cn } from '@/lib/utils';

interface NavLink {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const navLinks: NavLink[] = [
  // Creator
  { to: '/creator/scripts', label: 'My Scripts', icon: FileText, roles: ['Creator'] },
  { to: '/creator/dashboard', label: 'Financing', icon: DollarSign, roles: ['Creator'] },
  // Buyer
  { to: '/discover', label: 'Discover', icon: Search, roles: ['Advertiser', 'Merchant'] },
  { to: '/buyer/bids', label: 'My Bids', icon: Handshake, roles: ['Advertiser', 'Merchant'] },
  // Merchant
  { to: '/merchant/products', label: 'My Products', icon: ShoppingBag, roles: ['Merchant'] },
  // Operator
  { to: '/operator/inventory', label: 'Inventory', icon: Users, roles: ['Operator'] },
  { to: '/operator/workflow', label: 'Workflow', icon: BarChart, roles: ['Operator'] },
  { to: '/operator/financing', label: 'Financing', icon: DollarSign, roles: ['Operator'] },
];

const Layout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavLinks = navLinks.filter(link => link.roles.includes(role || ''));

  const NavContent = () => (
    <>
      <nav className="flex-1 mt-6">
        <ul className="space-y-1">
          {filteredNavLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-primary-foreground",
                  location.pathname.startsWith(link.to) && "bg-sidebar-primary text-sidebar-primary-foreground"
                )}
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
          <div className="flex items-center justify-between text-sm text-sidebar-foreground mb-2 px-3">
            <div className="flex flex-col">
              <span>{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.role}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        <MadeWithDyad />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar text-sidebar-foreground p-2">
        <div className="flex items-center h-16 px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <Film className="h-6 w-6 text-primary" />
            <span>BackDrop</span>
          </Link>
        </div>
        <NavContent />
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground p-2">
              <div className="flex items-center h-16 px-4">
                <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                  <Film className="h-6 w-6 text-primary" />
                  <span>BackDrop</span>
                </Link>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            {/* Can add breadcrumbs or page title here later */}
          </div>
          <div className="ml-auto flex items-center gap-4">
            {user && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-900/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;