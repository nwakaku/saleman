import { Card, CardBody, Image } from "@nextui-org/react";
import { AiFillThunderbolt } from "react-icons/ai";

const AllStores = () => {
  // Store data array
  const stores = [
    {
      name: "Pizza Hut",
      time: "30mins",
      image:
        "https://res.cloudinary.com/dgbreoalg/image/upload/v1733320983/Pizzahunt_d9r0bo.png",
      comment: "$10 off EBT, lots of deal",
    },
    {
      name: "Dominos Pizza",
      time: "15 Mins Wait Time",
      image:
        "https://res.cloudinary.com/dgbreoalg/image/upload/v1733321095/Dominos_Pizza_xqgee9.png",
      comment: "EBT, bulk pricing ",
    },
    {
      name: "McDonald",
      time: "15 Mins Wait Time",
      image:
        "https://pbs.twimg.com/profile_images/1863976445556449280/OsLJTN-J_400x400.jpg",
      comment: "$15 off in-store prices EBT",
    },
    {
      name: "Peak Foods",
      time: "20 Mins Wait Time",
      image:
        "https://res.cloudinary.com/dgbreoalg/image/upload/v1731406277/Peak_r9dwgu.webp",
    },
    {
      name: "Foods Co",
      time: "25 Mins Wait Time",
      image:
        "https://res.cloudinary.com/dgbreoalg/image/upload/v1733322294/foods_co_ovgnaw.webp",
    },
    {
      name: "KFC",
      time: "25 Mins Wait Time",
      image:
        "https://pbs.twimg.com/profile_images/985942831910064128/8BhIUuaA_400x400.jpg",
      comment: "$10 off EBT, lots of deal",
    },
    {
      name: "Rite Foods",
      time: "delivery By 1:15pm",
      image:
        "https://pbs.twimg.com/profile_images/1491382990110445572/rNJJndh7_400x400.jpg",
      comment: "$30 off ",
    },
    {
      name: "SubWay",
      time: "5 Mins Wait Time",
      image:
        "https://pbs.twimg.com/profile_images/1605327286810644482/--BZb7WJ_400x400.jpg",
    },
    {
      name: "Pepsi",
      time: "delivery By 2:00pm",
      image:
        "https://res.cloudinary.com/dgbreoalg/image/upload/v1731406070/Pepsi1_kvo4lz.jpg",
    },
  ];
    
     const chips = [
       { label: "All", active: true },
       { label: "EBT", active: false },
       { label: "Fastest", active: false },
       { label: "Offers", active: false },
       { label: "Low Prices", active: false },
       { label: "Closest", active: false },
       { label: "Beverages", active: false },
       { label: "Pickup", active: false },
       { label: "In store Prices", active: false },
       { label: "Convenience", active: false },
       { label: "Whole Sale", active: false },
       { label: "Retail", active: false },
     ];


  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl sm:text-2xl font-extrabold">
            All Restaurants in <span className="text-green-600">Abuja, Nigeria</span>
          </h3>
        </div>

        {/* Filter Chips */}
        <div className="w-full">
          <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
            {chips.map((chip, index) => (
              <button
                key={index}
                className={`px-4 sm:px-8 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors flex-shrink-0
                  ${
                    chip.active
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stores.map((store, index) => (
            <Card
              key={index}
              className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardBody className="flex flex-row gap-4 p-4">
                <div className="flex-shrink-0">
                  <Image
                    className="ring-1 ring-gray-200 rounded-lg w-20 h-20 sm:w-24 sm:h-24 object-cover"
                    src={store.image}
                    alt={store.name}
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {store.name}
                  </p>
                  <span className="text-sm sm:text-base text-green-600 flex items-center gap-1">
                    <AiFillThunderbolt className="flex-shrink-0" />
                    <span className="truncate">{store.time}</span>
                  </span>
                  {store.comment && (
                    <span className="text-sm sm:text-base bg-yellow-400 px-2 py-0.5 rounded mt-1 truncate">
                      {store.comment}
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Show More Button */}
        <button className="text-center text-base text-green-600 hover:text-green-700 transition-colors">
          Show More
        </button>
      </div>
    </div>
  );
};

export default AllStores;
