import { useEffect } from "react";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import {
  LuAlertCircle,
  LuCalendar,
  LuFileEdit,
  
  LuPackage,
  LuPause,
  LuPlay,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export function ManageSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSub, setSelectedSub] = useState(null);
  const [actionType, setActionType] = useState("");
  const navigate = useNavigate();
  const { session } = useMyContext();
  const [orderItems, setOrderItems] = useState([]);

  // Fetch subscriptions from Supabase
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data, error } = await supabaseUtil
          .from("orders")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("is_subscription", true)
          .not("subscription_status", "eq", "cancelled")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedSubscriptions = data.map(order => ({
          id: order.id,
          name: `Order #${order.id}`,
          items: order.items.length,
          frequency: order.subscription_frequency,
          nextDelivery: order.next_delivery_date,
          status: order.subscription_status,
          total_amount: order.total_amount,
          delivery_address: order.delivery_address,
          delivery_time: order.delivery_time,
          special_instructions: order.special_instructions
        }));

        setSubscriptions(formattedSubscriptions);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    if (session?.user?.id) {
      fetchSubscriptions();
    }
  }, [session?.user?.id]);

  // Update subscription status in Supabase
  const handleStatusChange = async (id) => {
    try {
      const subscription = subscriptions.find(sub => sub.id === id);
      const newStatus = subscription.status === "active" ? "paused" : "active";

      const { error } = await supabaseUtil
        .from("orders")
        .update({ subscription_status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setSubscriptions(subs =>
        subs.map(sub => {
          if (sub.id === id) {
            return { ...sub, status: newStatus };
          }
          return sub;
        })
      );
    } catch (error) {
      console.error("Error updating subscription status:", error);
    }
  };

  // Update subscription frequency in Supabase
  const handleFrequencyChange = async (id, newFrequency) => {
    try {
      const { error } = await supabaseUtil
        .from("orders")
        .update({ 
          subscription_frequency: newFrequency,
          next_delivery_date: calculateNextDeliveryDate(newFrequency)
        })
        .eq("id", id);

      if (error) throw error;

      setSubscriptions(subs =>
        subs.map(sub => {
          if (sub.id === id) {
            return { 
              ...sub, 
              frequency: newFrequency,
              nextDelivery: calculateNextDeliveryDate(newFrequency)
            };
          }
          return sub;
        })
      );
    } catch (error) {
      console.error("Error updating subscription frequency:", error);
    }
  };

  // Calculate next delivery date based on frequency
  const calculateNextDeliveryDate = (frequency) => {
    const today = new Date();
    switch (frequency) {
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

  // Handle subscription cancellation
  const handleDeleteSubscription = async () => {
    try {
      const { error } = await supabaseUtil
        .from("orders")
        .update({ 
          subscription_status: "cancelled",
          is_subscription: false 
        })
        .eq("id", selectedSub.id);

      if (error) throw error;

      setSubscriptions(subs => subs.filter(sub => sub.id !== selectedSub.id));
      onClose();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };

  // Add function to fetch order items
  const fetchOrderItems = async (orderId) => {
    try {
      const { data, error } = await supabaseUtil
        .from("orders")
        .select("items")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrderItems(data.items);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  // Modify openActionModal to fetch items when editing
  const openActionModal = (sub, action) => {
    setSelectedSub(sub);
    setActionType(action);
    if (action === "edit") {
      fetchOrderItems(sub.id);
    }
    onOpen();
  };

  // Add function to update order items
  const handleUpdateItems = async () => {
    try {
      const { error } = await supabaseUtil
        .from("orders")
        .update({ 
          items: orderItems,
          // total_amount: calculateNewTotal(orderItems) // You'll need to implement this
        })
        .eq("id", selectedSub.id);

      if (error) throw error;

      setSubscriptions(subs =>
        subs.map(sub => {
          if (sub.id === selectedSub.id) {
            return { 
              ...sub, 
              items: orderItems.length,
              // total_amount: calculateNewTotal(orderItems)
            };
          }
          return sub;
        })
      );
      onClose();
    } catch (error) {
      console.error("Error updating order items:", error);
    }
  };

  const getChipColor = (status) => {
    return status === "active"
      ? "success"
      : status === "paused"
      ? "warning"
      : "default";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleNavigate = () => {
    navigate("/aiList");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 lg:ml-64 px-4 pb-24 lg:pb-4">
      <div>
        <Card className="w-full shadow-sm">
          <CardHeader className="flex flex-col gap-3 p-4 sm:p-6">
            <div className="flex justify-between items-center w-full">
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                  My Subscriptions
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Manage your recurring deliveries
                </p>
              </div>
              <Button
                onClick={() => handleNavigate()}
                className="bg-gray-600 text-white"
                startContent={<LuPlus />}
                size="md">
                Add New
              </Button>
            </div>
          </CardHeader>

          <Divider />

          <CardBody className="p-0 sm:p-6">
            {/* Mobile View */}
            <div className="space-y-3 sm:hidden">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className="shadow-sm">
                  <CardBody className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1">
                        <div className="bg-success/10 p-2 rounded-lg flex-shrink-0">
                          <LuPackage className="h-5 w-5 text-success" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-800 truncate">
                              {sub.name.slice(0, 12)}
                            </h3>
                            <Chip
                              color={getChipColor(sub.status)}
                              variant="flat"
                              size="sm"
                              className="ml-2">
                              {sub.status.charAt(0).toUpperCase() +
                                sub.status.slice(1)}
                            </Chip>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {sub.items} items
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <LuCalendar className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {formatDate(sub.nextDelivery)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Divider className="my-3" />

                    <div className="flex items-center justify-between">
                      <Select
                        size="sm"
                        value={sub.frequency}
                        label={sub.frequency}
                        onChange={(e) =>
                          handleFrequencyChange(sub.id, e.target.value)
                        }
                        className="max-w-[120px]">
                        <SelectItem key="weekly">Weekly</SelectItem>
                        <SelectItem key="biweekly">Bi-weekly</SelectItem>
                        <SelectItem key="monthly">Monthly</SelectItem>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onClick={() => openActionModal(sub, "edit")}>
                          <LuFileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          color={
                            sub.status === "active" ? "warning" : "success"
                          }
                          variant="light"
                          isIconOnly
                          onClick={() => handleStatusChange(sub.id)}>
                          {sub.status === "active" ? (
                            <LuPause className="h-4 w-4" />
                          ) : (
                            <LuPlay className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          isIconOnly
                          onClick={() => openActionModal(sub, "delete")}>
                          <LuTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Subscription
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Frequency
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Next Delivery
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-success/10 p-2 rounded-lg">
                            <LuPackage className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {sub.name.substring(0, 12)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {sub.items} items
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Select
                          size="sm"
                          value={sub.frequency}
                          label={sub.frequency}
                          onChange={(e) =>
                            handleFrequencyChange(sub.id, e.target.value)
                          }
                          className="max-w-[140px]">
                          <SelectItem key="weekly">Weekly</SelectItem>
                          <SelectItem key="biweekly">Bi-weekly</SelectItem>
                          <SelectItem key="monthly">Monthly</SelectItem>
                        </Select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <LuCalendar className="h-4 w-4" />
                          <span>{formatDate(sub.nextDelivery)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Chip
                          color={getChipColor(sub.status)}
                          variant="flat"
                          size="sm">
                          {sub.status.charAt(0).toUpperCase() +
                            sub.status.slice(1)}
                        </Chip>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Tooltip content="Edit">
                            <Button
                              size="sm"
                              variant="flat"
                              isIconOnly
                              onClick={() => openActionModal(sub, "edit")}>
                              <LuFileEdit className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip
                            content={
                              sub.status === "active" ? "Pause" : "Resume"
                            }>
                            <Button
                              size="sm"
                              color={
                                sub.status === "active" ? "warning" : "success"
                              }
                              variant="flat"
                              isIconOnly
                              onClick={() => handleStatusChange(sub.id)}>
                              {sub.status === "active" ? (
                                <LuPause className="h-4 w-4" />
                              ) : (
                                <LuPlay className="h-4 w-4" />
                              )}
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete">
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              isIconOnly
                              onClick={() => openActionModal(sub, "delete")}>
                              <LuTrash2 className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={actionType === "edit" ? "md" : "sm"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-lg">
                {actionType === "delete"
                  ? "Cancel Subscription"
                  : "Edit Subscription"}
              </ModalHeader>
              <ModalBody>
                {actionType === "delete" ? (
                  <div className="flex items-start gap-3">
                    <LuAlertCircle className="h-5 w-5 text-danger mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm">
                        Are you sure you want to cancel your subscription to:
                      </p>
                      <p className="font-medium mt-1">{selectedSub?.name}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {
                          "This action cannot be undone. You'll need to create a new subscription if you want to resume deliveries."
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm">
                      Edit subscription items for {selectedSub?.name?.substring(0, 6)}...
                      <br />
                      <span className="text-xs text-gray-500">The changes will only reflect on the next order</span>
                    </p>
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            isIconOnly
                            variant="flat"
                            onClick={() => {
                              const newItems = [...orderItems];
                              newItems[index].quantity = Math.max(1, (item.quantity || 1) - 1);
                              setOrderItems(newItems);
                            }}>
                            -
                          </Button>
                          <span>{item.quantity || 1}</span>
                          <Button
                            size="sm"
                            isIconOnly
                            variant="flat"
                            onClick={() => {
                              const newItems = [...orderItems];
                              newItems[index].quantity = (item.quantity || 1) + 1;
                              setOrderItems(newItems);
                            }}>
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} size="sm">
                  Cancel
                </Button>
                <Button
                  color={actionType === "delete" ? "danger" : "primary"}
                  onPress={actionType === "delete" ? handleDeleteSubscription : handleUpdateItems}
                  size="sm">
                  {actionType === "delete"
                    ? "Yes, Cancel Subscription"
                    : "Save Changes"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
