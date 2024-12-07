/* eslint-disable react/prop-types */
import  { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Avatar,
} from "@nextui-org/react";
import { LuImage } from "react-icons/lu";

const EditMenuItemModal = ({
  isOpen,
  onClose,
  item,
  onSave,
  isLoading,
  onImageUpload,
}) => {
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    // Update local state when item prop changes
    setEditingItem(item ? { ...item } : null);
  }, [item]);

  if (!editingItem) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>Edit Menu Item</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Name"
              value={editingItem.name || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              label="Price"
              type="number"
              value={editingItem.price || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value),
                }))
              }
            />
            <Input
              label="Description"
              value={editingItem.description || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <div className="relative">
              <Avatar
                src={editingItem.image || "/api/placeholder/200/200"}
                className="w-full h-40 rounded-xl"
              />
              <label className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-3 cursor-pointer">
                <LuImage className="text-xl" />
                <input
                  type="file"
                  className="hidden"
                  onChange={onImageUpload}
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="success"
            isLoading={isLoading}
            onPress={() => onSave(editingItem.id, editingItem)}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditMenuItemModal;
