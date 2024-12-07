/* eslint-disable no-unused-vars */
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
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import {
  LuAlertCircle,
  LuCalendar,
  LuUser,
  LuPhone,
  LuMessageSquare,
  LuTrash2,
} from "react-icons/lu";
import BottomNav from "../components/BottomNav";

export function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionType, setActionType] = useState("");
  const { session } = useMyContext();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customers from Supabase
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);
      try {
        // First get the marketplace ID
        const { data: marketplaceData, error: marketplaceError } =
          await supabaseUtil
            .from("marketplaces")
            .select("id")
            .eq("user_id", session.user.id)
            .single();

        if (marketplaceError) throw marketplaceError;

        // Get orders
        const { data: ordersData, error: ordersError } = await supabaseUtil
          .from("orders")
          .select(
            `
            id,
            customer_phone,
            created_at,
            restaurant_id
          `
          )
          .eq("restaurant_id", marketplaceData.id)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        // Get testimonials for the marketplace
        const { data: testimonialsData, error: testimonialsError } =
          await supabaseUtil
            .from("testimonials")
            .select("*")
            .eq("market_id", marketplaceData.id);

        if (testimonialsError) throw testimonialsError;

        // Create a map of phone numbers to testimonials
        const testimonialsByPhone = testimonialsData.reduce(
          (acc, testimonial) => {
            acc[testimonial.phone_number] = testimonial.content;
            return acc;
          },
          {}
        );

        // Format and deduplicate customers based on phone number
        const uniqueCustomers = Array.from(
          ordersData
            .reduce((map, order) => {
              if (!map.has(order.customer_phone)) {
                map.set(order.customer_phone, {
                  id: order.id,
                  phone: order.customer_phone,
                  testimonial:
                    testimonialsByPhone[order.customer_phone] ||
                    "No feedback yet",
                  lastOrder: order.created_at,
                  orderCount: 1,
                });
              } else {
                map.get(order.customer_phone).orderCount += 1;
              }
              return map;
            }, new Map())
            .values()
        );

        setCustomers(uniqueCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [session?.user?.id]);

  // Delete customer
  const handleDeleteCustomer = async () => {
    try {
      // In a real app, you might want to handle this differently
      // Here we're just removing them from the local state
      setCustomers((customers) =>
        customers.filter((customer) => customer.id !== selectedCustomer.id)
      );
      onClose();
    } catch (error) {
      console.error("Error removing customer:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Open modal for actions
  const openActionModal = (customer, action) => {
    setSelectedCustomer(customer);
    setActionType(action);
    onOpen();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 lg:ml-64 px-4 pb-24 lg:pb-4">
      <div>
        <Card className="w-full shadow-sm">
          <CardHeader className="flex flex-col gap-3 p-4 sm:p-6">
            <div className="flex justify-between items-center w-full">
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                  My Customers
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Manage your customer relationships
                </p>
              </div>
            </div>
          </CardHeader>

          <Divider />

          <CardBody className="p-0">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Customer
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Contact
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Feedback
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Last Order
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Orders
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <LuUser className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {customer.name}
                            </h3>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <LuPhone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <LuMessageSquare className="h-4 w-4 text-gray-400" />
                          <span className="text-sm truncate max-w-xs">
                            {customer.testimonial}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <LuCalendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(customer.lastOrder)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Chip size="sm" variant="flat" color="success">
                          {customer.orderCount} orders
                        </Chip>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onClick={() => openActionModal(customer, "delete")}>
                            <LuTrash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="space-y-3 sm:hidden p-4">
              {customers.map((customer) => (
                <Card key={customer.id} className="shadow-sm">
                  <CardBody className="p-4">
                    <div className="flex gap-3">
                      <div className="bg-green-100 p-2 h-fit rounded-lg">
                        <LuUser className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-800">
                            {customer.name}
                          </h3>
                          <Chip size="sm" variant="flat" color="success">
                            {customer.orderCount} orders
                          </Chip>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <LuPhone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <LuMessageSquare className="h-4 w-4 text-gray-400" />
                            <span className="text-sm truncate">
                              {customer.testimonial}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <LuCalendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {formatDate(customer.lastOrder)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => openActionModal(customer, "delete")}>
                            <LuTrash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-lg">Remove Customer</ModalHeader>
              <ModalBody>
                <div className="flex items-start gap-3">
                  <LuAlertCircle className="h-5 w-5 text-danger mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm">
                      Are you sure you want to remove this customer:
                    </p>
                    <p className="font-medium mt-1">{selectedCustomer?.name}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      This will only remove them from your customer list. Their
                      order history will be preserved.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} size="sm">
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteCustomer} size="sm">
                  Yes, Remove Customer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <BottomNav />
    </div>
  );
}

export default ManageCustomers;
