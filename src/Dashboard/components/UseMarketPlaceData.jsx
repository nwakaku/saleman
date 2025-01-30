import { useState, useEffect } from "react";
import supabaseUtil from "../../utils/supabase";

// Custom hook for marketplace data with caching
const useMarketplaceData = (userId) => {
  const [market, setMarket] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCachedData = () => {
      const cachedData = localStorage.getItem(`marketplace_${userId}`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setMarket(parsed.market);
        setMenuItems(parsed.menuItems);
        setIsLoading(false);
      }
    };

    console.log("now now")

    const fetchAndCacheData = async () => {
      try {
        const { data, error } = await supabaseUtil
          .from("marketplaces")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          // Update state
          setMarket(data);
          setMenuItems(data.menu || []);

          // Cache the data
          localStorage.setItem(
            `marketplace_${userId}`,
            JSON.stringify({
              market: data,
              menuItems: data.menu || [],
              timestamp: Date.now(),
            })
          );
        }
      } catch (err) {
        setError(err);
        console.error("Error fetching marketplace:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      // Load cached data first
      loadCachedData();
      // Then fetch fresh data
      fetchAndCacheData();
    }
  }, [userId]);

  return { market, menuItems, isLoading, setIsLoading, error, setMarket, setMenuItems };
};

export default useMarketplaceData;
