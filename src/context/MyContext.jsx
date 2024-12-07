/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
// src/context/MyContext.jsx
import { createContext, useContext, useState } from "react";
import supabaseUtil from "../utils/supabase";

const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [session, setSession] = useState(null);
  const [isAIMode, setIsAIMode] = useState(true);
  const [selectedTags, setSelectedTags] = useState([
    "Monthly company Dinner of 500",
    "Grocery for family of 6",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [showCart, setShowCart] = useState(true);

  const [cartItems, setCartItems] = useState([
    {
      id: "Pasta",
      image:
        "https://www.instacart.com/image-server/394x394/filters:fill(FFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_7aaf24e6-dcdd-4eac-b7f3-248efde80c8f.jpeg",
      name: "Pasta",
      quantity: 2,
      unit: "pack",
      price: 1500,
    },
    {
      id: "Tomatoes",
      image:
        "https://www.instacart.com/image-server/394x394/filters:fill(FFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_9ce9e4a9-0ceb-4bbb-8813-eda8d677fcd5.jpeg",
      name: "Tomatoes",
      quantity: 3,
      unit: "dozen",
      price: 500,
    },
  ]);

  const refreshUser = async () => {
    try {
      const { data: profile, error } = await supabaseUtil
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      setUser(profile);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // New state for balance visibility
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  // Method to toggle balance visibility
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  return (
    <MyContext.Provider
      value={{
        user,
        setUser,
        refreshUser,
        session,
        setSession,
        searchQuery,
        setSearchQuery,
        isPromptModalOpen,
        setIsPromptModalOpen,
        cartItems,
        setCartItems,
        isAIMode,
        setIsAIMode,
        selectedTags,
        showCart,
        setShowCart,
        setSelectedTags,
        isBalanceVisible,
        setIsBalanceVisible,
        toggleBalanceVisibility,
      }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  return useContext(MyContext);
};
