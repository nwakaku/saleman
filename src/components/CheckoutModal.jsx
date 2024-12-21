/* eslint-disable react/prop-types */
import { memo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
} from "@nextui-org/react";
import { LuTrash2, LuCreditCard } from "react-icons/lu";

const CheckoutModal = memo(
  ({
    isOpen,
    onClose,
    selectedItems,
    phoneNumber,
    setPhoneNumber,
    updateQuantity,
    removeFromCart,
    handleCheckout,
    calculateTotal,
    restaurantName,
    SERVICE_CHARGE_THRESHOLD,
  }) => {
    return (
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
              {restaurantName} - Dining Experience
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
                    <p className="text-yellow-700">₦ {item.price.toFixed(2)}</p>
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
                }`}
                onClick={() => {
                  if (phoneNumber) {
                    handleCheckout();
                    onClose();
                  }
                }}
                disabled={!phoneNumber}>
                <LuCreditCard className="mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

CheckoutModal.displayName = "CheckoutModal";

export default CheckoutModal;
