/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Divider,
} from "@nextui-org/react";
import { LuWallet, LuEye, LuEyeOff, LuArrowDownToLine } from "react-icons/lu";
import { useMyContext } from "../context/MyContext";

const BalancePopover = ({
  totalAmount,
  onWithdraw,
  buttonColor,
  autoWithdrawalInterval,
}) => {
  const { isBalanceVisible, toggleBalanceVisibility } = useMyContext();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [password, setPassword] = useState("");

  const handleWithdraw = () => {
    if (onWithdraw) {
      onWithdraw({
        amount: parseFloat(withdrawAmount),
        password,
      });
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
      setPassword("");
    }
  };

  console.log(autoWithdrawalInterval);

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          variant="flat"
          className={`rounded-full lg:p-4 text-white ${buttonColor} relative`}>
          Bal:{" "}
          {isBalanceVisible
            ? `₦${totalAmount ? totalAmount.toFixed(2) : "0.00"}`
            : "******"}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Card className="w-[350px] p-4">
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <LuWallet className="text-green-700" size={24} />
              <h4 className="font-bold text-lg">My Balance</h4>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                isIconOnly
                variant="light"
                onClick={toggleBalanceVisibility}>
                {isBalanceVisible ? <LuEyeOff /> : <LuEye />}
              </Button>
            </div>
          </CardHeader>
          <Divider className="my-2" />
          <CardBody>
            <div className="text-center mb-4">
              <p className="text-gray-500">Total Balance</p>
              <h2 className="text-3xl font-bold text-green-700">
                {isBalanceVisible
                  ? `₦${totalAmount ? totalAmount.toFixed(2) : "0.00"}`
                  : "******"}
              </h2>
            </div>
            {autoWithdrawalInterval === "off" ?  (
              <Button
                fullWidth
                color="primary"
                variant="flat"
                className="bg-green-100 text-green-700"
                onClick={() => setIsWithdrawModalOpen(true)}
                startContent={<LuArrowDownToLine />}>
                Withdraw Funds
              </Button>) : null
            }

            {isWithdrawModalOpen && (
              <div className="mt-4 space-y-4">
                <Input
                  label="Withdrawal Amount"
                  placeholder="Enter amount to withdraw"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  startContent={<span className="text-default-400">₦</span>}
                />
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex space-x-2">
                  <Button
                    fullWidth
                    variant="bordered"
                    onClick={() => setIsWithdrawModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    color="primary"
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || !password}>
                    Confirm Withdrawal
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default BalancePopover;
