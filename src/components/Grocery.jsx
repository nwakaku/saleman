import { Card, CardBody, CardFooter } from "@nextui-org/react";

export const Grocery = () => {
  const deliveryCards = [
    {
      title: "Choose what you want",
      description:
        "Using their smartphone’s camera, they simply scan the code. This instantly opens a responsive digital menu that displays all available dishes.",
      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FwhyLove_1.dc110fdf.webp&w=3840&q=75",
    },
    {
      title: "FeedBack System",
      description:
        "The feedback system collects customer insights through quick post-meal surveys, offering star ratings, comments, and suggestions",
      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FwhyLove_2.3100ef2c.webp&w=3840&q=75",
    },
    {
      title: "Customers are delighted",
      description:
        "Contactless experience that allows them to browse menus, orders, payments, and provide feedback—all from their smartphones.",
      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FwhyLove_3.dbcb6972.webp&w=3840&q=75",
    },
    {
      title: "Create Cost Effective Solution",
      description:
        "Our QR code menu is a cost-effective solution that reduces the need for Menu, Cashier, manager and minimizes staff workload.",
      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FwhyLove_4.0a38e366.webp&w=3840&q=75",
    },
    {
      title: "Increase Order Accuracy",
      description:
        "Bid farewell to incorrect dishes as a menu QR code guarantees precision, enhancing overall customer satisfaction.",
      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FwhyLove_5.7bde8c69.webp&w=3840&q=75",
    },
    {
      title: "Enhance customer experience",
      description:
        "Elevate the dining experience with our customer-friendly interactive restaurant menu features, turning satisfied customers into loyal patrons.",
      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FwhyLove_6.257286ac.webp&w=3840&q=75",
    },
  ];

  return (
    <div className=" space-y-24 max-w-7xl px-4 lg:px-4 py-12 mx-auto">
      {/* QR Code Section */}
      <div className="bg-[#B1E5D5] rounded-lg ">
        <div className="flex justify-between items-center max-w-full mx-auto ">
          <div className="w-2/6 px-8 hidden lg:block">
            <img
              src="https://res.cloudinary.com/dgbreoalg/image/upload/v1730549269/using-phone_qpvbyw.png"
              alt="Phone illustration"
              className="w-24 h-24 object-contain"
            />
          </div>

          <div className="lg:w-3/6 lg:px-8 px-2">
            <h2 className="font-extrabold lg:text-2xl mb-2">
              Get the full saleman experience
            </h2>
            <p className="text-xs lg:text-sm text-gray-700 lg:block ">
              Scan the QR code with your camera. First delivery is free
            </p>
          </div>

          <div className="w-1/6 flex justify-end">
            <div className="w-24 h-24 bg-white lg:p-2 shadow-lg border border-gray-200 rounded-lg">
              <img
                src="https://res.cloudinary.com/dgbreoalg/image/upload/v1730546918/qr-code_yskqvn.png"
                alt="QR code"
                className="w-full h-full lg:object-contain object-fill"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Cards Section */}
      <div className="space-y-8">
        <h3 className="text-3xl font-extrabold text-center mb-8">
          Smart Menu and CRM you can count on
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
          {deliveryCards.map((card, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardBody className="p-0 aspect-[4/3] w-full">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </CardBody>
              <CardFooter className="flex flex-col space-y-2 p-6 ">
                <h4 className="font-bold text-lg text-left">{card.title}</h4>
                <p className="text-gray-600 text-sm text-left">
                  {card.description}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grocery;
