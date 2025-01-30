/* eslint-disable react/prop-types */
import { useState } from "react";
import { LuCheckCheck, LuClock } from "react-icons/lu";

const AutoWithdrawalSetting = ({
  initialInterval ,
  onIntervalChange,
}) => {

  const [selectedInterval, setSelectedInterval] = useState(initialInterval);
  const [isOpen, setIsOpen] = useState(false);


  const intervals = [
    { value: "off", label: "Off", description: "Manual withdrawals only" },
    { value: "1hr", label: "1 Hour", description: "Withdraw every hour" },
    { value: "2hrs", label: "2 Hours", description: "Withdraw every 2 hours" },
    { value: "1week", label: "1 Week", description: "Withdraw weekly" },
  ];

  const handleSelect = (value) => {
    setSelectedInterval(value);
    onIntervalChange(value);
    setIsOpen(false);
  };

  const getSelectedLabel = () => {
    return (
      intervals.find((int) => int.value === initialInterval)?.label || "Off"
    );
  };

  return (
    <div className="relative">
      <div className="mb-2">
        <h3 className="text-lg font-medium text-gray-900">Auto Withdrawal</h3>
        <p className="text-sm text-gray-500">
          Choose how often you want your earnings automatically withdrawn
        </p>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 rounded-lg bg-white border-2 border-gray-200 hover:border-green-500 transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-green-50">
              <LuClock className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Currently set to</p>
              <p className="text-sm text-gray-500">{getSelectedLabel()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`h-2 w-2 rounded-full ${
                selectedInterval !== "off" ? "bg-green-500" : "bg-gray-300"
              }`}></span>
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 rounded-lg bg-white shadow-lg border border-gray-200">
            {intervals.map((interval) => (
              <button
                key={interval.value}
                onClick={() => handleSelect(interval.value)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      selectedInterval === interval.value
                        ? "bg-green-50"
                        : "bg-gray-50"
                    }`}>
                    {selectedInterval === interval.value ? (
                      <LuCheckCheck className="h-5 w-5 text-green-600" />
                    ) : (
                      <LuClock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <p
                      className={`font-medium ${
                        selectedInterval === interval.value
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}>
                      {interval.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {interval.description}
                    </p>
                  </div>
                </div>
                {selectedInterval === interval.value && (
                  <span className="flex-shrink-0 ml-2">
                    <LuCheckCheck className="h-5 w-5 text-green-600" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoWithdrawalSetting;
