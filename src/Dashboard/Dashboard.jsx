import {
  LuShoppingCart,
  LuHome,
  
  LuSettings,
  LuLogOut,
  LuMessagesSquare,
  LuUser,
} from "react-icons/lu";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import { useEffect } from "react";



const Dashboard = () => {  

  return (
    <div className="min-h-screen bg-white text-base">
      <DashboardSidebar/>
      
          
    <Outlet/>
    </div>
  );
};

export default Dashboard;


const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { user, setSession } = useMyContext();

  
  useEffect(() => {
    if (user.user) { navigate("/") };
  }, []);
  


  const navItems = [
    { icon: LuHome, label: "Dashboard", path: "/dashboard" },
    { icon: LuShoppingCart, label: "My Orders", path: "/dashboard/orders" },
    { icon: LuMessagesSquare, label: "AI Chat", path: "/dashboard/chat" },
    {
      icon: LuUser,
      label: "Customers",
      path: "/dashboard/customers",
    },
    { icon: LuSettings, label: "Settings", path: "/dashboard/settings" },
    { icon: LuLogOut, label: "Logout", path: "/" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    await supabaseUtil.auth.signOut();
    setSession(null);
    navigate("/")
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-white border-r p-6">
      <nav className="flex-1">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.label === "Logout"
                  ? handleSignOut(item.path)
                  : handleNavigation(item.path);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left ${
                currentPath === item.path
                  ? "bg-gray-100 text-gray-600"
                  : item.label === "Logout"
                  ? "bg-red-50 text-red-400 hover:bg-red-100"
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <div className="mt-auto">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatar_url}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-gray-600">Premium Member</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};




