/* eslint-disable react/prop-types */
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import App from "./App";
import Dashboard from "./Dashboard/Dashboard";
import { DashboardHome } from "./Dashboard/DashboardHome";
import { MyOrders } from "./Dashboard/MyOrder";
import Settings from "./Dashboard/Settings";
import { useMyContext } from "./context/MyContext";
import Header from "./components/Header";
import AIChat from "./Dashboard/AIChat";
import { MenuPage } from "./components/MenuPage";
import TestimonialPage from "./components/TestimonialPage";
import ManageCustomers from "./Dashboard/ManageCustomers";

const AppRoutes = () => {


  const PrivateRoute = ({ children }) => {
    const { session } = useMyContext(); // Fix: Add parentheses to hook call
    const location = useLocation();

    if (!session) {
      // Redirect to login while saving the attempted URL
      return <Navigate to="/" replace state={{ from: location }} />;
    }

    return children;
  };

  return (
    <Router>
      <div className="layout">
        <Header />
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }>
            <Route path="" element={<DashboardHome />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="chat" element={<AIChat />} />
            <Route path="customers" element={<ManageCustomers />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/menu/:menuId" element={<MenuPage />} />
          <Route path="/testimonials/:menuId" element={<TestimonialPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRoutes;
