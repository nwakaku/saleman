import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Card,
  CardHeader,
  CardBody,
  Chip,
  Spinner,
  Pagination,
  Button,
} from "@nextui-org/react";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import html2canvas from "html2canvas";

const Records = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const { session } = useMyContext();
    const [marketplaceId, setMarketplaceId] = useState(null);
    const [downloading, setDownloading] = useState(false);

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

  useEffect(() => {
    const fetchWithdrawals = async () => {
      if (!marketplaceId) return;

      try {
        const { data, error } = await supabaseUtil
          .from("withdrawals")
          .select("*")
          .eq("marketplace_id", marketplaceId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setWithdrawals(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [marketplaceId]);

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "warning",
      approved: "success",
      failed: "danger",
    };
    return statusColors[status.toLowerCase()] || "default";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const takeScreenShot = async () => {
    try {
      setDownloading(true);
      const element = document.getElementById("divToScreenShot");
      if (!element) {
        throw new Error("Element not found");
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#fff",
        logging: false,
        scale: 2, // Increased quality
      });

      // Create the image
      const image = canvas.toDataURL("image/jpeg", 1.0);

      // Create download link
      const downloadLink = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      downloadLink.download = `Withdrawal_History_${date}.jpeg`;
      downloadLink.href = image;
      downloadLink.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const pages = Math.ceil(withdrawals.length / rowsPerPage);
  const items = withdrawals.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return (
      <div className="lg:ml-64 flex justify-center items-center min-h-[600px]">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="lg:ml-64 max-w-7xl mx-auto p-4">
      <Card className="bg-white shadow-md" id="divToScreenShot">
        <CardHeader className="flex flex-col gap-2 p-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Withdrawal History
          </h1>
          <p className="text-gray-600">
            View and track all your withdrawal transactions
          </p>
        </CardHeader>
        <CardBody>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No withdrawal records found</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <Table
                aria-label="Withdrawal records table"
                bottomContent={
                  pages > 1 && (
                    <div className="flex justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="success"
                        page={page}
                        total={pages}
                        onChange={setPage}
                      />
                    </div>
                  )
                }>
                <TableHeader>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>REFERENCE ID</TableColumn>
                  <TableColumn>AMOUNT</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>BANK INFO</TableColumn>
                </TableHeader>
                <TableBody>
                  {items.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-bold">
                            {formatDate(withdrawal.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {withdrawal.id || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatAmount(withdrawal.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          className="capitalize"
                          color={getStatusColor(withdrawal.status)}
                          size="sm"
                          variant="flat">
                          {withdrawal.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {withdrawal.bank_name || "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {withdrawal.account_number || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="w-full flex justify-end">
                <Button
                  color="success"
                  variant="flat"
                  isLoading={downloading}
                  onClick={takeScreenShot}>
                  {downloading ? "Downloading..." : "Download History"}
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Records;
