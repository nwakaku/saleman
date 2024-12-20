/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import supabaseUtil from "../utils/supabase";
import {
  LuClock,
  LuShoppingCart,
  LuStar,
  LuBox,
  LuTrash2,
  LuCreditCard,
  LuFacebook,
  LuInstagram,
  LuTwitter,
  LuMoveRight,
  LuHeart,
} from "react-icons/lu";
import ReceiptModal from "./ReceiptModal";
import Paystack from "@paystack/inline-js";
import { toast, Toaster } from "react-hot-toast";

const SERVICE_CHARGE_THRESHOLD = 10000; // Threshold for applying service charge
const SERVICE_CHARGE = 100; // Service charge in naira

const customToastStyle = {
  background: "#fefcbf", // Light yellow background
  color: "#4a4a4a", // Dark text color
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
};

export const MenuPage = () => {
  const { menuId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [menuData, setMenuData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data, error } = await supabaseUtil
          .from("marketplaces")
          .select("*")
          .eq("id", menuId)
          .single();

        if (error) throw error;
        setMenuData(data);
      } catch (error) {
        console.error("Error fetching menu:", error);
        toast.error("Failed to load menu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [menuId]);

  const addToCart = (item) => {
    const existingItem = selectedItems.find(
      (selectedItem) => selectedItem.id === item.id
    );
    if (existingItem) {
      setSelectedItems(
        selectedItems.map((selectedItem) =>
          selectedItem.id === item.id
            ? { ...selectedItem, quantity: selectedItem.quantity + 1 }
            : selectedItem
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} added to cart`, {
      style: customToastStyle,
      duration: 1000, // Duration in milliseconds
    });
  };

  const removeFromCart = (itemId) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const calculateTotal = () => {
    const itemsTotal = selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Apply service charge only if total is 10,000 or more
    const finalTotal =
      itemsTotal >= SERVICE_CHARGE_THRESHOLD
        ? itemsTotal + SERVICE_CHARGE
        : itemsTotal;

    return finalTotal.toFixed(2);
  };

  const saveOrder = async () => {
    try {
      if (!phoneNumber) {
        toast.error("Please provide a phone number");
        return null;
      }

      const itemsTotal = selectedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      const orderData = {
        restaurant_id: menuId,
        items: selectedItems,
        total_amount: parseFloat(calculateTotal()),
        service_charge:
          itemsTotal >= SERVICE_CHARGE_THRESHOLD ? SERVICE_CHARGE : 0,
        status: "pending",
        customer_phone: phoneNumber,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseUtil
        .from("orders")
        .insert([orderData])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save order");
      throw error;
    }
  };

  const handleCheckout = async () => {
    if (!phoneNumber) {
      toast.error("Please provide a phone number");
      return;
    }

    setIsCheckoutLoading(true);
    toast.success("Proceeding to checkout");

    try {
      const paymentConfig = {
        reference: `order_${new Date().getTime()}`,
        email: "sample@email.com", // Replace with the user's email
        phone: phoneNumber,
        amount: calculateTotal() * 100, // Amount in kobo
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        metadata: {
          custom_fields: [
            {
              market_id: menuId,
              phone_number: phoneNumber,
            },
          ],
        },
      };

      const paystack = new Paystack();
      paystack.newTransaction({
        key: paymentConfig.publicKey,
        email: paymentConfig.email,
        amount: paymentConfig.amount,
        phone: paymentConfig.phone,
        onSuccess: async (response) => {
          console.log("Payment successful", response);

          const orderData = await saveOrder();
          if (!orderData || !orderData[0]) {
            throw new Error("Failed to create order");
          }

          const orderDetails = {
            id: orderData[0].id,
            phone_number: phoneNumber,
            total_amount: parseFloat(calculateTotal()),
            items: selectedItems,
            created_at: new Date().toISOString(),
          };

          setOrderDetails(orderDetails);
          setSelectedItems([]);
          toast.success("Order placed successfully!", {
            style: customToastStyle,
            duration: 3000,
          });
          setIsReceiptOpen(true);
          onClose();
        },
        onLoad: (response) => {
          toast.info("Loading successfully!");
          console.log("onLoad: ", response);
        },
        onCancel: () => {
          console.log("Payment was canceled");
          toast.error("Payment was canceled");
        },
        onError: (error) => {
          console.error("Payment error:", error);
          toast.error("Payment failed. Please try again.");
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process checkout");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CircularProgress color="warning" size="lg" />
      </div>
    );

  if (!menuData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
        <p className="text-xl text-yellow-800">Menu not available</p>
      </div>
    );
  
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Cart Summary - Emerald Gold */}
        <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-xl rounded-xl p-4 shadow-xl border border-red-200 w-64 cursor-pointer hover:shadow-2xl transition-all duration-300">
          <p className="text-red-900 font-serif">Checkout</p>
          <div className="flex justify-between">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <LuShoppingCart className="text-red-700" size={24} />
              <span className="font-semibold text-red-900">
                {selectedItems.length} Items
              </span>
            </div>
            <p className="text-red-900 font-bold mt-1 text-center sm:text-left">
              ₦ {calculateTotal()}
            </p>
          </div>
        </div>

        {/* Restaurant Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 mb-12 shadow-xl border border-red-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={menuData.cover_image}
                  alt="Restaurant Logo"
                  className="w-28 h-28 rounded-full object-cover border-4 border-red-700 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-red-700 text-white px-3 py-1 rounded-full text-sm flex">
                  {[...Array(5)].map((_, i) => (
                    <LuStar
                      key={i}
                      className="text-red-500 fill-white"
                      size={20}
                    />
                  ))}
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-red-900 tracking-tight">
                  {menuData.name}
                </h2>
                <div className="flex items-center mt-1">
                  <span className=" text-red-700">
                    {menuData.tagline || "Luxury Dining Experience"}
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Menu Section */}
        {menuData.menu && menuData.menu.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuData.menu.map((item) => (
              <Card key={item.name} className="group border-l-4 border-red-500">
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl border border-red-100 grid grid-cols-2">
                  <div className="relative h-full">
                    <div className="w-full h-full">
                      <img
                        src={item.image || "/api/placeholder/200/300"}
                        alt={item.name}
                        className="w-48 h-48 object-cover"
                      />
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg group-hover:bg-red-50 transition-colors">
                        <LuHeart className="text-red-500 w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex justify-between items-end">
                        <span className="text-white text-sm font-medium">
                          French Cuisine
                        </span>
                        <span className="bg-red-700 text-white px-3 py-1 rounded-full text-sm">
                          ₦{item.price?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col h-full">
                    <div className="flex-grow">
                      <h3
                        className="text-xl font-bold text-red-900 mb-2 truncate"
                        title={item.name}>
                        {truncateText(item.name, 14)}
                      </h3>
                      <p className="text-red-700 text-sm">{item.description}</p>
                    </div>
                    <div className="mt-auto">
                      <button className="w-full flex items-center justify-center space-x-2 bg-red-700 text-white px-4 py-2 text-sm rounded-full hover:bg-red-800 transition-colors">
                        <luShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Footer Banner */}
        <div className="mt-16 bg-red-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Experience Culinary Excellence
          </h2>
          <p className="text-red-100 max-w-2xl mx-auto">
            Join us for an unforgettable dining experience where traditional
            French cuisine meets modern culinary artistry.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
