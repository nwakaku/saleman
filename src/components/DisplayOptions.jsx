import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";

export const DisplayOptions = () => {
  const deliveryCards = [
    {
      title: "Menu",
      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffree_templates_1.70afb66a.webp&w=1080&q=75",
    },
    {
      title: "Coaster",

      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffree_templates_2.02e2ef37.webp&w=1080&q=75",
    },
    {
      title: "Poster",

      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffree_templates_3.62ca0bf0.webp&w=1080&q=75",
    },
    {
      title: "Table Tent",

      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffree_templates_4.026310d2.webp&w=1080&q=75",
    },
    {
      title: "Sticker",

      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffree_templates_5.c2cafd02.webp&w=1080&q=75",
    },
    {
      title: "A-Frame",
      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffree_templates_6.c0c55484.webp&w=1080&q=75",
    },
    {
      title: "Business Card",

      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffree_templates_7.f621d9ce.webp&w=1080&q=75",
    },
    {
      title: "Gift Cards",
      image:
        "https://www.menutiger.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffree_templates_8.686adca9.webp&w=1080&q=75",
    },
  ];

  return (
    <div className=" space-y-24 max-w-7xl px-4 lg:px-0 py-12 mx-auto">
      {/* Delivery Cards Section */}
      <Card className="space-y-8 p-8">
        <h3 className="text-3xl font-extrabold text-center mb-8">
          Free Customizable Templates
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mx-auto">
          {deliveryCards.map((card, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardBody className="">
                <Image
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </CardBody>
              <CardFooter className="flex flex-col space-y-2 p-4 ">
                <h4 className="font-bold text-lg text-left">{card.title}</h4>
                
              </CardFooter>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DisplayOptions;
