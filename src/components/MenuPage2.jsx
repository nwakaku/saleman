import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
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
  background: "#B91C1C", // Light yellow background
  color: "#fff", // Dark text color
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
};

export const MenuPage2 = () => {
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
        <div
          onClick={onOpen}
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-xl rounded-xl p-4 shadow-xl border border-red-200 w-64 cursor-pointer hover:shadow-2xl transition-all duration-300">
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
          {isCheckoutLoading && (
            <div className="flex items-center justify-center mt-2">
              <CircularProgress color="danger" size="sm" />
              <span className="ml-2 text-red-700">Processing...</span>
            </div>
          )}
        </div>

        {/* Checkout Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          backdrop="blur"
          className="text-yellow-900 max-h-[95vh] overflow-y-auto">
          <ModalContent className="max-h-[95vh] overflow-y-auto">
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Your Order</h2>
              <p className="text-sm text-yellow-700">
                {menuData?.name} - Dining Experience
              </p>
            </ModalHeader>
            <ModalBody>
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-3 pt-3">
                  <div className="flex items-center space-x-4">
                    <Avatar src={item.image} className="w-16 h-16 rounded-lg" />
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-yellow-700">
                        ₦ {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-yellow-100 rounded-full w-8 h-8 flex items-center justify-center">
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-yellow-100 rounded-full w-8 h-8 flex items-center justify-center">
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 ml-2">
                      <LuTrash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <label className="block text-yellow-700 mb-2" htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-yellow-300 rounded"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="w-full">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-xl">
                    Total{" "}
                    <span className="text-sm italic font-light">
                      {selectedItems.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      ) >= SERVICE_CHARGE_THRESHOLD
                        ? "+ service Fee"
                        : ""}
                    </span>
                  </span>
                  <span className="font-bold text-xl text-yellow-800">
                    ₦ {calculateTotal()}
                  </span>
                </div>
                <Button
                  color="warning"
                  variant="solid"
                  className={`w-full ${
                    !phoneNumber ? "opacity-50 cursor-not-allowed" : ""
                  }`} // Add styles for disabled state
                  onClick={() => {
                    if (phoneNumber) {
                      handleCheckout();
                      onClose();
                    }
                  }}
                  onTouchStart={() => {
                    if (phoneNumber) {
                      handleCheckout();
                      onClose();
                    }
                  }}
                  disabled={!phoneNumber} // Disable button if phoneNumber is empty
                >
                  <LuCreditCard className="mr-2" />
                  Proceed to Checkout
                </Button>
              </div>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Receipt Modal */}
        {isReceiptOpen && orderDetails && (
          <ReceiptModal
            orderDetails={orderDetails}
            onClose={() => setIsReceiptOpen(false)}
            isOpen={isReceiptOpen}
          />
        )}

        <Toaster position="top-center" />

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl lg:p-8 p-4 mb-12 shadow-xl border border-red-200">
          {/* Restaurant Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 ">
            <div className="flex lg:flex-row flex-col justify-center items-center lg:space-x-6 gap-2 ">
              <div className="relative">
                <img
                  src={menuData.cover_image}
                  alt="Restaurant Logo"
                  className="w-20 h-20 rounded-full object-cover border-4 border-red-700 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-red-700 text-white px-3 py-1 rounded-full text-sm flex">
                  {[...Array(5)].map((_, i) => (
                    <LuStar
                      key={i}
                      className="text-red-500 fill-white"
                      size={15}
                    />
                  ))}
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-red-900 tracking-tight">
                  {menuData.name}
                </h2>
                <div className="flex items-center mt-1 text-sm">
                  <span className=" text-red-700">
                    {menuData.tagline || "Luxury Dining Experience"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Section */}
          {menuData.menu && menuData.menu.length > 0 ? (
            <div className="flex flex-col space-y-4">
              <div className="flex flex-row space-x-4 overflow-x-auto scrollbar-hide pb-2 ">
                <Chip
                  className="bg-white border shrink-0 cursor-pointer "
                  radius="sm">
                  Food
                </Chip>
                <Chip
                  className="shrink-0 cursor-pointer text-red-900"
                  radius="sm">
                  Proteins
                </Chip>
                <Chip
                  className="shrink-0 cursor-pointer text-red-900"
                  radius="sm">
                  Pastries
                </Chip>
                <Chip
                  className="shrink-0 cursor-pointer text-red-900"
                  radius="sm">
                  Cakes
                </Chip>
                <Chip
                  className="shrink-0 cursor-pointer text-red-900"
                  radius="sm">
                  Shawarma
                </Chip>
                <Chip
                  className="shrink-0 cursor-pointer text-red-900"
                  radius="sm">
                  Drinks
                </Chip>
                <Chip
                  className="shrink-0 cursor-pointer text-red-900"
                  radius="sm">
                  Snacks
                </Chip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {menuData.menu.map((item) => (
                  <Card
                    key={item.name}
                    className="group border-l-4 border-red-500">
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
                            <Chip
                              className="bg-red-900 text-red-200 font-bold mt-2"
                              size="sm">
                              ₦ {item.price.toFixed(2)}
                            </Chip>
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
                          <p className="text-red-700 text-sm">
                            {item.description}
                          </p>
                        </div>
                        <div className="mt-auto">
                          <Button
                            onTouchStart={() => addToCart(item)} // Add touch event
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(item);
                            }}
                            className="w-full flex items-center justify-center space-x-2 bg-red-700 text-white px-4 py-2 text-sm rounded-full hover:bg-red-800 transition-colors">
                            <span>Add to Cart</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-red-600 text-xl">No menu items available</p>
            </div>
          )}

          {/* Footer Banner */}
          <div className="mt-16 bg-red-900 text-white rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-white-700">
              <LuBox className="text-white-600" size={24} />
              <span className="text-sm font-medium">
                Powered by
                <span
                  className="font-bold ml-1 text-black cursor-pointer"
                  onClick={() => navigate("/")}>
                  <span className="text-green-700">Sale</span>
                  man.xyz
                </span>
              </span>
            </div>

            {/* New Testimonial Button */}
            <div className="flex flex-col lg:flex-row lg:space-y-0 space-y-4 justify-around items-center w-full">
              <div className=" flex justify-center space-x-4">
                <a
                  href="https://facebook.com/saleman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 hover:text-white-900 transition-colors duration-300 bg-white/90 lg:border-2 border-white-400 rounded-full p-1 lg:p-2">
                  <LuFacebook size={20} />
                </a>
                <a
                  href="https://instagram.com/saleman.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 hover:text-white-900 transition-colors duration-300 bg-white/90 lg:border-2 border-white-400 rounded-full p-1 lg:p-2">
                  <LuInstagram size={20} />
                </a>
                <a
                  href="https://twitter.com/saleman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 hover:text-white-900 transition-colors duration-300 bg-white/90 lg:border-2 border-white-400 rounded-full p-1 lg:p-2">
                  <LuTwitter size={20} />
                </a>
              </div>
              <Button
                color="warning"
                variant="bordered"
                className="group hover:bg-white-100 transition-all duration-300"
                endContent={
                  <LuMoveRight
                    className="group-hover:text-white-900 text-white-700"
                    size={20}
                  />
                }
                onTouchStart={() => {
                  navigate(`/testimonials/${menuId}`);
                }}
                onClick={() => navigate(`/testimonials/${menuId}`)}>
                <span className="text-white group-hover:text-white font-semibold">
                  Customer Testimonials
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage2;
