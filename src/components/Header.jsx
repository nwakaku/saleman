/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Input,
  Image,
  Modal,
  Popover,
  Spacer,
  ModalHeader,
  ModalBody,
  Card,
  useDisclosure,
  ModalContent,
  PopoverTrigger,
  PopoverContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { FaBell } from "react-icons/fa";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { LuMapPin, LuMenu, LuSparkles } from "react-icons/lu";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import { FiSearch } from "react-icons/fi";
import BalancePopover from "./BalancePopover";
import { requestWithdrawal } from "../utils/withdrawal";

const nigerianPlacesBaseUrl =
  "https://nigerianplacesapi-production-b9f9.up.railway.app";

const sendHttpRequest = async (config, callback) => {
  try {
    const response = await fetch(`${config.baseUrl}/${config.url}`);
    const data = await response.json();
    callback({ data, message: response.ok ? "SUCCESS" : "ERROR" });
  } catch (error) {
    console.error("Error fetching data:", error);
    callback({ data: [], message: "ERROR" });
  }
};

const Header = () => {
  const navigate = useNavigate();
  const { session, setSession, isOpen, onOpen, onOpenChange } = useMyContext();
  const [notificationCount, setNotificationCount] = useState(0);
  const { setUser, isAIMode, setIsAIMode } = useMyContext();
  const [selectedKeys, setSelectedKeys] = useState(new Set(["Abuja"]));
  const [nigerianStates, setNigerianStates] = useState([]);
  const [selectedValue, setSelectedValue] = useState("Abuja");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [buttonColor, setButtonColor] = useState("bg-green-700"); // Default button color
  const [marketplaceId, setMarketplaceId] = useState(null); // State to hold marketplaceId

  const [searchParams] = useSearchParams();
  const [autoWithdrawalInterval, setAutoWithdrawalInterval] = useState();
  const location = useLocation();

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setSearchQuery(prompt);
      setIsAIMode(true);
    }
  }, [searchParams, setIsAIMode]);

  useEffect(() => {
    const handleAuthStateChange = async () => {
      const { data } = supabaseUtil.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN") {
            setSession(session);
            navigate("/dashboard");
            setNotificationCount(2);
          }
        }
      );

      return () => {
        data.subscription.unsubscribe();
      };
    };

    handleAuthStateChange();
  }, [navigate, setSession]);

  useEffect(() => {
    const handleSetUser = () => {
      session && setUser(session.user.identities[0].identity_data);
    };

    handleSetUser();
  }, [session, setUser]);

  useEffect(() => {
    const fetchStates = () => {
      sendHttpRequest(
        {
          url: "states",
          baseUrl: nigerianPlacesBaseUrl,
        },
        (response) => {
          const { data, message } = response;

          if (message === "SUCCESS") {
            const formattedStates = data.map((state) => ({
              id: state.id,
              name: state.name,
            }));

            setNigerianStates(formattedStates);
          }
        }
      );
    };

    fetchStates();
  }, []);

  useEffect(() => {
    const fetchMarketplaceId = async () => {
      if (session?.user?.id) {
        const { data: marketplaceData, error } = await supabaseUtil
          .from("marketplaces")
          .select("id, auto_withdrawal_interval")
          .eq("user_id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching marketplace ID:", error);
        } else {
          setMarketplaceId(marketplaceData.id);
          console.log(marketplaceData);
                setAutoWithdrawalInterval(
                  marketplaceData
                    ? marketplaceData?.auto_withdrawal_interval
                    : "off"
                );

        }
      }
    };

    fetchMarketplaceId();
  }, [session]);

  const fetchTotalAmount = async () => {
    if (!session?.user?.id) return;

    try {
      // Fetch total amount of orders
      const { data: ordersData, error: ordersError } = await supabaseUtil
        .from("orders")
        .select("total_amount")
        .eq("restaurant_id", marketplaceId);

      if (ordersError) throw ordersError;

      const totalOrders = ordersData.reduce(
        (acc, order) => acc + order.total_amount,
        0
      );

      // Fetch total amount of successful withdrawals
      const { data: withdrawalsData, error: withdrawalsError } =
        await supabaseUtil
          .from("withdrawals")
          .select("amount, status") // Ensure status is fetched
          .eq("marketplace_id", marketplaceId)
          .not("status", "eq", "failed"); // Exclude failed withdrawals

      if (withdrawalsError) throw withdrawalsError;

      const totalWithdrawals = withdrawalsData.reduce(
        (acc, withdrawal) => acc + withdrawal.amount,
        0
      );

      // Calculate the total amount
      const unifiedTotal = totalOrders - totalWithdrawals;

      console.log(totalWithdrawals);
      console.log(unifiedTotal);
      console.log(totalOrders);
      setTotalAmount(unifiedTotal);

      // Check for pending withdrawals
      const hasPendingWithdrawals = withdrawalsData.some(
        (withdrawal) => withdrawal.status.trim() === "pending"
      ); // Trim to avoid issues
      console.log("Withdrawals Data:", withdrawalsData); // Log withdrawals data
      console.log("Has Pending Withdrawals:", hasPendingWithdrawals); // Log the result
      setButtonColor(hasPendingWithdrawals ? "bg-yellow-500" : "bg-green-700"); // Change color if pending
    } catch (error) {
      console.error("Error fetching total amount:", error);
    }
  };

  useEffect(() => {
    fetchTotalAmount();
  }, [marketplaceId, session]);

  const handleSelectionChange = (keys) => {
    setSelectedKeys(keys);
    const selectedState = nigerianStates.find(
      (state) => state.id === Array.from(keys)[0]
    );
    setSelectedValue(selectedState?.name || "");
  };

  const handleRoute = () => {
    navigate("/");
  };

  const handleCartClick = () => {
    if (session) {
      navigate("/dashboard");
    } else {
      onOpen(); // Open the authentication modal
    }
  };

  const handleWithdrawal = async (withdrawalDetails) => {
    const { amount, password } = withdrawalDetails;
    const withdrawal = await requestWithdrawal(marketplaceId, amount);
    console.log("Withdrawal successful:", withdrawal);
    fetchTotalAmount(); // Refresh total amount after withdrawal
  };

  // Check if the current path is the menu or testimonial page
  if (
    location.pathname.startsWith("/menu") ||
    location.pathname.startsWith("/testimonial")
  ) {
    return null; // Don't render the header on the menu or testimonial page
  }

  return (
    <>
      <Navbar maxWidth="2xl" className="bg-[#003D29] shadow-md py-2">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex justify-between items-center w-full">
            {/* Left section */}
            <NavbarBrand>
              <div className="flex justify-center items-center space-x-2 cursor-pointer">
                <div
                  onClick={handleCartClick}
                  className="p-2 rounded-xl border-1 border-green-700">
                  <LuMenu size={20} className="text-white" />
                </div>

                <span className="flex" onClick={handleRoute}>
                  <Image
                    className="lg:hidden"
                    src="https://res.cloudinary.com/dgbreoalg/image/upload/v1730492969/apron_z9z60j.png"
                    width={30}
                  />
                  <h2 className="font-extrabold text-white hidden lg:flex lg:flex-row lg:items-end text-2xl">
                    <span className="text-green-700">Sale</span>man
                    <span className="text-sm">.xyz</span>
                  </h2>
                </span>
              </div>
            </NavbarBrand>

            {/* Center section */}
            <NavbarContent
              className="sm:flex gap-4 flex-grow justify-center"
              justify="center">
              <NavbarItem className="hidden lg:flex flex-grow max-w-2xl">
                <Input
                  size="lg"
                  radius="full"
                  className="w-full"
                  classNames={{
                    base: "max-w-full h-10",
                    mainWrapper: "h-full",
                    input: "text-small",
                    inputWrapper:
                      "h-full font-normal ring-1 ring-gray-300 text-gray-700 bg-white",
                  }}
                  placeholder={
                    isAIMode
                      ? "Prompt: Search for restaurants around you"
                      : "Search for groceries..."
                  }
                  value={searchQuery}
                  startContent={<FiSearch className="text-gray-700 w-5 h-5" />}
                  type="search"
                />
              </NavbarItem>
              {session && (
                <NavbarItem className="lg:hidden">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        startContent={<LuMapPin size={24} />}
                        variant="light"
                        className="capitalize rounded-full font-semibold text-base text-white lg:text-black">
                        <p>
                          {selectedValue || "Select State"}{" "}
                          <span className="hidden lg:block">, Nigeria</span>
                        </p>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Select a state"
                      className="max-h-60 overflow-y-auto text-default-500"
                      variant="flat"
                      disallowEmptySelection
                      selectionMode="single"
                      selectedKeys={selectedKeys}
                      onSelectionChange={handleSelectionChange}>
                      {nigerianStates.map((state) => (
                        <DropdownItem key={state.id}>
                          <p className="text-default-500">{state.name}</p>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </NavbarItem>
              )}
            </NavbarContent>

            {/* Right section */}
            <NavbarContent justify="end" className="flex-none">
              {session ? (
                <div className="flex items-center gap-4">
                  <NavbarItem className="hidden lg:flex">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          startContent={<LuMapPin size={24} />}
                          variant="light"
                          className="capitalize rounded-full font-semibold text-base text-white">
                          <p>{selectedValue || "Select State"}, Nigeria</p>
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Select a state"
                        className="max-h-60 overflow-y-auto text-default-500"
                        variant="flat"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedKeys}
                        onSelectionChange={handleSelectionChange}>
                        {nigerianStates.map((state) => (
                          <DropdownItem key={state.id}>
                            <p className="text-default-500">{state.name}</p>
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </NavbarItem>
                  <NavbarItem className="hidden lg:flex">
                    <Popover>
                      <PopoverTrigger>
                        <div className="relative cursor-pointer">
                          <FaBell size={24} className="text-white" />
                          {notificationCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {notificationCount}
                            </span>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Card>
                          <div className="p-2">
                            <h4>Notifications</h4>
                            <Spacer y={0.5} />
                            <h4>
                              You have {notificationCount} new notifications
                            </h4>
                          </div>
                        </Card>
                      </PopoverContent>
                    </Popover>
                  </NavbarItem>
                  <NavbarItem>
                    <BalancePopover
                      totalAmount={totalAmount}
                      onWithdraw={handleWithdrawal}
                      buttonColor={buttonColor}
                      autoWithdrawalInterval={autoWithdrawalInterval}
                    />
                  </NavbarItem>
                </div>
              ) : (
                <div className="flex gap-2">
                  <NavbarItem className="lg:flex">
                    <Button
                      onPress={onOpen}
                      variant="flat"
                      className="rounded-full w-4 lg:px-12 text-black bg-gray-200">
                      <p>Log in</p>
                    </Button>
                  </NavbarItem>
                  <NavbarItem>
                    <Button
                      onPress={onOpen}
                      variant="flat"
                      className="rounded-full bg-green-700 lg:px-12 text-white">
                      <p>Sign Up</p>
                    </Button>
                  </NavbarItem>
                </div>
              )}
            </NavbarContent>
          </div>
        </div>
      </Navbar>

      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isOpen}
        onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <h3 id="modal-title">Welcome to saleman</h3>
          </ModalHeader>
          <ModalBody>
            <div className="p-2">
              <Auth
                supabaseClient={supabaseUtil}
                appearance={{ theme: ThemeSupa }}
                providers={["google", "discord"]}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Header;
