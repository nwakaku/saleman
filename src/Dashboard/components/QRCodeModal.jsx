/* eslint-disable react/prop-types */
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Avatar,
} from "@nextui-org/react";
import { QRCodeSVG } from "qrcode.react";
import { LuQrCode, LuDownload, LuSmartphone, LuStar } from "react-icons/lu";

const QRCodeModal = ({ isOpen, onClose, menuUrl, marketName, marketImage }) => {
  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `${marketName}-menu-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
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
                  <QRCodeSVG
                    value={menuUrl}
                    size={350}
                    level="H"
                    includeMargin={true}
                    fgColor="#854D0E" // Deep amber color
                    bgColor="#FFFBEB" // Light yellow background
                  />
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
