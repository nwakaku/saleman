/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Button, Input, Avatar } from "@nextui-org/react";
import { LuImage } from "react-icons/lu";

const EditMarketProfileModal = ({
  isOpen,
  onClose,
  market,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: market?.name || "",
    tagline: market?.tagline || "",
    cover_image: market?.cover_image || null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        cover_image: reader.result,
      }));
    };
    reader.onerror = () => {
      alert("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await onSave(formData);
      onClose(); // Close modal after successful save
    } catch (error) {
      console.error("Error updating market profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isDismissable={!isSaving}
      hideCloseButton={isSaving}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Market Profile
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar
                    src={formData.cover_image || "/api/placeholder/80/80"}
                    className="w-32 h-32 rounded-xl ring-4 ring-green-100 ring-offset-2"
                  />
                  <div className="flex justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isSaving}
                    />
                    <Button
                      color="success"
                      variant="flat"
                      startContent={<LuImage />}
                      onClick={handleImageButtonClick}
                      isDisabled={isSaving}>
                      Update Image
                    </Button>
                  </div>
                </div>

                <Input
                  label="Market Name"
                  placeholder="Enter market name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  isDisabled={isSaving}
                  required
                />

                <Input
                  label="Tagline"
                  placeholder="Enter market tagline"
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tagline: e.target.value,
                    }))
                  }
                  isDisabled={isSaving}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                isDisabled={isSaving}>
                Cancel
              </Button>
              <Button
                color="success"
                onPress={handleSubmit}
                isLoading={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditMarketProfileModal;
