/* eslint-disable react/prop-types */
import { useState } from "react";
import { Card, CardBody, Avatar, Chip, Button, Input } from "@nextui-org/react";
import { LuShoppingCart, LuSearch, LuFilter, LuStar } from "react-icons/lu";
import { toast } from "react-hot-toast";

const customToastStyle = {
  background: "#fefcbf", // Light yellow background
  color: "#4a4a4a", // Dark text color
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
};

export const SupermarketMenu = ({ menuData, addToCart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Extract unique categories from menu items
  const categories = [...new Set(menuData.menu.map((item) => item.category))];

  // Filter logic
  const filteredItems = menuData.menu.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory ? item.category === selectedCategory : true)
  );

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart`, {
      style: customToastStyle,
      duration: 1000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Supermarket Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Avatar
              src={menuData.cover_image}
              className="w-24 h-24 rounded-full border-4 border-green-300 shadow-lg"
            />
            <div>
              <h1 className="text-3xl text-green-900 font-bold tracking-wide">
                {menuData.name}
              </h1>
              <div className="flex items-center mt-2 space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <LuStar
                      key={index}
                      className={`${
                        index < 4
                          ? "text-green-500 fill-green-500"
                          : "text-gray-300"
                      }`}
                      size={20}
                    />
                  ))}
                </div>
                <span className="text-green-700 ml-2">
                  {menuData.tagline || "Fresh Groceries Delivered"}
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex space-x-2 w-full sm:w-auto">
            <Input
              isClearable
              radius="lg"
              classNames={{
                label: "text-green-700",
                input: [
                  "bg-white",
                  "text-green-900",
                  "placeholder:text-green-700/50",
                ],
                innerWrapper: "bg-white",
                inputWrapper: [
                  "bg-white",
                  "border",
                  "border-green-200",
                  "hover:border-green-300",
                  "focus-within:border-green-500",
                ],
              }}
              placeholder="Search products..."
              startContent={
                <LuSearch className="text-green-500 text-xl pointer-events-none flex-shrink-0" />
              }
              value={searchTerm}
              onClear={() => setSearchTerm("")}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              isIconOnly
              color="success"
              variant="bordered"
              className="bg-white">
              <LuFilter className="text-green-700" />
            </Button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
          {categories.map((category) => (
            <Chip
              key={category}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category ? null : category
                )
              }
              className={`
                cursor-pointer 
                transition-all 
                duration-300 
                ${
                  selectedCategory === category
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                }
              `}>
              {category}
            </Chip>
          ))}
        </div>

        {/* Grouped Menu Items */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border-l-4 border-green-500 bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="relative">
                    <Avatar
                      src={item.image}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    {item.discount && (
                      <Chip
                        size="sm"
                        className="absolute top-2 left-2 bg-red-100 text-red-800">
                        {item.discount}% OFF
                      </Chip>
                    )}
                  </div>
                  <CardBody className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-green-900 text-lg">
                          {item.name}
                        </h3>
                        <p className="text-green-600 text-sm">
                          {item.weight || item.unit}
                        </p>
                      </div>
                      <Chip
                        className="bg-green-100 text-green-900 font-bold"
                        size="sm">
                        ₦ {item.price.toFixed(2)}
                      </Chip>
                    </div>
                    <Button
                      color="success"
                      variant="solid"
                      className="w-full mt-2"
                      startContent={<LuShoppingCart size={20} />}
                      onClick={() => handleAddToCart(item)}>
                      Add to Cart
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-green-600 text-xl">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupermarketMenu;
