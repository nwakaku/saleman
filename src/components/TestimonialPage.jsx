/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  CircularProgress,
  useDisclosure,
} from "@nextui-org/react";
import supabaseUtil from "../utils/supabase";
import {
  LuMessageSquare,
  LuBox,
  LuStar,
  LuArrowLeft,
  LuQuote,
  LuFacebook,
  LuInstagram,
  LuTwitter,
  LuMoveLeft,
} from "react-icons/lu";
import toast, { Toaster } from "react-hot-toast";

const customToastStyle = {
  background: "#fefcbf", // Light yellow background
  color: "#4a4a4a", // Dark text color
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
};

export const TestimonialPage = () => {
  const { menuId } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      if (!menuId) {
        console.log("Menu ID is missing");
        return;
      }
      try {
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } =
          await supabaseUtil
            .from("marketplaces")
            .select("*")
            .eq("id", menuId)
            .single();

        if (restaurantError) throw restaurantError;
        console.log(restaurantData);
        setRestaurantData(restaurantData);

        // Fetch testimonials
        const { data, error } = await supabaseUtil
          .from("testimonials")
          .select("*")
          .eq("market_id", menuId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTestimonials(data);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        toast.error("Failed to load testimonials");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [menuId]);

  const handleSubmitTestimonial = async () => {
    if (!newTestimonial.trim()) {
      toast.error("Please enter a testimonial");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Please provide a phone number");
      return;
    }

    try {
      const { data, error } = await supabaseUtil.from("testimonials").insert([
        {
          market_id: menuId,
          content: newTestimonial,
          phone_number: phoneNumber,
          rating: rating,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Optimistically update the UI
      setTestimonials([
        {
          id: Date.now(), // Temporary ID
          market_id: menuId,
          content: newTestimonial,
          phone_number: phoneNumber,
          rating: rating,
          created_at: new Date().toISOString(),
        },
        ...testimonials,
      ]);

      toast.success("Testimonial submitted successfully!", {
        style: customToastStyle,
        duration: 3000, // Duration in milliseconds
      });
      setNewTestimonial("");
      setPhoneNumber("");
      onClose();
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast.error("Failed to submit testimonial");
    }
  };

  const StarRating = ({
    rating,
    onRatingChange,
    editable = false,
    size = 24,
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <LuStar
              key={index}
              size={size}
              className={`
                ${
                  ratingValue <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }
                ${editable ? "cursor-pointer" : ""}
              `}
              onClick={editable ? () => onRatingChange(ratingValue) : null}
            />
          );
        })}
        {editable && <span className="text-yellow-700 ml-2">{rating} / 5</span>}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CircularProgress color="warning" size="lg" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-4">
      <div className="max-w-6xl mx-auto relative">
        {/* Add Testimonial Modal */}

        <div
          onClick={onOpen}
          className="fixed top-4 right-4 z-50 bg-yellow-100 rounded-xl p-4 shadow-md w-64">
          <div className="flex justify-between">
            <Button
              color="warning"
              variant="solid"
              startContent={<LuMessageSquare />}
              onTouchStart={onOpen}
              onClick={onOpen}>
              Add Your Testimonial
            </Button>
          </div>
        </div>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          backdrop="blur"
          className="text-yellow-900">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Share Your Experience</h2>
              <p className="text-sm text-yellow-700">
                {restaurantData?.name} - Customer Testimonial
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="flex justify-center mb-4">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  editable={true}
                  size={32}
                />
              </div>
              <Textarea
                value={newTestimonial}
                onChange={(e) => setNewTestimonial(e.target.value)}
                placeholder="Write your testimonial here..."
                minRows={5}
                className="mb-4"
              />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Your Phone Number"
                className="w-full p-2 border border-yellow-300 rounded mb-4"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="warning"
                variant="solid"
                className="w-full"
                onClick={handleSubmitTestimonial}>
                <LuMessageSquare className="mr-2" />
                Submit Testimonial
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-2 border-yellow-200 rounded-3xl overflow-hidden">
          <CardBody className="p-4 sm:p-8">
            {/* Restaurant Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar
                  src={restaurantData?.cover_image}
                  className="w-24 h-24 rounded-full border-4 border-yellow-300 shadow-lg"
                />
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl text-yellow-900 font-bold tracking-wide">
                    {restaurantData?.name} Testimonials
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start mt-2 space-x-1">
                    <LuStar
                      className="text-yellow-500 fill-yellow-500"
                      size={20}
                    />
                    <p className="text-yellow-700 text-sm">
                      {restaurantData?.tagline || "Exquisite Dining Experience"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials Grid */}
            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {testimonials.map((testimonial) => (
                  <Card
                    key={testimonial.id}
                    className="border-l-4 border-yellow-500 bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
                    <CardBody className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <LuQuote className="text-yellow-300" size={40} />
                        <StarRating rating={testimonial.rating} size={20} />
                      </div>
                      <p className="text-yellow-800 mb-4 italic">
                        {` "${testimonial.content}"`}
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-800 font-bold">
                            {testimonial.phone_number?.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-yellow-900 text-sm ">
                            {testimonial.phone_number.slice(0, 5) +
                              "****" +
                              testimonial.phone_number.slice(9)}
                          </p>
                          <p className="text-yellow-700 text-sm">
                            {new Date(
                              testimonial.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-yellow-600 text-xl mb-4">
                  No testimonials yet. Be the first to share your experience!
                </p>
                <Button
                  color="warning"
                  variant="solid"
                  startContent={<LuMessageSquare />}
                  onClick={onOpen}>
                  Add Your Testimonial
                </Button>
              </div>
            )}

            {/* Back to Menu & Powered By */}
            {/* Powered By saleman */}
            <div className="mt-8 flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-yellow-700">
                <LuBox className="text-yellow-600" size={24} />
                <span className="text-sm font-medium">
                  Powered by
                  <span
                    className="font-bold ml-1 text-black cursor-pointer"
                    onClick={() => navigate("/")}>
                    <span className="text-green-700">Sale</span>
                    man.xyz
                  </span>
                </span>
              </div>

              {/* New Testimonial Button */}
              <div className="flex flex-col lg:flex-row-reverse lg:space-y-0 space-y-4 justify-around items-center w-full">
                <div className=" flex justify-center space-x-4">
                  <a
                    href="https://facebook.com/saleman"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-700 hover:text-yellow-900 transition-colors duration-300 bg-white/90 lg:border-2 border-yellow-400 rounded-full lg:p-2">
                    <LuFacebook size={20} />
                  </a>
                  <a
                    href="https://instagram.com/saleman.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-700 hover:text-yellow-900 transition-colors duration-300 bg-white/90 lg:border-2 border-yellow-400 rounded-full lg:p-2">
                    <LuInstagram size={20} />
                  </a>
                  <a
                    href="https://twitter.com/saleman"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-700 hover:text-yellow-900 transition-colors duration-300 bg-white/90 lg:border-2 border-yellow-400 rounded-full lg:p-2">
                    <LuTwitter size={20} />
                  </a>
                </div>
                <Button
                  color="warning"
                  variant="bordered"
                  className="group hover:bg-yellow-100 transition-all duration-300"
                  startContent={
                    <LuMoveLeft
                      className="group-hover:text-yellow-900 text-yellow-700"
                      size={20}
                    />
                  }
                  onTouchStart={() => {
                    navigate(`/menu/${menuId}`);
                  }}
                  onClick={() => navigate(`/menu/${menuId}`)}>
                  <span className="text-yellow-800 group-hover:text-yellow-900 font-semibold">
                    Customer Testimonials
                  </span>
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
        <Toaster />
      </div>
    </div>
  );
};

export default TestimonialPage;
