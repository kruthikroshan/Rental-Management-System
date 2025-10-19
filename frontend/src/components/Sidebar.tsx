import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Package, 
  Calendar, 
  Users, 
  CreditCard, 
  TruckIcon as Truck,
  BarChart3,
  Settings,
  Home,
  FileText,
  Bell,
  ClipboardList,
  Clock,
  Calculator,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

const navigation = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Products", icon: Package, href: "/products" },
  { name: "Quotations", icon: ClipboardList, href: "/quotations" },
  { name: "Bookings", icon: Calendar, href: "/bookings" },
  { name: "Customers", icon: Users, href: "/customers" },
  { name: "Delivery", icon: Truck, href: "/delivery" },
  { name: "Invoicing", icon: FileText, href: "/invoicing" },
  { name: "Pricelists", icon: Calculator, href: "/pricelists" },
  { name: "Returns", icon: Clock, href: "/returns" },
  { name: "Payments", icon: CreditCard, href: "/payments" },
  { name: "Reports", icon: BarChart3, href: "/reports" },
  { name: "Notifications", icon: Bell, href: "/notifications" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar({ className, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className={cn("flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-lg", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">RentEase</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link key={item.name} to={item.href} onClick={handleNavClick}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3 font-medium rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'Not logged in'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;