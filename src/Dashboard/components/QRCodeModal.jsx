/* eslint-disable react/prop-types */
// import { useState } from "react";
// import captureWebsite from "capture-website";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@nextui-org/react";
import { QRCodeSVG } from "qrcode.react";

const QRCodeModal = ({
  isOpen,
  onClose,
  menuUrl,
  menuItemsCount,
  marketName,
}) => {
  // const [isDownloading, setIsDownloading] = useState(false);

  // const handleDownloadQR = async () => {
  //   const qrContainer = document.getElementById("qr-container");

  //   if (qrContainer) {
  //     setIsDownloading(true);
  //     try {
  //       const dataUrl = await captureWebsite.buffer(qrContainer, {
  //         width: 800,
  //         height: 600,
  //         type: "png",
  //         scaleFactor: 2,
  //       });

  //       const blob = new Blob([dataUrl], { type: "image/png" });
  //       const url = URL.createObjectURL(blob);
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.download = `${marketName}-menu-qr.png`;
  //       link.click();
  //       URL.revokeObjectURL(url);
  //     } catch (error) {
  //       console.error("Download error:", error);
  //     } finally {
  //       setIsDownloading(false);
  //     }
  //   }
  // };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center">
          <h3 className="text-2xl font-bold">Menu QR Code</h3>
          <p className="text-sm text-gray-500">Scan to view menu</p>
        </ModalHeader>
        <ModalBody className="flex flex-col items-center justify-center space-y-6">
          {menuUrl && (
            <div
              id="qr-container"
              className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG
                  value={menuUrl}
                  size={250}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="mt-4 text-center text-gray-600">
                {marketName} - {menuItemsCount} items
              </p>
              <p className="text-sm text-gray-500 break-all">{menuUrl}</p>
            </div>
          )}
          <Button
            color="success"
            variant="solid"
            className="w-full max-w-md"
            
          >
            {"Download QR Code"}
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QRCodeModal;
