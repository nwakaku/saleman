/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button, Input, Avatar } from "@nextui-org/react";
import { LuImage } from "react-icons/lu";

const DishForm = ({ onAddMenuItem, isLoading }) => {
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewItem((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    onAddMenuItem(newItem);
    // Reset form after submission
    setNewItem({
      name: "",
      price: "",
      description: "",
      image: null,
    });
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-6rem)] overflow-y-auto bg-white/90 backdrop-blur-lg border-2 border-green-100 shadow-xl">
      <h3 className="text-2xl font-bold text-center text-green-800">
        Add New Dish
      </h3>
      <div className="flex flex-col items-center space-y-6">
        <div className="relative group">
          <Avatar
            src={newItem.image || "/api/placeholder/200/200"}
            className="w-52 h-52 rounded-2xl 
            group-hover:scale-105 transition-transform 
            ring-4 ring-green-100 ring-offset-2"
          />
          <label
            className="absolute bottom-2 right-2 
            bg-gray-500 text-white rounded-full 
            p-3 cursor-pointer hover:bg-gray-600 
            transition-colors shadow-md">
            <LuImage className="text-xl" />
            <input
              type="file"
              className="hidden"
              onChange={handleImageUpload}
              accept="image/*"
            />
          </label>
        </div>

        <div className="space-y-4 w-full">
          <Input
            name="name"
            label="Dish Name"
            variant="bordered"
            color="default"
            value={newItem.name}
            onChange={(e) => {
              const { name, value } = e.target;
              setNewItem((prev) => ({
                ...prev,
                [name]: value,
              }));
            }}
            classNames={{
              inputWrapper: "border-gray-300 focus-within:border-gray-500",
            }}
          />
          <Input
            name="price"
            label="Price"
            type="number"
            variant="bordered"
            color="default"
            value={newItem.price}
            onChange={(e) => {
              const { name, value } = e.target;
              setNewItem((prev) => ({
                ...prev,
                [name]: value,
              }));
            }}
            classNames={{
              inputWrapper: "border-gray-300 focus-within:border-gray-500",
            }}
          />
          <Input
            name="description"
            label="Dish Description"
            variant="bordered"
            color="default"
            value={newItem.description}
            onChange={(e) => {
              const { name, value } = e.target;
              setNewItem((prev) => ({
                ...prev,
                [name]: value,
              }));
            }}
            classNames={{
              inputWrapper: "border-gray-300 focus-within:border-gray-500",
            }}
          />
        </div>

        <Button
          color="success"
          size="lg"
          onClick={handleSubmit}
          isLoading={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-green-700 
          text-white hover:from-green-600 hover:to-green-700 
          transition-all duration-300">
          {isLoading ? "Adding..." : "Add Dish to Menu"}
        </Button>
      </div>
    </div>
  );
};

export default DishForm;
