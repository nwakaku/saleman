/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Switch,
  Divider,
  RadioGroup,
  Radio,
  Textarea,
} from "@nextui-org/react";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiX,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import { useNavigate } from "react-router-dom";
import { usePaystackPayment } from "react-paystack";

const ShoppingCart = ({ cartItems, setCartItems }) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [saveSubscription, setSaveSubscription] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { session } = useMyContext();
  const navigate = useNavigate();
  const [subscriptionFrequency, setSubscriptionFrequency] = useState("monthly");

  console.log(isProcessingPayment);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = subtotal / 10;
  const serviceFee = 50.0;
  const totalAmount = subtotal + deliveryFee + serviceFee;

  const config = {
    reference: `order_${new Date().getTime()}`,
    email: session?.user?.email,
    amount: Math.round(totalAmount * 100),
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        {
          user_id: session?.user?.id,
          delivery_address: deliveryAddress,
          delivery_time: deliveryTime,
        },
      ],
    },
  };

  const saveOrder = async () => {
    try {
      const getNextDeliveryDate = () => {
        const today = new Date();
        switch (subscriptionFrequency) {
          case "weekly":
            return new Date(today.setDate(today.getDate() + 7));
          case "biweekly":
            return new Date(today.setDate(today.getDate() + 14));
          case "monthly":
            return new Date(today.setMonth(today.getMonth() + 1));
          default:
            return new Date(today.setDate(today.getDate() + 7));
        }
      };

      const { data, error } = await supabaseUtil.from("orders").insert([
        {
          user_id: session.user.id,
          items: cartItems,
          total_amount: totalAmount,
          status: "pending",
          delivery_address: deliveryAddress,
          delivery_time: deliveryTime,
          special_instructions: specialInstructions,
          is_subscription: saveSubscription,
          subscription_status: saveSubscription ? "active" : null,
          subscription_frequency: saveSubscription
            ? subscriptionFrequency
            : null,
          next_delivery_date: saveSubscription ? getNextDeliveryDate() : null,
        },
      ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving order:", error);
      throw error;
    }
  };

  const onSuccess = async (response) => {
    console.log("Payment successful", response); // Add this log
    setIsProcessingPayment(true);
    try {
      await saveOrder(); // Save the order
      setCartItems([]);
      console.log("Order placed successfully");
      setIsCheckoutOpen(false);
      navigate("/dashboard/orders");
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const onClose = () => {
    console.log({
      title: "Payment Cancelled",
      description: "You have cancelled the payment process.",
    });
  };

  const handleCancel = () => {
    setCartItems([]);
    setDeliveryAddress("");
    setDeliveryTime("");
    setSpecialInstructions("");
    setSaveSubscription(false);
    setIsCheckoutOpen(false);
  };

  const updateQuantity = (itemId, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const initializePayment = usePaystackPayment(config);

  const handleCheckout = async () => {
    if (!session) {
      console.log({
        title: "Authentication Required",
        description: "Please login to continue with checkout.",
      });
      navigate("/login");
      return;
    }

    if (!deliveryAddress || !deliveryTime) {
      console.log({
        title: "Missing Information",
        description: "Please fill in all required delivery details.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      initializePayment(onSuccess, onClose);
      await saveOrder();
    } catch {
      console.log({
        title: "Checkout Error",
        description: "Unable to initialize payment. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deliveryTimeOptions = [
    { id: "1", time: "Morning, 8:00 AM - 11:00 AM", available: true },
    { id: "2", time: "Afternoon, 11:00 AM - 3:00 PM", available: true },
    { id: "3", time: "Evening, 3:00 PM - 7:00 PM", available: true },
    { id: "4", time: "Evening, 7:00 PM - 11:00 PM", available: false },
  ];

  useEffect(() => {
    const fetchAddress = async () => {
      if (!session?.user?.id || !isCheckoutOpen) return;

      try {
        const { data, error } = await supabaseUtil
          .from("profiles")
          .select("addresses")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        const addresses = data.addresses || [];
        // Use default address or first address
        const defaultAddress =
          addresses.find((addr) => addr.is_default) || addresses[0];

        if (defaultAddress) {
          setDeliveryAddress(formatAddress(defaultAddress));
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    };

    fetchAddress();
  }, [session?.user?.id, isCheckoutOpen]);

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.name}\n${address.street}\n${address.city}, ${address.state} ${address.zip}`;
  };

  return (
    <div className="lg:flex h-full flex-col">
      <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        <CardBody className="p-4 flex flex-col">
          {/* Cart Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <FiShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Your Cart</h2>
            </div>
            {cartItems.length > 0 && (
              <span className="text-sm font-medium text-gray-500">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {/* Empty State */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FiShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-700 font-medium mb-1">
                  Your cart is empty
                </h3>
                <p className="text-sm text-gray-500">
                  Add items to get started with your order
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-2 group hover:bg-gray-50 rounded-lg transition-colors duration-150 px-2">
                      <img
                        src={item.image || "/api/placeholder/48/48"}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ₦{item.price.toFixed(2)} / {item.unit || "item"}
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          ₦{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-gray-600 hover:text-gray-800">
                            <FiMinus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-gray-600 hover:text-gray-800">
                            <FiPlus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          onClick={() => removeFromCart(item.id)}>
                          <FiX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Divider />

                {/* Price Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₦{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">
                      ₦{deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">
                      ₦{serviceFee.toFixed(2)}
                    </span>
                  </div>
                  <Divider />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₦{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <Button
            color="success"
            size="lg"
            className="w-full mt-4 font-medium"
            onClick={() => setIsCheckoutOpen(true)}>
            Proceed to Checkout
            <FiChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </CardBody>
      </Card>

      {/* Checkout Modal */}
      <Modal size="2xl" isOpen={isCheckoutOpen} onClose={() => handleCancel()}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">Checkout</h3>
            <p className="text-sm text-gray-500">Complete your order details</p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Delivery Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FiMapPin className="w-4 h-4" />
                  Delivery Address
                </label>
                <Textarea
                  placeholder="Enter your complete delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Delivery Time */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FiClock className="w-4 h-4" />
                  Delivery Time
                </label>
                <RadioGroup
                  value={deliveryTime}
                  onValueChange={setDeliveryTime}>
                  <div className="grid gap-2">
                    {deliveryTimeOptions.map((option) => (
                      <Radio
                        key={option.id}
                        value={option.id}
                        disabled={!option.available}>
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={
                              option.available
                                ? "text-gray-700"
                                : "text-gray-400"
                            }>
                            {option.time}
                          </span>
                          {!option.available && (
                            <span className="text-xs text-red-500">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </Radio>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FiAlertCircle className="w-4 h-4" />
                  Special Instructions
                </label>
                <Textarea
                  placeholder="Add any special delivery instructions..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Save for Subscription */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Make this a recurring order</span>
                  </div>
                  <Switch
                    defaultSelected
                    checked={saveSubscription}
                    onChange={() => setSaveSubscription(!saveSubscription)}
                  />
                </div>

                {/* Subscription Frequency Selection */}
                {saveSubscription && (
                  <div className="ml-6 hidden">
                    <RadioGroup
                      value={subscriptionFrequency}
                      onValueChange={setSubscriptionFrequency}
                      defaultValue="monthly"
                      size="sm">
                      <div className="space-y-2">
                        <Radio value="weekly">Weekly Delivery</Radio>
                        <Radio value="biweekly">Bi-weekly Delivery</Radio>
                        <Radio value="monthly">Monthly Delivery</Radio>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-gray-500 mt-2">
                      Your first delivery will be processed immediately, and
                      subsequent deliveries will be scheduled according to your
                      chosen frequency.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={() => handleCancel()}>
              Cancel
            </Button>
            <Button
              color="success"
              onClick={handleCheckout}
              isLoading={isLoading}>
              Place Order • ₦{totalAmount.toFixed(2)}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ShoppingCart;
