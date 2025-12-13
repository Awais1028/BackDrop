import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, Briefcase, ShoppingCart, FileText, DollarSign, Search, Settings } from 'lucide-react';

const commonClasses = "flex items-center px-4 py-2 text-foreground rounded-md";
const activeClasses = "bg-muted";

const Sidebar = () => {
  const { role } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'Creator':
        return [
          { path: "/creator/dashboard", label: "Dashboard", icon: <DollarSign className="h-5 w-5 mr-3" /> },
          { path: "/creator/scripts", label: "My Scripts", icon: <FileText className="h-5 w-5 mr-3" /> },
        ];
      case 'Advertiser':
      case 'Merchant':
        return [
          { path: "/discover", label: "Discover", icon: <Search className="h-5 w-5 mr-3" /> },
          { path: "/buyer/bids", label: "My Bids", icon: <Briefcase className="h-5 w-5 mr-3" /> },
          ...(role === 'Merchant' ? [{ path: "/merchant/products", label: "My Products", icon: <ShoppingCart className="h-5 w-5 mr-3" /> }] : []),
        ];
      case 'Operator':
        return [
          { path: "/operator/inventory", label: "Inventory", icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
          { path: "/operator/workflow", label: "Workflow", icon: <Settings className="h-5 w-5 mr-3" /> },
          { path: "/operator/financing", label: "Financing", icon: <DollarSign className="h-5 w-5 mr-3" /> },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="w-64 bg-card border-r flex-shrink-0 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold text-primary">BackDrop</h2>
        <p className="text-sm text-muted-foreground">{role} Console</p>
      </div>
      <nav className="p-2 flex-1">
        {getNavLinks().map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : 'hover:bg-muted/50'}`}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;