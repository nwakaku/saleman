// import { Card, CardHeader, CardBody } from "@/components/ui/card";

import { Card, CardBody, CardHeader } from "@nextui-org/react";

export const MarketPlace = () => {
  const statistics = [
    {
      value: "1 billion products",
      description:
        "Available products across all our partnered stores in Africa",
    },
    {
      value: "80,000      stores",
      description:
        "Partner stores across multiple cities delivering quality products",
    },
    {
      value: "14,000 cities",
      description:
        "Cities covered across Africa with fast and reliable delivery",
    },
    {
      value: "Millions of orders",
      description: "Successfully processed orders with satisfied customers",
    },
  ];

  return (
    <div className="px-8 py-16 max-w-7xl mx-auto">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="text-center">
          <h3 className="text-4xl font-extrabold text-gray-700 leading-tight">
            The largest online grocery
            <br />
            marketplace in Africa
          </h3>
        </div>

        {/* Image Section */}
        <div className="relative w-full aspect-[16/6] bg-gray-100 rounded-xl overflow-hidden">
          <img
            src="https://www.instacart.com/assets/homepage/homepage_stats-538f51946acc9e8a72b982654287ee0ad8d7a848df2cd860935bbc3c2a97e84a.jpg"
            alt="Marketplace coverage"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat, index) => (
            <Card
              key={index}
              className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2 pt-6 px-6">
                <h4 className="text-3xl font-extrabold text-gray-700 leading-tight ">
                  {stat.value}
                </h4>
              </CardHeader>
              <CardBody className="py-4 px-6">
                <p className="text-gray-600">{stat.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketPlace;
