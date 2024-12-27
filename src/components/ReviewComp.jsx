/* eslint-disable react/prop-types */
import { Card } from "@nextui-org/react";
import { LuStar } from "react-icons/lu";

const ReviewComp = () => {
  const reviews = [
    {
      id: 1,
      author: "Sarah Johnson",
      role: "Restaurant Owner",
      rating: 5,
      date: "December 15, 2024",
      content:
        "Implementing Saleman's smart menu system has transformed our operations. The AI-powered recommendations have increased our average order value by 25%, and customers love the seamless digital experience. The CRM features help us understand our customers better than ever.",
      avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    },
    {
      id: 2,
      author: "Michael Jimoh",
      role: "Cafe Manager",
      rating: 5,
      date: "December 20, 2024",
      content:
        "The QR code menu system is brilliant! We've significantly reduced wait times and order errors. The real-time analytics help us optimize our menu and staffing. Customer feedback has been overwhelmingly positive, especially regarding the contactless ordering experience.",
      avatar: "https://randomuser.me/api/portraits/men/63.jpg",
    },
    {
      id: 3,
      author: "Joyce Alabi",
      role: "Food Truck Owner",
      rating: 5,
      date: "December 22, 2024",
      content:
        "Perfect for our mobile business! The system is incredibly flexible and easy to update on the go. We can quickly adjust menu items and prices, and the customer data insights have helped us plan our locations better. The support team is also fantastic.",
      avatar: "https://randomuser.me/api/portraits/women/62.jpg",
    },
  ];

  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <LuStar
            key={index}
            size={16}
            className={
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-200"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#F7F9FC] py-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-4xl font-bold text-[#003D29] mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied restaurant owners who have transformed
            their business with our smart menu and CRM system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card   
              key={review.id}
              className="p-6 bg-white hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {review.author}
                      </h4>
                      <p className="text-sm text-gray-500">{review.role}</p>
                    </div>
                    <div className="flex items-center">
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {review.content}
                </p>
                <p className="mt-2 text-xs text-gray-400">{review.date}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewComp;
