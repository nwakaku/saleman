// import { Card, CardHeader, CardBody } from "@/components/ui/card";

import { Card, CardHeader, Image } from "@nextui-org/react";

export const MarketPlace = () => {
  const statistics = [
    {
      value: "1 Billion Dishes",
      description:
        "Available products across all our partnered restaurants in Africa",
      image: "https://cdn.worldvectorlogo.com/logos/paystack-2.svg",
    },
    {
      value: "80,000 Restaurants",
      description:
        "Partner restaurants across multiple cities delivering quality dishes",
      image: "https://cdn.worldvectorlogo.com/logos/mastercard-4.svg",
    },
    {
      value: "100,000 Cities",
      description:
        "Cities covered across Africa with fast and reliable service",
      image: "https://cdn.worldvectorlogo.com/logos/visa-10.svg",
    },
    {
      value: "Millions of orders",
      description: "Successfully processed orders with satisfied customers",
      image: "https://cdn.worldvectorlogo.com/logos/google-pay-2.svg",
    },
  ];

  return (
    <div className="px-8 py-16 max-w-7xl mx-auto">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="text-center">
          <h3 className="text-4xl font-extrabold text-gray-700 leading-tight">
            Elevate Your Dining Experience
            <br />
            Effortlessly in Africa
          </h3>
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat, index) => (
            <Card key={index} className="p-2 shadow-sm">
              <CardHeader className="p-6">
                <div className="h-16 flex items-center justify-center">
                  <Image
                    src={stat.image}
                    alt={`${stat.value} icon`}
                    className="w-full object-cover"
                    width="80%"
                  />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Image Section */}
        <div className="relative w-full aspect-[16/6] bg-gray-100 rounded-xl overflow-hidden">
          <img
            src="https://www.instacart.com/assets/homepage/homepage_stats-538f51946acc9e8a72b982654287ee0ad8d7a848df2cd860935bbc3c2a97e84a.jpg"
            alt="Marketplace coverage"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default MarketPlace;
