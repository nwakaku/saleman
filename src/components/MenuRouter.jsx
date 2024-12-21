import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import supabaseUtil from "../utils/supabase";
import { CircularProgress } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import MenuPage from "./MenuPage";
import MenuPage2 from "./MenuPage2";

const MenuRouter = () => {
  const { menuId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketplaceTheme = async () => {
      try {
        const { data, error } = await supabaseUtil
          .from("marketplaces")
          .select("theme")
          .eq("id", menuId)
          .single();

        if (error) {
          throw error;
        }

        setTheme(data?.theme || "vanilla"); // Default to vanilla if no theme is set
      } catch (err) {
        console.error("Error fetching marketplace theme:", err);
        setError(err);
        toast.error("Failed to load menu theme");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceTheme();
  }, [menuId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <CircularProgress color="warning" size="lg" />
      </div>
    );
  }

  if (error) {
    return <Navigate to="/" replace />;
  }

  // Route to appropriate menu page based on theme
  switch (theme) {
    case "vanilla":
      return <MenuPage />;
    case "strawberry":
      return <MenuPage2 />;
    default:
      return <MenuPage />; // Default to vanilla theme
  }
};

export default MenuRouter;
