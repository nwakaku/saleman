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
import { LuEye, LuEyeOff, LuMapPin, LuMenu, LuSparkles } from "react-icons/lu";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import { FiSearch } from "react-icons/fi";
import BalancePopover from "./BalancePopover";
import { requestWithdrawal } from "../utils/withdrawal";
import { toast } from "react-hot-toast";

const nigerianPlacesBaseUrl = import.meta.env.VITE_NIGERIAN_PLACES_API;

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
  const { session, setSession } = useMyContext();
  const [notificationCount, setNotificationCount] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { setUser, isAIMode, setIsAIMode } = useMyContext();
  const [selectedKeys, setSelectedKeys] = useState(new Set(["Abuja"]));
  const [nigerianStates, setNigerianStates] = useState([]);
  const [selectedValue, setSelectedValue] = useState("Abuja");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [buttonColor, setButtonColor] = useState("bg-green-700"); // Default button color
  const [marketplaceId, setMarketplaceId] = useState(null); // State to hold marketplaceId

  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setSearchQuery(prompt);
      setIsAIMode(true);
    }
  }, [searchParams, setIsAIMode]);

  useEffect(() => {
    const handleSession = () => {
      supabaseUtil.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      const {
        data: { subscription },
      } = supabaseUtil.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      setNotificationCount(2);

      return () => subscription.unsubscribe();
    };

    handleSession();
  }, []);

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
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching marketplace ID:", error);
        } else {
          setMarketplaceId(marketplaceData.id);
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
    navigate("/dashboard");
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
      <Navbar
        maxWidth="2xl"
        className="py-2 lg:bg-white bg-[#003D29] shadow-md">
        <NavbarBrand>
          <div className="flex justify-center items-center space-x-2 cursor-pointer">
            <div
              onClick={handleCartClick}
              className="p-2 rounded-xl border-1 border-green-700">
              <LuMenu size={20} className="text-white lg:text-black" />
            </div>

            <span className="flex" onClick={handleRoute}>
              <Image
                className=" lg:hidden"
                src="https://res.cloudinary.com/dgbreoalg/image/upload/v1730492969/apron_z9z60j.png"
                width={30}
              />
              <h2 className="font-extrabold hidden lg:flex text-inherit text-2xl text-green-900">
                <span className="text-green-700">Sale</span>man
              </h2>
            </span>
          </div>
        </NavbarBrand>
        <NavbarContent className=" sm:flex gap-4" justify="center">
          <NavbarItem className="hidden lg:flex">
            <Input
              size="lg"
              radius="full"
              fullWidth="true"
              classNames={{
                base: "max-w-full h-10 w-[500px]",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper:
                  "h-full font-normal ring-1 ring-gray-300 text-default-500 bg-default-400/20 dark:bg-default-500/20",
              }}
              placeholder={
                isAIMode
                  ? "Prompt: A month grocery for a bachelor with $2000 budget"
                  : "Search for groceries..."
              }
              value={searchQuery}
              startContent={
                isAIMode ? (
                  <LuSparkles className="text-[#FFDF00] w-5 h-5" />
                ) : (
                  <FiSearch className="text-gray-400 w-5 h-5" />
                )
              }
              type="search"
            />
          </NavbarItem>
          {session && (
            <NavbarItem className="lg:hidden ">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    startContent={<LuMapPin size={24} />}
                    variant="light"
                    className="capitalize rounded-full font-semibold text-base text-white lg:text-black">
                    <p>
                      {selectedValue || "Select State"}{" "}
                      <span className="hidden lg:block">,Nigeria</span>{" "}
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
        <NavbarContent justify="end">
          {session ? (
            <>
              <NavbarItem className="hidden lg:flex">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      startContent={<LuMapPin size={24} />}
                      variant="light"
                      className="capitalize rounded-full font-semibold text-base">
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
                    <div>
                      <div className="relative">
                        <FaBell size={24} />
                        {notificationCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {notificationCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Card>
                      <div className="p-2">
                        <h4>Notifications</h4>
                        <Spacer y={0.5} />
                        <h4>You have 2 new notifications</h4>
                      </div>
                    </Card>
                  </PopoverContent>
                </Popover>
              </NavbarItem>
              <NavbarItem className="flex items-center">
                <BalancePopover
                  totalAmount={totalAmount}
                  onWithdraw={handleWithdrawal}
                  buttonColor={buttonColor}
                />
              </NavbarItem>
            </>
          ) : (
            <div className="flex gap-2">
              <NavbarItem className=" lg:flex">
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
