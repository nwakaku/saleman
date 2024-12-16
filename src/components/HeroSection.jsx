import { Button, Image } from "@nextui-org/react";
import { LuBox, LuCreditCard, LuMessageCircle, LuQrCode } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {

    const navigate = useNavigate();

    const handleRoute = () => {
        navigate("/dashboard");
    }

  return (
    <div className=" bg-[#003D29] py-2">
      <div className="grid lg:grid-cols-2 px-8 ">
        <div className="text-white justify-center items-center flex">
          <div className="flex flex-col space-y-2 px-4 justify-center items-center lg:items-start">
            <div className="space-y-4">
              <h3 className="lg:text-4xl text-2xl font-bold text-center lg:text-left">
                Dining Reimagined: AI-Powered Smart Menu & CRM.
              </h3>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 text-sm md:text-base">
                <div className="flex items-center space-x-1">
                  <LuQrCode size={22} />
                  <span>Scan & Explore</span>
                </div>
                <div className="hidden md:block">-</div>
                <div className="flex items-center space-x-1">
                  <LuBox size={22} />
                  <span>Order Precisely</span>
                </div>
                <div className="hidden md:block">-</div>
                <div className="flex items-center space-x-1">
                  <LuCreditCard size={22} />
                  <span>Pay Seamlessly</span>
                </div>
                <div className="hidden md:block">-</div>
                <div className="flex items-center space-x-1">
                  <LuMessageCircle size={22} />
                  <span>Share Info</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRoute}
              size="lg"
              className="bg-green-600 text-white rounded-full ">
              Get Started
            </Button>
          </div>
        </div>
        <div className="p-2 hidden lg:block">
          <Image
            width="100%"
            height={200}
            src="https://www.instacart.com/assets/homepage/affordability-hero-3a7ab0e389e5f4f278b4715eec95775f1d7d969323d22277199898ce605c6f56.png"
            fallbackSrc="https://via.placeholder.com/300x200"
            alt="NextUI Image with fallback"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
