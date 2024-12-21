/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Image,
} from "@nextui-org/react";
import { useEffect } from "react";
import supabaseUtil from "../utils/supabase";
import { toast } from "react-hot-toast";
import { useMyContext } from "../context/MyContext";

const ThemeOption = ({ title, description, selected, image, onSelect }) => (
  <div
    onClick={onSelect}
    className={`cursor-pointer border-2 ${
      selected ? "border-green-500" : "border-gray-200"
    } rounded-lg p-4 transition-all hover:border-green-300`}>
    <div className="aspect-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
      <img src={image} alt={title} className="rounded-lg" />
    </div>
    <h3 className="font-medium text-gray-900">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);

const SettingSection = ({ children, title, description }) => (
  <div className="border-b border-gray-200 py-6">
    <div className="mb-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
    {children}
  </div>
);

const VanillaPreview = () => (
  <div className="bg-[#F8F3E9] p-6 rounded-lg">
    <Image
      src="https://res.cloudinary.com/dgbreoalg/image/upload/v1734755173/banana_vanilla_dljxdo.png"
      width={"full"}
      height={"full"}
    />
  </div>
);

const StrawberryPreview = () => (
  <div className="bg-[#FFF0F0] p-6 rounded-lg">
    <Image
      src="https://res.cloudinary.com/dgbreoalg/image/upload/v1734755200/strawberry_tj4x2b.png"
      width={"full"}
      height={"full"}
    />
  </div>
);

const LoadingPreview = () => (
  <div className="bg-[#F0F0F0] p-6 rounded-lg">
    <h2 className="text-2xl font-mono text-gray-800 mb-6 text-center">
      Loading...
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((item, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-300 h-40 rounded-lg mb-2"></div>
          <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-300 h-3 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
);

const MenuCustomization = () => {
  const [selectedLayout, setSelectedLayout] = useState("vanilla");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [marketplace, setMarketplace] = useState(null);
  const { session } = useMyContext();

  useEffect(() => {
    const fetchMarketplace = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabaseUtil
          .from("marketplaces")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;
        setMarketplace(data);

        if (data?.theme) {
          setSelectedLayout(data.theme);
        }
      } catch (error) {
        console.error("Error fetching marketplace:", error);
        toast.error("Failed to load marketplace settings");
      }
    };

    fetchMarketplace();
  }, [session?.user?.id]);

  const handleSaveChanges = async () => {
    if (!session?.user?.id) {
      toast.error("Please log in to save theme preferences");
      return;
    }

    if (!marketplace) {
      toast.error("No marketplace found for this user");
      return;
    }

    setIsProcessing(true);

    try {
      const themeData = {
        theme: selectedLayout,
        theme_updated_at: new Date().toISOString(),
        theme_settings: {
          layout: selectedLayout,
          updated_by: session.user.id,
        },
      };

      const { error: updateError } = await supabaseUtil
        .from("marketplaces")
        .update(themeData)
        .eq("id", marketplace.id);

      if (updateError) throw updateError;

      toast.success("Theme updated successfully!");
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error("Failed to save theme changes. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPreview = () => {
    switch (selectedLayout) {
      case "vanilla":
        return <VanillaPreview />;
      case "strawberry":
        return <StrawberryPreview />;
      case "loading":
        return <LoadingPreview />;
      default:
        return <VanillaPreview />;
    }
  };

  return (
    <div className="lg:ml-64 pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-b">
        <h1 className="text-xl font-bold sm:text-2xl">Menu Customization</h1>
      </div>

      <Card className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-2">
        <SettingSection
          title="Menu Theme"
          description="Choose your preferred menu theme">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ThemeOption
              title="Vanilla"
              description="Foreign Arabic vanilla in clean grid"
              selected={selectedLayout === "vanilla"}
              image="https://res.cloudinary.com/dgbreoalg/image/upload/v1734755173/banana_vanilla_dljxdo.png"
              onSelect={() => setSelectedLayout("vanilla")}
            />
            <ThemeOption
              title="Strawberry"
              description="Traditional chinese pink strawberry"
              selected={selectedLayout === "strawberry"}
              image="https://res.cloudinary.com/dgbreoalg/image/upload/v1734755200/strawberry_tj4x2b.png"
              onSelect={() => setSelectedLayout("strawberry")}
            />
            <ThemeOption
              title="Loading Loading"
              description="Dynamic magazine-style layout"
              selected={selectedLayout === "loading"}
              image="https://res.cloudinary.com/dgbreoalg/image/upload/v1725891148/Rectangle_10_dm8hq1.svg"
              onSelect={() => setSelectedLayout("loading")}
            />
          </div>
        </SettingSection>

        <div className="mt-8 space-y-4">
          <Button
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={() => setIsPreviewOpen(true)}>
            Preview
          </Button>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSaveChanges}
            disabled={isProcessing}>
            {isProcessing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      <Modal
        size="3xl"
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Theme Preview</ModalHeader>
              <ModalBody className="pb-6">{renderPreview()}</ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MenuCustomization;
