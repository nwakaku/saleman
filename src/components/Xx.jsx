import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Pagination,
} from "@nextui-org/react";
import supabaseUtil from "../utils/supabase";


export const WithdrawalRequest_Xx = () => {

  const [withdrawals, setWithdrawals] = useState([]);
  const [marketplaceNames, setMarketplaceNames] = useState({});
  const [marketplaceDetails, setMarketplaceDetails] = useState();
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const statusColorMap = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    completed: "primary",
  };

  useEffect(() => {
    const fetchWithdrawals = async () => {
      const { data, error } = await supabaseUtil
        .from("withdrawals")
        .select(
          `
          id, 
          amount, 
          status, 
          created_at, 
          marketplace_id
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching withdrawals:", error);
        return;
      }

      // Fetch marketplace names
      const marketplaceIds = [...new Set(data.map((w) => w.marketplace_id))];
      const { data: marketplaceData } = await supabaseUtil
        .from("marketplaces")
        .select("id, name, bank_details")
        .in("id", marketplaceIds);

      // Create a map of marketplace IDs to names
      const marketplaceNameMap = marketplaceData.reduce((acc, marketplace) => {
        acc[marketplace.id] = marketplace.name;
        return acc;
      }, {});

      const marketplaceBank = marketplaceData.reduce((acc, marketplace) => {
        acc[marketplace.id] = marketplace.bank_details;
        return acc;
      }, {});

      setMarketplaceNames(marketplaceNameMap);
      setMarketplaceDetails(marketplaceBank);
      setWithdrawals(data || []);
    };

    fetchWithdrawals();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    const { error } = await supabaseUtil
      .from("withdrawals")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setWithdrawals((prevWithdrawals) =>
        prevWithdrawals.map((withdrawal) =>
          withdrawal.id === id
            ? { ...withdrawal, status: newStatus }
            : withdrawal
        )
      );
    }
  };

  const formatBankDetails = (details) => {
    if (!details) return "N/A";
    return `${details.bankName} - ${details.accountName} (${details.accountNumber})`;
  };

  const paginatedWithdrawals = withdrawals.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Withdrawal Requests</h1>
      <Table
        aria-label="Withdrawal requests table"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={Math.ceil(withdrawals.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }>
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Owner Name</TableColumn>
          <TableColumn>Bank</TableColumn>
          <TableColumn>Amount</TableColumn>
          <TableColumn>Date</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No withdrawal requests found">
          {paginatedWithdrawals.map(
            (withdrawal) => (
              console.log(withdrawal),
              (
                <TableRow key={withdrawal.id}>
                  <TableCell>{withdrawal.id}</TableCell>
                  <TableCell>
                    {marketplaceNames[withdrawal.marketplace_id] ||
                      "Unknown Marketplace"}
                  </TableCell>
                  <TableCell>
                    {formatBankDetails(
                      marketplaceDetails[withdrawal.marketplace_id]
                    )}
                  </TableCell>
                  <TableCell>₦{withdrawal.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(withdrawal.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={statusColorMap[withdrawal.status]}
                      variant="flat">
                      {withdrawal.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {withdrawal.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            onClick={() =>
                              handleStatusUpdate(withdrawal.id, "approved")
                            }>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() =>
                              handleStatusUpdate(withdrawal.id, "rejected")
                            }>
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
};
