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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 py-12 px-4">
      <div className="max-w-6xl mx-auto relative">
        {/* Cart Summary - Emerald Gold */}
        <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-xl rounded-xl p-4 shadow-xl border border-emerald-200 w-64 cursor-pointer hover:shadow-2xl transition-all duration-300">
          <p className="text-emerald-900 font-serif">Checkout</p>
          <div className="flex justify-between">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <LuShoppingCart className="text-emerald-700" size={24} />
              <span className="font-semibold text-emerald-900">
                {selectedItems.length} Items
              </span>
            </div>
            <p className="text-emerald-900 font-bold mt-1 text-center sm:text-left">
              ₦ {calculateTotal()}
            </p>
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardBody className="p-4 sm:p-8">
            {/* Restaurant Header with Gold Accents */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar
                  src={menuData.cover_image}
                  className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl"
                />
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl text-emerald-900 font-serif font-bold tracking-wide">
                    {menuData.name}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start mt-2 space-x-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <LuStar
                          key={star}
                          className="text-yellow-400 fill-yellow-400"
                          size={20}
                        />
                      ))}
                    </div>
                    <p className="text-emerald-700 text-sm font-serif ml-2">
                      {menuData.tagline || "Luxury Dining Experience"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuData.menu?.map((item) => (
                <Card
                  key={item.id}
                  className="group hover:scale-105 transition-all duration-300 bg-white/90 shadow-xl hover:shadow-2xl border border-yellow-200">
                  <div className="relative overflow-hidden">
                    <Avatar
                      src={item.image}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Chip
                      size="sm"
                      className="absolute top-2 right-2 bg-white/90 text-emerald-900 font-serif">
                      <LuClock size={16} className="mr-1 inline" />
                      30 mins
                    </Chip>
                  </div>

                  <CardBody className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <h3 className="text-xl text-emerald-900 font-serif font-bold">
                          {item.name}
                        </h3>
                        <p className="text-emerald-700 text-sm mt-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <Chip className="bg-yellow-100 text-emerald-900 font-serif font-bold border border-yellow-300">
                          ₦ {item.price.toFixed(2)}
                        </Chip>
                        <Button
                          color="success"
                          variant="ghost"
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900"
                          startContent={<LuShoppingCart size={20} />}
                          onClick={() => addToCart(item)}>
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Footer with Gold Accents */}
            <div className="mt-12 border-t border-yellow-200 pt-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-6">
                  {["Facebook", "Instagram", "Twitter"].map((social) => (
                    <Button
                      key={social}
                      variant="light"
                      className="bg-yellow-100 hover:bg-yellow-200 text-emerald-900 border border-yellow-300"
                      size="sm">
                      {social}
                    </Button>
                  ))}
                </div>
                <p className="text-emerald-700 font-serif text-center">
                  Indulge in exceptional culinary artistry
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default MenuPage;
