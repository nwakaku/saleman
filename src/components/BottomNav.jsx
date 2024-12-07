import { useNavigate } from "react-router-dom";
import { LuHome, LuShoppingCart, LuSettings, LuUser } from "react-icons/lu";

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around py-4">
          {[
            { icon: LuHome, label: "Dashboard", path: "/dashboard" },
            {
              icon: LuShoppingCart,
              label: "My Orders",
              path: "/dashboard/orders",
            },
            { icon: LuUser, label: "Customers", path: "/dashboard/customers" },
            {
              icon: LuSettings,
              label: "Settings",
              path: "/dashboard/settings",
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center space-y-1">
              <item.icon className="h-6 w-6 text-gray-600" />
              <span className="text-xs text-gray-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav; 