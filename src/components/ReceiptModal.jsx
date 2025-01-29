/* eslint-disable react/prop-types */
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import html2canvas from "html2canvas";
import { useState } from "react";
import { LuBox } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export const ReceiptModal = ({ isOpen, onClose, orderDetails }) => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  if (!orderDetails) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      // Target the content div specifically
      const element = document.getElementById("receipt-content");
      if (!element) {
        throw new Error("Receipt content not found");
      }

      // Capture with specific configuration to match modal styling
      const canvas = await html2canvas(element, {
        backgroundColor: "#fefce8", // yellow-50
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied to the cloned element
          const clonedElement = clonedDoc.getElementById("receipt-content");
          if (clonedElement) {
            clonedElement.style.padding = "20px";
            clonedElement.style.borderRadius = "12px";
          }
        },
      });

      // Create and download the image
      const image = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.href = image;
      downloadLink.download = `Order_Receipt_${orderDetails.id.substring(
        0,
        6
      )}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAndClose = async () => {
    await handleDownload(); // Wait for download to complete
    onClose(); // Close the modal after download
  };

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
            Download this for your records{" "}
          </p>
        </ModalHeader>
        <ModalBody>
          <div
            id="receipt-content"
            className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
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
              onClick={handleDownloadAndClose}
              isLoading={downloading}
              className="w-full mb-4">
              {downloading ? "Downloading..." : "Download Receipt"}
            </Button>
            <div className="flex items-center justify-center space-x-2 text-yellow-700">
              <LuBox className="text-yellow-600" size={24} />
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
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReceiptModal;
