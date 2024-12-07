
const CommonQuestion = () => {
  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-12 py-12 mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-extrabold text-gray-700 leading-tight">
          Video Walkthrough
        </h3>
      </div>

      {/* Responsive video container */}
      <div className="relative w-full pt-[56.25%]">
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
          src="https://www.youtube.com/embed/Gt9dnFp1M0E"
          title="Day in the Life of an AI Startup Founder | YCombinator"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default CommonQuestion;
