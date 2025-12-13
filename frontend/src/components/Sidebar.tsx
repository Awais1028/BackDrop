import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, Briefcase, ShoppingCart, FileText } from 'lucide-react';

const commonClasses = "flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md";
const activeClasses = "bg-gray-200 dark:bg-gray-700";

const Sidebar = () => {
  const { role } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'Creator':
        return [
          { path: "/creator/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
          { path: "/creator/scripts", label: "My Scripts", icon: <FileText className="h-5 w-5 mr-3" /> },
        ];
      case 'Advertiser':
        return [
          { path: "/advertiser/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
        ];
      case 'Merchant':
        return [
          { path: "/merchant/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
          { path: "/merchant/skus", label: "My SKUs", icon: <ShoppingCart className="h-5 w-5 mr-3" /> },
        ];
      case 'Operator':
        return [
          { path: "/operator/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
          { path: "/operator/inventory", label: "Inventory", icon: <Briefcase className="h-5 w-5 mr-3" /> },
          { path: "/operator/users", label: "User Management", icon: <Users className="h-5 w-5 mr-3" /> },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex-shrink-0">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Marketplace</h2>
      </div>
      <nav className="p-2">
        {getNavLinks().map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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