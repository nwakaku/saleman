/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import {
  Card,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { useState, useEffect, useCallback } from "react";
import { LuChevronRight, LuFileInput, LuFileText, LuLogOut, LuPlus } from "react-icons/lu";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

const SettingSection = ({ children, title, description }) => (
  <div className="border-b border-gray-200 py-6">
    <div className="mb-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
    {children}
  </div>
);

const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
      enabled ? "bg-green-500" : "bg-gray-200"
    }`}>
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const AddressCard = ({ address, isDefault, onEdit, onSetDefault }) => (
  <div className="bg-white border rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">{address.name}</p>
        <p className="text-sm text-gray-600 mt-1">{address.street}</p>
        <p className="text-sm text-gray-600">
          {address.city}, {address.state} {address.zip}
        </p>
        {isDefault && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
            Default
          </span>
        )}
      </div>
      <div className="flex space-x-2">
        <button onClick={onEdit} className="text-gray-400 hover:text-gray-500">
          <LuFileInput className="h-5 w-5" />
        </button>
      </div>
    </div>
    {!isDefault && (
      <button
        onClick={onSetDefault}
        className="mt-3 text-green-600 text-sm font-medium">
        Set as default
      </button>
    )}
  </div>
);

const PaymentMethodCard = ({ method, isDefault, onEdit, onSetDefault }) => (
  <div className="bg-white border rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">•••• •••• •••• {method.last_four}</p>
        <p className="text-sm text-gray-600 mt-1">Expires {method.expiry}</p>
        {isDefault && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
            Default
          </span>
        )}
      </div>
      <div className="flex space-x-2">
        <button onClick={onEdit} className="text-gray-400 hover:text-gray-500">
          <LuFileText className="h-5 w-5" />
        </button>
      </div>
    </div>
    {!isDefault && (
      <button
        onClick={onSetDefault}
        className="mt-3 text-green-600 text-sm font-medium">
        Set as default
      </button>
    )}
  </div>
);

export const Settings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, refreshUser, session, setSession } = useMyContext();
  const [editItem, setEditItem] = useState(null);

  // States from database
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [notifications, setNotifications] = useState(
    session?.user?.notification_preferences || {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      promotions: false,
    }
  );

  const [formData, setFormData] = useState({});

  // Add these new state and handler functions after the existing state declarations
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");

  const handleEditField = (field, value) => {
    setEditingField(field);
    setFieldValue(value || "");
    setIsModalOpen(true);
  };

  const navigate = useNavigate();

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabaseUtil
        .from("profiles")
        .update({ [editingField]: fieldValue })
        .eq("id", session?.user?.id);

      if (error) throw error;

      await refreshUser(); // Refresh user context
      handleCloseModal();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setLoading(false);
  };

  // Move these function definitions before the useEffect
  const fetchAddresses = useCallback(async () => {
    try {
      const { data, error } = await supabaseUtil
        .from("profiles")
        .select("addresses")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }, [user.id]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const { data, error } = await supabaseUtil
        .from("profiles")
        .select("payment_methods")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setPaymentMethods(data.payment_methods || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  }, [user.id]);

  // Then the useEffect
  useEffect(() => {
    fetchAddresses();
    fetchPaymentMethods();
    refreshUser();
  }, [fetchAddresses, fetchPaymentMethods]);

  // Update notification preferences
  const handleNotificationChange = async (key, value) => {
    const newPreferences = { ...notifications, [key]: value };
    setNotifications(newPreferences);

    try {
      const { error } = await supabaseUtil
        .from("profiles")
        .update({ notification_preferences: newPreferences })
        .eq("id", session?.user?.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating notifications:", error);
      setNotifications(notifications); // Revert on error
    }
  };

  // Update address operations
  const handleAddressUpdate = async (isNew = false) => {
    setLoading(true);
    try {
      const newAddress = {
        id: isNew ? crypto.randomUUID() : editItem.id,
        name: formData.name,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        is_default: formData.is_default || false,
      };

      let updatedAddresses;
      if (isNew) {
        updatedAddresses = [...addresses, newAddress];
      } else {
        updatedAddresses = addresses.map((addr) =>
          addr.id === editItem.id ? newAddress : addr
        );
      }

      const { error } = await supabaseUtil
        .from("profiles")
        .update({ addresses: updatedAddresses })
        .eq("id", session?.user?.id);

      if (error) throw error;
      setAddresses(updatedAddresses);
      handleCloseModal();
    } catch (error) {
      console.error("Error updating address:", error);
    }
    setLoading(false);
  };

  // Update payment method operations
  const handlePaymentMethodUpdate = async (isNew = false) => {
    setLoading(true);
    try {
      const newPaymentMethod = {
        id: isNew ? crypto.randomUUID() : editItem.id,
        last_four: formData.last_four,
        expiry: formData.expiry,
        is_default: formData.is_default || false,
      };

      let updatedPaymentMethods;
      if (isNew) {
        updatedPaymentMethods = [...paymentMethods, newPaymentMethod];
      } else {
        updatedPaymentMethods = paymentMethods.map((method) =>
          method.id === editItem.id ? newPaymentMethod : method
        );
      }

      const { error } = await supabaseUtil
        .from("profiles")
        .update({ payment_methods: updatedPaymentMethods })
        .eq("id", session?.user?.id);

      if (error) throw error;
      setPaymentMethods(updatedPaymentMethods);
      handleCloseModal();
    } catch (error) {
      console.error("Error updating payment method:", error);
    }
    setLoading(false);
  };

  // Modal handlers
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditItem(null);
    setFormData({});
  };

  // Update default handlers
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        is_default: addr.id === addressId,
      }));

      const { error } = await supabaseUtil
        .from("profiles")
        .update({ addresses: updatedAddresses })
        .eq("id", user.id);

      if (error) throw error;
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const handleSetDefaultPayment = async (paymentId) => {
    try {
      const updatedPaymentMethods = paymentMethods.map((method) => ({
        ...method,
        is_default: method.id === paymentId,
      }));

      const { error } = await supabaseUtil
        .from("profiles")
        .update({ payment_methods: updatedPaymentMethods })
        .eq("id", user.id);

      if (error) throw error;
      setPaymentMethods(updatedPaymentMethods);
    } catch (error) {
      console.error("Error setting default payment method:", error);
    }
  };

  const handleSignOut = async () => {
    await supabaseUtil.auth.signOut();
    setSession(null);
    navigate("/");
  };

  const handleNavigate = () => {
    navigate("/dashboard/upgrade");
  }

  return (
    <div className="lg:ml-64 pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-b">
        <h1 className="text-xl font-bold sm:text-2xl">Settings</h1>
      </div>

      <Card className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 my-2">
        {/* Personal Information */}
        <SettingSection
          title="Personal Information"
          description="Update your personal details and contact information.">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="mt-1">{user.full_name}</p>
              </div>
              <button
                onClick={() => handleEditField("full_name", user.full_name)}
                className="text-green-600 text-sm font-medium">
                Edit
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{user.email}</p>
              </div>
              <button
                onClick={() => handleEditField("email", user.email)}
                className="text-green-600 text-sm font-medium">
                Edit
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1">{user.phone || "Not set"}</p>
              </div>
              <button
                onClick={() => handleEditField("phone", user.phone)}
                className="text-green-600 text-sm font-medium">
                Edit
              </button>
            </div>
          </div>
        </SettingSection>

        {/* Notification Preferences */}
        <SettingSection
          title="Notification Preferences"
          description="Manage how you receive updates and alerts.">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive order updates via email
                </p>
              </div>
              <Toggle
                enabled={notifications.email}
                onChange={(enabled) =>
                  handleNotificationChange("email", enabled)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive alerts on your device
                </p>
              </div>
              <Toggle
                enabled={notifications.push}
                onChange={(enabled) =>
                  handleNotificationChange("push", enabled)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive text message updates
                </p>
              </div>
              <Toggle
                enabled={notifications.sms}
                onChange={(enabled) => handleNotificationChange("sms", enabled)}
              />
            </div>
          </div>
        </SettingSection>

        {/* Delivery Addresses */}
        <SettingSection
          title="Delivery Addresses"
          description="Manage your delivery locations.">
          <div className="space-y-4">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isDefault={address.is_default}
                onEdit={() => handleOpenModal("address", address)}
                onSetDefault={async () => {
                  await handleSetDefaultAddress(address.id);
                }}
              />
            ))}
            <button
              onClick={() => handleOpenModal("address")}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center">
              <LuPlus className="h-5 w-5 mr-2" />
              Add New Address
            </button>
          </div>
        </SettingSection>

        {/* Payment Methods */}
        <SettingSection
          title="Payment Methods"
          description="Manage your payment options.">
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                isDefault={method.is_default}
                onEdit={() => handleOpenModal("payment", method)}
                onSetDefault={async () => {
                  await handleSetDefaultPayment(method.id);
                }}
              />
            ))}
            <button
              onClick={() => handleOpenModal("payment")}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center">
              <LuPlus className="h-5 w-5 mr-2" />
              Add New Payment Method
            </button>
          </div>
        </SettingSection>

        {/* Security Settings */}
        <SettingSection
          title="Security"
          description="Manage your account security settings.">
          <div className="space-y-4">
            <button className="w-full flex justify-between items-center py-2 text-left">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-500">
                  Update your account password
                </p>
              </div>
              <LuChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button className="w-full flex justify-between items-center py-2 text-left">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security
                </p>
              </div>
              <LuChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </SettingSection>

        {/* Upgrade Setting */}
        {/* Upgrade Section */}
        <div className="bg-gray-100 mt-8 p-6 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Unlock Premium Features
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Get access to exclusive content and additional features by
              upgrading your account.
            </p>
          </div>
          <Button
            onClick={handleNavigate}
            className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-6 py-2 shadow-md">
            Upgrade
          </Button>
        </div>

        {/* Logout */}
        <SettingSection title="Logout" description="Logout of your account.">
          <div className="space-y-4">
            <Button
              onClick={handleSignOut}
              className="w-full flex justify-between lg:hidden bg-red-50 text-red-400 hover:bg-red-100 items-center py-2 text-center">
              <p className="font-medium">Logout</p>

              <LuLogOut className="h-5 w-5 text-red-400" />
            </Button>
          </div>
        </SettingSection>
      </Card>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Add Modal with dynamic content based on modalType */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>
                {modalType
                  ? modalType === "address"
                    ? editItem
                      ? "Edit Address"
                      : "Add New Address"
                    : modalType === "payment"
                    ? editItem
                      ? "Edit Payment Method"
                      : "Add Payment Method"
                    : "Form"
                  : `Edit ${editingField
                      ?.split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}`}
              </ModalHeader>
              <ModalBody>
                {modalType === "address" && (
                  <div className="space-y-4">
                    <Input
                      label="Name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <Input
                      label="Street Address"
                      value={formData.street || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        value={formData.city || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                      <Input
                        label="State"
                        value={formData.state || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                      />
                    </div>
                    <Input
                      label="ZIP Code"
                      value={formData.zip || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                    />
                  </div>
                )}
                {modalType === "payment" && (
                  <div className="space-y-4">
                    <Input
                      label="Last 4 Digits"
                      maxLength={4}
                      value={formData.last_four || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, last_four: e.target.value })
                      }
                    />
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={formData.expiry || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, expiry: e.target.value })
                      }
                    />
                  </div>
                )}
                {!modalType && editingField && (
                  <Input
                    label={editingField
                      ?.split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    if (modalType === "address") {
                      handleAddressUpdate(!editItem);
                    } else if (modalType === "payment") {
                      handlePaymentMethodUpdate(!editItem);
                    } else {
                      handleUpdateProfile();
                    }
                  }}
                  isLoading={loading}>
                  {editItem ? "Update" : "Add"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Settings;
