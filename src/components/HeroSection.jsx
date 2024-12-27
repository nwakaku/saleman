import { Button, Card, Image } from "@nextui-org/react";
import { LuBox, LuCreditCard, LuMessageCircle, LuQrCode } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/MyContext";

const HeroSection = () => {

  const { session, onOpen } = useMyContext();

    const navigate = useNavigate();

    const handleRoute = () => {
       if (session) {
         navigate("/dashboard");
       } else {
         onOpen(); // Open the authentication modal
       }
    }

  return (
    <div className="w-full bg-[#F7F9FC] py-8 ">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ">
          {/* Left Column */}
          <div className="flex justify-center lg:justify-start">
            <div className="flex flex-col space-y-6 max-w-xl">
              <div className="space-y-4">
                <h1 className="text-2xl lg:text-4xl font-bold text-center lg:text-left text-[#003D29]">
                  Dining Reimagined: AI-Powered Smart Menu & CRM.
                </h1>

                <p className="hidden lg:block text-gray-600">
                  Saleman works with any type of restaurant, from cafes and food
                  trucks and fast casual. Digitize your experience for lower
                  operational costs, real-time monitoring, and all-year-round
                  flexibility.
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 text-sm md:text-base">
                  <div className="flex items-center space-x-2">
                    <LuQrCode size={22} />
                    <span>Menu</span>
                  </div>
                  <div className="hidden md:block text-gray-400">•</div>
                  <div className="flex items-center space-x-2">
                    <LuBox size={22} />
                    <span>Waiter</span>
                  </div>
                  <div className="hidden md:block text-gray-400">•</div>
                  <div className="flex items-center space-x-2">
                    <LuCreditCard size={22} />
                    <span>Cashier</span>
                  </div>
                  <div className="hidden md:block text-gray-400">•</div>
                  <div className="flex items-center space-x-2">
                    <LuMessageCircle size={22} />
                    <span>Manager Ad</span>
                  </div>
                </div>
              </div>

              <div className="flex  gap-4 justify-center lg:justify-start">
                <Button
                  onClick={handleRoute}
                  className="bg-green-600 text-white rounded-full">
                  Get Started
                </Button>
                <Button
                  
                  className="border border-slate-600 text-slate-900 rounded-full">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <Card className="p-2 hidden lg:flex justify-end shadow-lg bg-[#F7F9FC] items-end">
            {" "}
            <Image
              width="80%"
              src="https://cdn-bnklg.nitrocdn.com/WQiharaAoSUWjdmYdQaoZKLXawgJIPOR/assets/images/source/rev-849fa93/www.upmenu.com/wp-content/uploads/2023/03/qr-code-restaurant-ordering-process-2.jpg.webp"
              fallbackSrc="https://via.placeholder.com/300x200"
              alt="NextUI Image with fallback"
            />{" "}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
