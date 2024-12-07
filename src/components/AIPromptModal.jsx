/* eslint-disable react/prop-types */
import { useState, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Input,
} from "@nextui-org/react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import {
  LuSparkles,
  LuFileEdit,
  LuChevronDown,
  LuChevronUp,
  LuPlus,
} from "react-icons/lu";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
// import { sampleLists } from "../data/dummyList";

const AddItemModal = ({ isOpen, onClose, onAdd }) => {
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    unit: "",
    price: 0,
    note: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...newItem,
      id: Date.now(), // Simple way to generate unique ID
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Add New Item</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Item Name"
                isRequired
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <div className="flex gap-4">
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  isRequired
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      quantity: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                />
                <Input
                  label="Unit (e.g., kg, pcs)"
                  isRequired
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, unit: e.target.value }))
                  }
                />
              </div>
              <Input
                label="Price per unit (₦)"
                type="number"
                min="0"
                isRequired
                value={newItem.price}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    price: Math.max(0, parseInt(e.target.value) || 0),
                  }))
                }
              />
              <Input
                label="Note (optional)"
                value={newItem.note}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, note: e.target.value }))
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 text-white hover:bg-green-700">
              Add Item
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const CategorySection = ({
  category,
  onUpdateQuantity,
  onDeleteItem,
  onEditItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="mb-4">
      <CardHeader
        className="flex flex-row items-center justify-between cursor-pointer py-2"
        onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="text-lg font-semibold">{category.name}</h3>
        {isExpanded ? <LuChevronUp /> : <LuChevronDown />}
      </CardHeader>
      {isExpanded && (
        <CardBody className="p-4">
          {category.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 mb-4 p-2 hover:bg-gray-50 rounded-lg">
              <img
                src={
                  item.image
                    ? item.image
                    : "https://cdn.arabsstock.com/uploads/images/156537/image-156537-various-goods-foodstuffs-supermarket-shelves-purchasing-thumbnail.webp"
                }
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">
                  ₦{item.price.toLocaleString()} per {item.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() =>
                      onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))
                    }
                    className="text-gray-600 hover:text-gray-800">
                    <FiMinus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="text-gray-600 hover:text-gray-800">
                    <FiPlus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="bg-red-100"
                  onClick={() => onDeleteItem(item.id)}>
                  <FiX className="w-4 h-4 text-red-500" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditItem(item)}>
                  <LuFileEdit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      )}
    </Card>
  );
};

