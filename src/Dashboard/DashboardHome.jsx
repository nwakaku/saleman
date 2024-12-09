/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Button, Input, Card, Avatar, Chip } from "@nextui-org/react";
import {
  LuTrash,
  LuImage,
  LuQrCode,
  LuPlus,
  LuMapPin,
  LuPhone,
  LuFileCode,
} from "react-icons/lu";
import BottomNav from "../components/BottomNav";
import ProfileForm from "./ProfileForm";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import supabaseUtil from "../utils/supabase";
import { useMyContext } from "../context/MyContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DishForm from "./components/DishForm";
import EditMenuItemModal from "./components/EditMenuItemModal";
import QRCodeModal from "./components/QRCodeModal";

export const DashboardHome = () => {
  const [market, setMarket] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isAddingMarket, setIsAddingMarket] = useState(true);
  const [isGridView, setIsGridView] = useState(false);

  const { user, session } = useMyContext();

  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
  });

  const navigate = useNavigate();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [menuUrl, setMenuUrl] = useState("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDishFormVisible, setIsDishFormVisible] = useState(false);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);

  useEffect(() => {
    const fetchMarketplace = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabaseUtil
          .from("marketplaces")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setMarket(data);
          setMenuItems(data.menu || []);
          setIsAddingMarket(false);
        }
      } catch (error) {
        console.error("Error fetching marketplace:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplace();
  }, [session]);

  // Add responsive check
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

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

  const handleMarketCreation = async (profileData) => {
    if (!profileData || !session?.user?.id) return;

    const newMarket = {
      user_id: session.user.id,
      name: profileData.name,
      tagline: profileData.tagline,
      cover_image: profileData.coverImage,
      contact: profileData.contact,
      address: profileData.address,
      bank_details: profileData.bankDetails,
      menu: [],
    };

    try {
      const { data, error } = await supabaseUtil
        .from("marketplaces")
        .insert([newMarket])
        .select()
        .single();

      if (error) throw error;

      setMarket(data);
      setIsAddingMarket(false);
      toast.success("Market created successfully");
    } catch (error) {
      console.error("Error creating marketplace:", error);
      toast.error("Failed to create marketplace");
    }
  };

  const addMenuItem = async (newItem) => {
    // Validate inputs
    if (!newItem.name || !newItem.price) {
      toast.error("Please fill in the item name and price");
      throw new Error("Invalid input");
    }

    try {
      const menuItem = {
        id: Date.now(),
        name: newItem.name,
        price: parseFloat(newItem.price),
        description: newItem.description,
        image: newItem.image,
      };

      const updatedMenu = [...menuItems, menuItem];

      const { error } = await supabaseUtil
        .from("marketplaces")
        .update({ menu: updatedMenu })
        .eq("id", market.id);

      if (error) throw error;

      setMenuItems(updatedMenu);
      toast.success("Menu item added successfully");
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("Failed to add menu item");
      throw error;
    }
  };

  const removeMenuItem = async (id) => {
    try {
      const updatedMenu = menuItems.filter((item) => item.id !== id);

      const { error } = await supabaseUtil
        .from("marketplaces")
        .update({ menu: updatedMenu })
        .eq("id", market.id);

      if (error) throw error;

      setMenuItems(updatedMenu);
      toast.success("Menu item removed successfully");
    } catch (error) {
      console.error("Error removing menu item:", error);
      toast.error("Failed to remove menu item");
    }
  };

  const generateMenuQR = async () => {
    setIsGeneratingQR(true);
    try {
      // Generate a unique menu URL
      const menuUrl = `${window.location.origin}/menu/${market.id}`;
      setMenuUrl(menuUrl);
      setIsQRModalOpen(true);
      toast.success("QR Code generated successfully");
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const editMenuItem = async (itemId, updatedItem) => {
    setIsLoading(true);
    try {
      const updatedMenu = menuItems.map((item) =>
        item.id === itemId ? { ...item, ...updatedItem } : item
      );

      const { error } = await supabaseUtil
        .from("marketplaces")
        .update({ menu: updatedMenu })
        .eq("id", market.id);

      if (error) throw error;

      setMenuItems(updatedMenu);
      setIsEditModalOpen(false);
      setEditingItem(null);
      toast.success("Menu item updated successfully");
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Failed to update menu item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ml-0 lg:ml-64">
      {isLoading ? (
        <div className="h-full flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
        </div>
      ) : (
        <div className="h-full container mx-auto px-4 py-6 overflow-y-auto">
          {isAddingMarket ? (
            <ProfileForm
              onSubmit={(profileData) => {
                handleMarketCreation(profileData);
              }}
            />
          ) : (
            <div
              className={`
              ${
                isMobile
                  ? "flex flex-col space-y-4"
                  : "grid grid-cols-1 md:grid-cols-3 gap-6"
              }
            `}>
              {/* Menu Items List */}
              <Card
                className={`
                ${
                  isMobile
                    ? "w-full"
                    : "md:col-span-2 h-[calc(100vh-6rem)] flex flex-col"
                } 
                bg-white/90 backdrop-blur-lg border-2 border-gray-100 shadow-xl
              `}>
                <ToastContainer />
                <div className="px-4 py-5 flex justify-between items-center border-b border-green-100">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      src={market?.cover_image || "/api/placeholder/80/80"}
                      className="w-16 h-16 rounded-xl ring-4 ring-green-100 ring-offset-2"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-black-800">
                        {market ? market.name : "Create Your Market"}
                      </h2>
                      {market?.tagline && (
                        <p className="text-gray-600 text-sm mt-1 hidden lg:block">
                          {market.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  <>
                    {/* Desktop Button - Hidden on small screens */}
                    <Button
                      color="success"
                      variant="flat"
                      startContent={<LuQrCode className="text-xl" />}
                      className="hidden md:flex bg-gray-500 text-white hover:bg-gray-900"
                      isLoading={isGeneratingQR}
                      onClick={generateMenuQR}>
                      {isGeneratingQR ? "Generating..." : "Generate QR"}
                    </Button>

                    {/* Mobile Button - Visible only on small screens */}
                    <Button
                      isIconOnly
                      color="success"
                      variant="flat"
                      className="md:hidden bg-gray-500 text-white hover:bg-gray-900"
                      isLoading={isGeneratingQR}
                      onClick={generateMenuQR}>
                      <LuQrCode className="text-xl" />
                    </Button>
                  </>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {menuItems.length === 0 ? (
                    <div className="text-center py-12 text-green-500">
                      <LuPlus className="mx-auto text-5xl mb-4" />
                      <p className="text-xl">Add your first menu item</p>
                    </div>
                  ) : (
                    <div
                      className={`p-4 ${
                        isMobile
                          ? "space-y-4"
                          : menuItems.length >= 5
                          ? "grid grid-cols-3 gap-4"
                          : "space-y-2"
                      }`}>
                      {menuItems.map((item) => (
                        <Card
                          key={item.id}
                          className={`
                            ${
                              isMobile
                                ? "p-4 flex flex-col items-center space-y-3 hover:shadow-lg transition-shadow border-t-4 border-gray-500 bg-white"
                                : menuItems.length >= 5
                                ? "p-4 flex flex-col items-center space-y-3 hover:shadow-lg transition-shadow border-t-4 border-gray-500 bg-white"
                                : "p-4 flex flex-row items-center space-x-4 hover:shadow-lg transition-shadow border-l-4 border-gray-500 bg-white"
                            }
                          `}>
                          <Avatar
                            src={item.image || "/api/placeholder/100/100"}
                            className={`
                              ${
                                menuItems.length >= 5
                                  ? "w-full h-40 rounded-xl ring-2 ring-green-100 ring-offset-2"
                                  : "w-20 h-20 rounded-xl ring-2 ring-green-100 ring-offset-2"
                              }
                            `}
                          />
                          <div
                            className={`
                            ${
                              menuItems.length >= 5
                                ? "w-full text-center"
                                : "flex-grow"
                            }
                          `}>
                            <div
                              className={`
                              ${
                                menuItems.length >= 5
                                  ? "flex flex-col  items-center space-y-2"
                                  : "flex flex-col items-start space-y-1"
                              }
                            `}>
                              <h4 className="text-xl font-bold text-green-800">
                                {item.name}
                              </h4>
                              {item.description && (
                                <p className="text-gray-600 text-sm mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div
                            className={`
                            ${
                              menuItems.length >= 5
                                ? "flex justify-center items-center space-x-2 w-full mt-2"
                                : "flex justify-center items-center space-x-2"
                            }
                          `}>
                            <Chip
                              color="success"
                              variant="solid"
                              className="bg-green-100 text-green-800">
                              ₦ {item.price.toFixed(2)}
                            </Chip>
                            <Button
                              isIconOnly
                              variant="light"
                              color="success"
                              className="hover:bg-green-50"
                              onClick={() => handleEditClick(item)}
                              isLoading={
                                isLoading && editingItem?.id === item.id
                              }>
                              <LuFileCode
                                size={20}
                                className="text-green-600"
                              />
                            </Button>
                            <Button
                              isIconOnly
                              variant="light"
                              color="danger"
                              className="hover:bg-red-50"
                              isLoading={
                                isLoading && editingItem?.id === item.id
                              }
                              onClick={() => removeMenuItem(item.id)}>
                              <LuTrash size={20} className="text-red-400" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Market Contact Info - adjusted position */}
                <div className="bg-green-50/80 backdrop-blur-sm p-1 border-t border-green-100 transition-all duration-300 hover:bg-green-50/90">
                  {" "}
                  <div className="text-center">
                    <div className="space-y-2">
                      {market?.address && (
                        <div className="flex items-center justify-center space-x-3 text-green-600">
                          <LuMapPin className="text-gray-500" />
                          <span className="text-sm">{market.address}</span>
                        </div>
                      )}
                      {market?.contact?.phone && (
                        <div className="flex items-center justify-center space-x-3 text-green-600">
                          <LuPhone className="text-gray-500" />
                          <span className="text-sm">
                            {market.contact.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Add Dish Form */}
              {isMobile ? (
                <div className="fixed bottom-20 right-4 z-50">
                  <Button
                    isIconOnly
                    color="success"
                    className="rounded-full p-4 shadow-xl"
                    onClick={() => setIsDishFormVisible(!isDishFormVisible)}>
                    <LuPlus className="text-2xl" />
                  </Button>
                </div>
              ) : (
                <DishForm
                  onAddMenuItem={addMenuItem}
                  isLoading={isAddingMenuItem}
                  setIsLoading={setIsAddingMenuItem}
                />
              )}
            </div>
          )}
          {/* Mobile Dish Form Modal */}
          {isMobile && isDishFormVisible && (
            <Modal
              isOpen={isDishFormVisible}
              onClose={() => setIsDishFormVisible(false)}
              size="full">
              <ModalContent>
                <ModalHeader>Add Menu Item</ModalHeader>
                <ModalBody>
                  <DishForm
                    onAddMenuItem={async (newItem) => {
                      try {
                        await addMenuItem(newItem);
                        setIsDishFormVisible(false);
                      } catch (error) {
                        // Error handling is done in addMenuItem method
                      }
                    }}
                    isLoading={isAddingMenuItem}
                    setIsLoading={setIsAddingMenuItem}
                  />
                </ModalBody>
              </ModalContent>
            </Modal>
          )}
        </div>
      )}
      <BottomNav />
      {market && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          menuUrl={menuUrl}
          menuItemsCount={menuItems.length}
          marketName={market.name}
        />
      )}

      <EditMenuItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={editingItem}
        onSave={editMenuItem}
        isLoading={isLoading}
        onImageUpload={(e) => {
          // Reuse the existing image upload logic
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onloadend = () => {
            setEditingItem((prev) => ({
              ...prev,
              image: reader.result,
            }));
          };
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
};

export default DashboardHome;
