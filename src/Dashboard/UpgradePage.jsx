/* eslint-disable react/prop-types */
import { Card, Button, Chip } from "@nextui-org/react";
import { LuCheck, LuX } from "react-icons/lu";
import BottomNav from "../components/BottomNav";
import Paystack from "@paystack/inline-js";
import { toast, Toaster } from "react-hot-toast";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import { useState } from "react";

const PlanFeature = ({ included, text }) => (
  <div className="flex items-center space-x-2 text-sm">
    {included ? (
      <LuCheck className="text-green-500 flex-shrink-0" />
    ) : (
      <LuX className="text-gray-400 flex-shrink-0" />
    )}
    <span className={included ? "text-gray-700" : "text-gray-400"}>{text}</span>
  </div>
);



const UpgradePage = () => {
    const { session } = useMyContext();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "Free",
      price: "₦0",
      period: "forever",
      features: [
        { text: "Up to 5 menu items", included: true },
        { text: "Basic QR code generation", included: true },
        { text: "Basic order management", included: true },
        { text: "Standard payment processing", included: true },
        { text: "Basic sales reports", included: true },
        { text: "Email support (business hours)", included: true },
        { text: "Basic customer feedback collection", included: true },
        { text: "Loyalty program features", included: false },
        { text: "Custom QR code branding", included: false },
        { text: "Marketing automation tools", included: false },
        { text: "Advanced analytics & AI insights", included: false },
        { text: "24/7 priority support", included: false },
      ],
      chipText: "Current Plan",
      buttonText: "Current Plan",
      isPopular: false,
      buttonColor: "default",
      priceInKobo: 0,
    },
    {
      name: "Monthly",
      price: "₦9,999",
      period: "per month",
      features: [
        { text: "Unlimited menu items", included: true },
        { text: "Custom QR code branding", included: true },
        { text: "Advanced order management", included: true },
        { text: "Premium payment processing", included: true },
        { text: "Detailed sales analytics", included: true },
        { text: "Priority email & chat support", included: true },
        { text: "Advanced feedback analytics", included: true },
        { text: "Basic loyalty program", included: true },
        { text: "Basic marketing automation", included: true },
        { text: "Menu theme customization", included: true },
        { text: "AI-driven menu optimization", included: false },
        { text: "24/7 dedicated support", included: false },
      ],
      chipText: "Most Popular",
      buttonText: "Upgrade to Pro",
      isPopular: true,
      buttonColor: "success",
      priceInKobo: 999900,
    },
    {
      name: " Yearly",
      price: "₦99,999",
      period: "per year",
      features: [
        { text: "Unlimited everything", included: true },
        { text: "Full brand customization", included: true },
        { text: "Enterprise-grade ordering system", included: true },
        { text: "Custom payment integration", included: true },
        { text: "AI-powered analytics & insights", included: true },
        { text: "24/7 dedicated support team", included: true },
        { text: "Advanced feedback & sentiment analysis", included: true },
        { text: "Advanced loyalty & rewards program", included: true },
        { text: "Full marketing automation suite", included: true },
        { text: "Custom menu & QR themes", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Priority feature requests", included: true },
      ],
      chipText: "Save 17%",
      buttonText: "Contact Sales",
      isPopular: false,
      buttonColor: "success",
      priceInKobo: 9999900,
    },
  ];
        
  const handleUpgrade = async (plan) => {
    if (plan.price === "₦0") {
      toast.success("You're already on the free plan!");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please log in to upgrade your plan");
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(plan);

    try {
      const { data: marketplace, error: fetchError } = await supabaseUtil
        .from("marketplaces")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (fetchError) throw fetchError;

      if (!marketplace) {
        toast.error("No marketplace found for this user");
        return;
      }

      const paymentConfig = {
        reference: `upgrade_${new Date().getTime()}`,
        email: session?.user?.email,
        amount: plan.priceInKobo,
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        metadata: {
          custom_fields: [
            {
              plan_name: plan.name,
              period: plan.period,
            },
          ],
        },
      };

      const paystack = new Paystack();
      paystack.newTransaction({
        key: paymentConfig.publicKey,
        email: paymentConfig.email,
        amount: paymentConfig.amount,
        onSuccess: async (response) => {
          console.log("Payment successful", response);

          const subscriptionData = {
            plan_name: plan.name,
            amount_paid: plan.price,
            period: plan.period,
            payment_reference: response.reference,
            status: "active",
            start_date: new Date().toISOString(),
            end_date:
              plan.period === "per month"
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(
                    Date.now() + 365 * 24 * 60 * 60 * 1000
                  ).toISOString(),
          };

          const { error: updateError } = await supabaseUtil
            .from("marketplaces")
            .update({ subscriptionData })
            .eq("id", marketplace.id);

          if (updateError) throw updateError;

          toast.success(`Successfully upgraded to ${plan.name}!`);
          setSelectedPlan(null);
        },
        onLoad: () => {
          toast.loading("Processing payment...");
        },
        onClose: () => {
          toast.error("Payment cancelled");
          setSelectedPlan(null);
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ml-0 lg:ml-64">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your business. All plans include our
            core features with additional benefits as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-6 bg-white/90 backdrop-blur-lg border-2 ${
                plan.isPopular
                  ? "border-green-500 shadow-green-100"
                  : "border-gray-100"
              } shadow-xl hover:shadow-2xl transition-shadow duration-300`}>
              {plan.chipText && (
                <Chip
                  color={plan.isPopular ? "success" : "default"}
                  variant="flat"
                  className="absolute top-4 right-4">
                  {plan.chipText}
                </Chip>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <PlanFeature
                    key={index}
                    included={feature.included}
                    text={feature.text}
                  />
                ))}
              </div>

              <Button
                color={plan.buttonColor}
                size="lg"
                className="w-full"
                variant={plan.isPopular ? "solid" : "bordered"}
                isLoading={isProcessing && selectedPlan?.name === plan.name}
                onClick={() => handleUpgrade(plan)}
                disabled={
                  isProcessing || (!session?.user?.email && plan.price !== "₦0")
                }>
                {isProcessing && selectedPlan?.name === plan.name
                  ? "Processing..."
                  : plan.buttonText}
              </Button>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default UpgradePage;
