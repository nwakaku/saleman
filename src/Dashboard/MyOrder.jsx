/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@nextui-org/react";
import {
  LuChevronRight,
  LuShoppingCart,
  LuClock,
  LuPackage,
  LuTruck,
  LuCheck,
  LuLoader2,
} from "react-icons/lu";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import BottomNav from "../components/BottomNav";
import { toast } from "react-hot-toast";

// Change from React.memo to regular functions
const getStatusColor = (status) => {
  const colors = {
    pending: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    on_the_way: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getStatusText = (status) => {
  const texts = {
    pending: "Pending",
    processing: "Processing",
    on_the_way: "On the way",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return texts[status] || status;
};

// Keep React.memo for actual components
const TrackingProgress = React.memo(({ currentStep }) => {
  const stepIcons = {
    pending: LuClock,
    processing: LuPackage,
    on_the_way: LuTruck,
    delivered: LuCheck,
  };

  const allSteps = ["pending", "processing", "on_the_way", "delivered"];
  const currentStepIndex = allSteps.indexOf(currentStep);

  return (
    <div className="flex items-center w-full mt-4">
      {allSteps.map((step, index) => {
        const Icon = stepIcons[step];
        const isCompleted = currentStepIndex >= index;
        const isLast = index === allSteps.length - 1;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                }`}>
                <Icon
                  className={`h-4 w-4 ${
                    isCompleted ? "text-white" : "text-gray-500"
                  }`}
                />
              </div>
            </div>
            {!isLast && (
              <div
                className={`h-0.5 flex-1 ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});
TrackingProgress.displayName = "TrackingProgress";

// Memoized OrderCard component with improved loading and error handling
const OrderCard = React.memo(({ order, onOrderUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkDone = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabaseUtil
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", order.id);

      if (error) throw error;

      toast.success("Order marked as delivered!");
      onOrderUpdate(order.id, "delivered");
    } catch (error) {
      console.error("Error marking order as done:", error);
      toast.error("Failed to mark order as done");
    } finally {
      setIsLoading(false);
    }
  }, [order.id, onOrderUpdate]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className="bg-white border rounded-xl p-4 sm:p-6 hover:border-green-500 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-green-50 p-2 rounded-lg">
            <LuShoppingCart className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-medium">
            Order #{order.id.toString().slice(0, 4)}
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          {order.items.length} items • ₦{order.total_amount.toFixed(2)}
        </p>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              order.status
            )}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        <TrackingProgress currentStep={order.status} />

        <button
          onClick={toggleExpand}
          className="mt-4 text-green-600 text-sm font-medium flex items-center space-x-1">
          <span>{isExpanded ? "Hide Details" : "View Details"}</span>
          <LuChevronRight
            className={`h-4 w-4 transform transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Order Items</h4>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-gray-600">
                    ₦{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Owner</h4>
              <p className="text-sm text-gray-600">{order.customer_phone}</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Delivery Address</h4>
              <p className="text-sm text-gray-600">{order.delivery_address}</p>
            </div>
            {order.status !== "delivered" && (
              <Button
                size="sm"
                color="success"
                variant="flat"
                className="w-full mt-2"
                onClick={handleMarkDone}
                disabled={isLoading}
                startContent={
                  isLoading ? <LuLoader2 className="animate-spin" /> : null
                }>
                {isLoading ? "Marking..." : "Mark Done"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
OrderCard.displayName = "OrderCard";

// New function to categorize dates
const categorizeDate = (dateString) => {
  const orderDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (orderDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (orderDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    // Format for other dates
    return orderDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year:
        orderDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
};

// GroupedOrderSection Component
const GroupedOrderSection = React.memo(
  ({ dateCategory, orders, onOrderUpdate }) => {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
          {dateCategory}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOrderUpdate={onOrderUpdate}
            />
          ))}
        </div>
      </div>
    );
  }
);
GroupedOrderSection.displayName = "GroupedOrderSection";

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useMyContext();

  const fetchOrders = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      // Fetch the marketplace associated with the user
      const { data: marketplaceData, error: marketplaceError } =
        await supabaseUtil
          .from("marketplaces")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

      if (marketplaceError) throw marketplaceError;

      const marketplaceId = marketplaceData.id;

      // Fetch orders for the marketplace
      const { data, error } = await supabaseUtil
        .from("orders")
        .select("*")
        .eq("restaurant_id", marketplaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderUpdate = useCallback((orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  }, []);

  // Group orders by date category
  const groupedOrders = useMemo(() => {
    return orders.reduce((acc, order) => {
      const dateCategory = categorizeDate(order.created_at);
      if (!acc[dateCategory]) {
        acc[dateCategory] = [];
      }
      acc[dateCategory].push(order);
      return acc;
    }, {});
  }, [orders]);

  if (isLoading) {
    return (
      <div className="lg:ml-64 flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="lg:ml-64 pt-0 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-b">
        <h1 className="text-xl font-bold sm:text-2xl">Orders Received</h1>
      </div>
      <main className="px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto">
          {Object.keys(groupedOrders).length > 0 ? (
            Object.entries(groupedOrders).map(
              ([dateCategory, categoryOrders]) => (
                <GroupedOrderSection
                  key={dateCategory}
                  dateCategory={dateCategory}
                  orders={categoryOrders}
                  onOrderUpdate={handleOrderUpdate}
                />
              )
            )
          ) : (
            <div className="text-center text-gray-500">No orders yet</div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

// Set display name for the component
MyOrders.displayName = "MyOrders";

export default MyOrders;
