import { Card, CardBody, Image } from "@nextui-org/react";

const AllFunctions = () => {
  // Store data array
  const stores = [
    {
      name: "Ordering Dashboard",
      image:
        "https://www.menutiger.com/_next/static/media/feature_1.2f0c7c52.svg",
    },
    {
      name: "Sales Analytics",
      image:
        "https://www.menutiger.com/_next/static/media/feature_2.a045e461.svg",
    },
    {
      name: "Purchase Analytics",
      image:
        "https://www.menutiger.com/_next/static/media/feature_3.5100844f.svg",
    },
    {
      name: "POS Integration",
      image:
        "https://www.menutiger.com/_next/static/media/feature_4.8069e200.svg",
    },
    {
      name: "QR code Menu Creation",
      image:
        "https://www.menutiger.com/_next/static/media/feature_5.d564f966.svg",
    },
    {
      name: "Customer Order Management",
      image:
        "https://www.menutiger.com/_next/static/media/feature_6.886b65d7.svg",
    },
    {
      name: "Menu Analytics and Insights",
      image:
        "https://www.menutiger.com/_next/static/media/feature_7.2bc470e0.svg",
    },
    {
      name: "Customer Feedback",
      image:
        "https://www.menutiger.com/_next/static/media/feature_9.86192d71.svg",
    },
    {
      name: "Restaurant Branding",
      image:
        "https://www.menutiger.com/_next/static/media/feature_8.cf37b7b2.svg",
    },
    {
      name: "Multilingual Support",
      image:
        "https://www.menutiger.com/_next/static/media/feature_10.eff1dd24.svg",
    },
  ];

  return (
    <div className="px-4">
      <Card className="lg:max-w-7xl mx-auto p-6 ">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-4xl font-extrabold">
              Everything you need to get{" "}<br/>
              <span className="text-green-600">the kitchen in order🤠</span>
            </h3>
          </div>

          {/* Store Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {stores.map((store, index) => (
              <Card
                key={index}
                className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardBody className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-32 h-32 flex flex-col items-center justify-center">
                    <Image
                      className="w-full h-full object-contain"
                      src={store.image}
                      alt={store.name}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">
                        {store.name}
                      </p>

                      {store.comment && (
                        <span className="text-sm bg-yellow-400 px-2 py-0.5 rounded">
                          {store.comment}
                        </span>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Show More Button */}
          <button className="mx-auto px-6 py-2 text-green-600 hover:text-green-700 transition-colors font-medium">
            Show More
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AllFunctions;
