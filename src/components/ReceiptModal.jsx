/* eslint-disable react/prop-types */
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { LuBox } from "react-icons/lu";

export const ReceiptModal = ({ isOpen, onClose, orderDetails }) => {
  if (!orderDetails) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      backdrop="blur"
      className="text-yellow-900">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-yellow-900">Order Receipt</h2>
          <p className="text-sm text-yellow-700 italic">
            ScreenShot this might disappear{" "}
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
            <div className="flex justify-between mb-2 border-b border-yellow-200 pb-2">
              <span className="text-yellow-700">Order ID:</span>
              <span className="font-semibold text-yellow-900">
                {orderDetails.id.substring(0, 6)}
              </span>
            </div>
            <div className="flex justify-between mb-2 border-b border-yellow-200 pb-2">
              <span className="text-yellow-700">Phone Number:</span>
              <span className="font-semibold text-yellow-900">
                {orderDetails.phone_number}
              </span>
            </div>
            <div className="flex justify-between mb-4 border-b border-yellow-200 pb-2">
              <span className="text-yellow-700">Date:</span>
              <span className="font-semibold text-yellow-900">
                {new Date(orderDetails.created_at).toLocaleString()}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-inner">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Order Items
              </h3>
              {orderDetails.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-yellow-800 mb-1">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₦ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-4 pt-2 border-t border-yellow-200">
              <span className="text-xl font-bold text-yellow-900">Total</span>
              <span className="text-xl font-bold text-yellow-900">
                ₦ {orderDetails.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="w-full flex flex-col items-center">
            <Button
              color="warning"
              variant="solid"
              onClick={onClose}
              className="w-full mb-4">
              Close Receipt
            </Button>
            <div className="flex items-center space-x-2 text-yellow-700">
              <LuBox className="text-yellow-600" size={24} />
              <span className="text-sm font-medium">
                Powered by
                <span className="font-bold ml-1 text-yellow-900">saleman</span>
              </span>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReceiptModal;
