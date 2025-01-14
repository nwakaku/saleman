import { Card, CardBody, CardHeader } from "@nextui-org/react";

import { useState, useEffect } from "react";
import { LuPlay } from "react-icons/lu";

const Results = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const statistics = [
    {
      value: "Smart QR Code",
      description:
        "Interactive menus that are easy to scan, browse, and order from.",
    },
    {
      value: "AI CRM",
      description:
        "Retain your customers with personalized experiences, loyalty programs, and smart analytics.",
    },
    {
      value: "Payment Systems",
      description:
        "Accept payments securely with trusted platforms like Paystack, Visa, and Google Pay.",
    },
    {
      value: "Custom Solutions",
      description:
        "Tailored tools that optimize operations, reduce costs, and enhance customer satisfaction.",
    },
  ];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === 2 ? 0 : prevIndex + 1
        );
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="px-4 py-16">
      <div className="max-w-7xl mx-auto space-y-12">
        <h3 className="text-4xl font-bold  text-center text-emerald-600">
          Why Choose Us?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2 pt-6 flex items-center justify-center">
                <h4 className="text-2xl  text-center">{stat.value}</h4>
              </CardHeader>
              <CardBody className="py-4">
                <p className="text-gray-600 text-center font-normal">
                  {stat.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-4xl font-extrabold text-gray-700 leading-tight">
            AI-Powered Smart Menu and
            <br />
            CRM Dashboard in One
          </h3>
        </div>

        <div className="relative w-full mx-auto aspect-video rounded-xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/50 z-10 duration-300 opacity-100 " />

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 m-auto lg:w-32 lg:h-32 w-16 h-16 z-20 flex items-center justify-center bg-red-600 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 hover:scale-110 focus:outline-none">
            <LuPlay
              className="lg:w-16 lg:h-16 w-8 h-8 text-white"
              fill="white"
            />
          </button>

          <div className="relative w-full h-full">
            {[
              "https://res.cloudinary.com/dgbreoalg/image/upload/v1735227709/SalemanSmartOrdering_owb6nl.jpg",
              "https://res.cloudinary.com/dgbreoalg/image/upload/v1734755200/strawberry_tj4x2b.png",
              "https://res.cloudinary.com/dgbreoalg/image/upload/v1734755173/banana_vanilla_dljxdo.png",
            ].map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  currentImageIndex === index ? "opacity-100" : "opacity-0"
                }`}>
                <img
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
