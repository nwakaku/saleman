/* eslint-disable react/prop-types */
import { useEffect, useRef, forwardRef } from "react";
import QRCodeStyling from "qr-code-styling";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Avatar,
} from "@nextui-org/react";
import { LuQrCode, LuDownload, LuSmartphone, LuStar } from "react-icons/lu";

const QRContainer = forwardRef((_, ref) => {
  return <div ref={ref} />;
});

QRContainer.displayName = "QRContainer";

const QRCodeModal = ({ isOpen, onClose, menuUrl, marketName, marketImage }) => {
  const qrRef = useRef(null);
  const qrCode = useRef(null);

  // Initialize QR code
  useEffect(() => {
    if (menuUrl) {
      qrCode.current = new QRCodeStyling({
        width: 350,
        height: 350,
        data: menuUrl,
        dotsOptions: {
          color: "#854D0E",
          type: "dots",
        },
        backgroundOptions: {
          color: "#FFFBEB",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
        },
        qrOptions: {
          errorCorrectionLevel: "H",
        },
        image: marketImage,
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#854D0E",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#854D0E",
        },
      });
    }
  }, [menuUrl, marketImage]);

  // Handle mounting/unmounting of QR code
  useEffect(() => {
    if (isOpen && qrCode.current && qrRef.current) {
      // Clear the container first
      while (qrRef.current.firstChild) {
        qrRef.current.removeChild(qrRef.current.firstChild);
      }
      // Append the QR code
      qrCode.current.append(qrRef.current);
    }

    // Cleanup function
    return () => {
      if (qrRef.current) {
        while (qrRef.current.firstChild) {
          qrRef.current.removeChild(qrRef.current.firstChild);
        }
      }
    };
  }, [isOpen, qrCode.current]);

  const handleDownload = () => {
    if (qrCode.current) {
      qrCode.current.download({
        extension: "png",
        name: `${marketName}-menu-qr`,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      backdrop="blur"
      className="bg-gradient-to-br from-white to-yellow-50">
      <ModalContent className="rounded-3xl shadow-2xl border-2 border-yellow-100">
        <ModalHeader className="flex flex-col items-center justify-center py-8 bg-gradient-to-r from-yellow-100 to-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <LuQrCode className="text-yellow-800" size={32} />
            <h3 className="text-3xl font-bold text-yellow-900">
              Saleman Smart Menu
            </h3>
          </div>
          <p className="text-yellow-700 flex items-center space-x-1">
            <LuSmartphone className="mr-2" />
            Scan to explore our curated menu
          </p>
        </ModalHeader>

        <ModalBody className="p-8 flex flex-col items-center space-y-8">
          {menuUrl && (
            <div className="relative group">
              <div className="absolute -inset-2 bg-yellow-200 rounded-3xl opacity-50 group-hover:opacity-75 blur-xl transition duration-300"></div>
              <div className="relative bg-white p-6 rounded-3xl shadow-2xl border-2 border-yellow-100 flex flex-col items-center space-y-4">
                <div className="bg-yellow-50 p-4 rounded-xl shadow-md">
                  <QRContainer ref={qrRef} />
                </div>

                <div className="flex items-center space-x-4">
                  <Avatar
                    src={marketImage}
                    className="w-20 h-20 rounded-full border-4 border-yellow-300 shadow-lg"
                  />
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <h4 className="text-2xl font-bold text-yellow-900">
                        {marketName}
                      </h4>
                      <LuStar
                        className="text-yellow-500 fill-yellow-500"
                        size={20}
                      />
                    </div>
                    <p className="text-yellow-700 text-sm">Tap, Scan, Savor</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            color="warning"
            variant="solid"
            className="w-full max-w-md group hover:scale-105 transition-transform duration-300"
            startContent={
              <LuDownload className="group-hover:animate-bounce" size={24} />
            }
            onClick={handleDownload}>
            Download QR Code
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QRCodeModal;