const AIPromptModal = ({ isOpen, onClose, prompt, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedList, setGeneratedList] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [listName, setListName] = useState("");
  const [error, setError] = useState(null);

  const callSambanovaAPI = async (userPrompt) => {
    try {
      const response = await fetch("http://localhost:3000/api/generate-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to call API: ${error.message}`);
    }
  };

  // Add this utility function at the top of your file
  const calculateTotalCost = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleAddItem = (newItem) => {
    if (generatedList) {
      const updatedItems = [...generatedList.items, newItem];
      const updatedList = {
        ...generatedList,
        items: [...generatedList.items, newItem],
        totalItems: generatedList.totalItems + 1,
        totalCost: calculateTotalCost(updatedItems),
      };
      setGeneratedList(updatedList);
    } else {
      // Create a new list if none exists
      const items = [newItem];
      setGeneratedList({
        name: listName || "My Shopping List",
        budget: 0,
        items: [newItem],
        totalItems: 1,
        totalCost: calculateTotalCost(items),
      });
    }
  };

  const extractJSONFromResponse = (response) => {
    try {
      // Find JSON content between triple backticks
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        // Parse the extracted JSON
        return JSON.parse(jsonMatch[1]);
      }

      // If no JSON found between backticks, try to find array directly
      const arrayMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }

      throw new Error("No valid JSON found in response");
    } catch (error) {
      console.error("JSON parsing error:", error);
      throw new Error("Failed to parse API response");
    }
  };

  const handleGenerateList = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const apiResponse = await callSambanovaAPI(prompt);

      // Extract the items array from the response
      const items = extractJSONFromResponse(
        apiResponse.choices[0].message.content
      );

      // Format the list
      const formattedList = {
        name: listName || "AI Generated List",
        items: items.map((item) => ({
          ...item,
          id: `ai-${Date.now()}-${item.id}`,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity) || 1,
          unit: item.unit || "piece",
          image:
            "https://cdn.arabsstock.com/uploads/images/156537/image-156537-various-goods-foodstuffs-supermarket-shelves-purchasing-thumbnail.webp",
        })),
        budget: 0,
        totalItems: items.length,
      };

      // Calculate total cost
      formattedList.totalCost = calculateTotalCost(formattedList.items);

      // Clear progress interval and set final state
      clearInterval(progressInterval);
      setProgress(100);
      setGeneratedList(formattedList);
    } catch (error) {
      setError(`Failed to generate list: ${error.message}`);
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  }, [prompt, listName]);

  // Update the handleUpdateQuantity function
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (generatedList) {
      const updatedItems = generatedList.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      const updatedList = {
        ...generatedList,
        items: updatedItems,
        totalCost: calculateTotalCost(updatedItems),
      };
      setGeneratedList(updatedList);
    }
  };

  // Update the handleDeleteItem function
  const handleDeleteItem = (itemId) => {
    if (generatedList) {
      const updatedItems = generatedList.items.filter(
        (item) => item.id !== itemId
      );
      const updatedList = {
        ...generatedList,
        items: updatedItems,
        totalCost: calculateTotalCost(updatedItems),
      };
      setGeneratedList(updatedList);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      handleUpdateQuantity(editingItem.id, editingItem.quantity);
      setEditingItem(null);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <LuSparkles className="w-5 h-5 text-green-400" />
            <span>AI Shopping Assistant</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {!generatedList && !loading && (
                <div className="space-y-4">
                  <Input
                    label="List Name"
                    placeholder="e.g., Easter Grocery List"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="mb-4"
                  />
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Your prompt:</p>
                    <p className="text-gray-900 font-medium">{prompt}</p>
                  </div>
                </div>
              )}

              {generatedList && (
                <div className="space-y-4">
                  <div className="flex justify-between gap-2 items-center">
                    <Input
                      value={listName || generatedList.name}
                      placeholder="Name Of This List"
                      onChange={(e) => setListName(e.target.value)}
                      className="max-w-md"
                    />
                    <Button
                      onClick={() => setIsAddingItem(true)}
                      className="bg-green-600 text-white hover:bg-green-700"
                      startContent={<LuPlus />}>
                      Add Item
                    </Button>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">
                      Shopping List Details
                    </h3>
                    <p className="text-sm text-green-600">
                      Budget: ₦{generatedList.budget.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">
                      Current Total: ₦{generatedList.totalCost.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">
                      Items: {generatedList.items.length}
                    </p>
                  </div>

                  <CategorySection
                    category={generatedList}
                    onUpdateQuantity={handleUpdateQuantity}
                    onDeleteItem={handleDeleteItem}
                    onEditItem={handleEditItem}
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {loading && (
                <div className="space-y-2">
                  <Progress
                    size="sm"
                    color="success"
                    value={progress}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Analyzing your requirements and generating a personalized
                    list...
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose} className="mr-2">
              {generatedList ? "Discard" : "Cancel"}
            </Button>
            {!generatedList ? (
              <Button
                onClick={handleGenerateList}
                disabled={loading}
                className="bg-green-600 text-white hover:bg-green-700">
                Generate List
              </Button>
            ) : (
              <Button
                onClick={() => onConfirm({ ...generatedList, name: listName })}
                className="bg-green-600 text-white hover:bg-green-700">
                Add to Cart
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        size="sm">
        <ModalContent>
          <ModalHeader>Edit Item</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Quantity"
                type="number"
                min="0"
                value={editingItem?.quantity || 0}
                onChange={(e) => {
                  setEditingItem((prev) => ({
                    ...prev,
                    quantity: Math.max(0, parseInt(e.target.value) || 0),
                  }));
                }}
              />
              <Input
                label="Price per unit"
                type="number"
                min="0"
                disabled
                value={editingItem?.price || 0}
                onChange={(e) => {
                  setEditingItem((prev) => ({
                    ...prev,
                    price: Math.max(0, parseInt(e.target.value) || 0),
                  }));
                }}
              />
              <Input
                label="Note on Item"
                value={editingItem?.note || ""}
                onChange={(e) => {
                  setEditingItem((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }));
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setEditingItem(null)}
              className="mr-2">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-green-600 text-white hover:bg-green-700">
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddingItem}
        onClose={() => setIsAddingItem(false)}
        onAdd={handleAddItem}
      />
    </>
  );
};

export default AIPromptModal;
