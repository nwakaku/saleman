/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button, Input, Card, Avatar } from "@nextui-org/react";
import { LuImage, LuArrowRight, LuArrowLeft } from "react-icons/lu";

export const ProfileForm = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: "",
    tagline: "",
    coverImage: null,
    contact: {
      phone: "",
      email: "",
    },
    address: "",
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
    },
  });

  const handleInputChange = (section, e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [section ? section : name]: section
        ? { ...prev[section], [name]: value }
        : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData((prev) => ({
        ...prev,
        coverImage: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = [];

    if (!profileData.name) errors.push(" name is required");
    if (!profileData.contact?.phone) errors.push("Phone number is required");
    if (!profileData.contact?.email) errors.push("Email is required");

    if (step === 2) {
      if (!profileData.bankDetails?.bankName)
        errors.push("Bank name is required");
      if (!profileData.bankDetails?.accountNumber)
        errors.push("Account number is required");
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    if (onSubmit) {
      onSubmit(profileData);
    }
  };

  const nextStep = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-center text-green-800">
              Details
            </h3>
            <div className="relative group mx-auto w-52 h-52">
              <Avatar
                src={profileData.coverImage || "/api/placeholder/200/200"}
                className="w-52 h-52 rounded-2xl 
                group-hover:scale-105 transition-transform 
                ring-4 ring-green-100 ring-offset-2"
              />
              <label
                className="absolute bottom-2 right-2 
                bg-green-500 text-white rounded-full 
                p-3 cursor-pointer hover:bg-green-600 
                transition-colors shadow-md">
                <LuImage className="text-xl" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </label>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <Input
                name="name"
                label=" Name"
                variant="bordered"
                color="success"
                value={profileData.name}
                onChange={(e) => handleInputChange("", e)}
              />
              <Input
                name="tagline"
                label=" Tagline"
                variant="bordered"
                color="success"
                value={profileData.tagline}
                onChange={(e) => handleInputChange("", e)}
              />
              <Input
                name="phone"
                label=" Phone"
                variant="bordered"
                color="success"
                value={profileData.contact.phone}
                onChange={(e) => handleInputChange("contact", e)}
              />
              <Input
                name="email"
                label=" Email"
                variant="bordered"
                color="success"
                value={profileData.contact.email}
                onChange={(e) => handleInputChange("contact", e)}
              />
              <div className="flex justify-end">
                <Button
                  color="success"
                  endContent={<LuArrowRight />}
                  onClick={nextStep}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center text-green-800">
              Address & Bank Details
            </h3>
            <div className="space-y-4 max-w-md mx-auto">
              <Input
                name="address"
                label="Address"
                variant="bordered"
                color="success"
                value={profileData.address}
                onChange={(e) => handleInputChange("", e)}
              />
              <Input
                name="bankName"
                label="Bank Name"
                variant="bordered"
                color="success"
                value={profileData.bankDetails.bankName}
                onChange={(e) => handleInputChange("bankDetails", e)}
              />
              <Input
                name="accountName"
                label="Account Name"
                variant="bordered"
                color="success"
                value={profileData.bankDetails.accountName}
                onChange={(e) => handleInputChange("bankDetails", e)}
              />
              <Input
                name="accountNumber"
                label="Account Number"
                variant="bordered"
                color="success"
                value={profileData.bankDetails.accountNumber}
                onChange={(e) => handleInputChange("bankDetails", e)}
              />
              <div className="flex justify-between">
                <Button
                  color="default"
                  variant="light"
                  startContent={<LuArrowLeft />}
                  onClick={prevStep}>
                  Back
                </Button>
                <Button
                  color="success"
                  onClick={() => {
                    // Final submission logic
                    console.log(" Profile:", profileData);
                    handleSubmit(profileData);
                  }}>
                  Create Profile
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className="max-w-2xl mx-auto p-6 space-y-6 
      bg-white shadow-xl border-2 border-green-100 
      hover:shadow-2xl transition-all duration-300">
      {renderStep()}
    </Card>
  );
};

export default ProfileForm;
