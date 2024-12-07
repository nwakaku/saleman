import supabaseUtil from "../utils/supabase";

export const requestWithdrawal = async (marketplaceId, amount) => {
    try {
        // Fetch the total amount of orders for the marketplace
        const { data: orders, error: ordersError } = await supabaseUtil
            .from("orders")
            .select("total_amount")
            .eq("restaurant_id", marketplaceId);

        if (ordersError) throw ordersError;

        const totalAmount = orders.reduce((acc, order) => acc + order.total_amount, 0);

        // Check if the marketplace has enough balance
        if (amount > totalAmount) {
            throw new Error("Insufficient balance for withdrawal");
        }

        // Create a withdrawal record
        const { data: withdrawal, error: withdrawalError } = await supabaseUtil
            .from("withdrawals")
            .insert([{ marketplace_id: marketplaceId, amount }])
            .select()
            .single();

        if (withdrawalError) throw withdrawalError;

        return withdrawal;
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        throw error;
    }
};

export const fetchWithdrawals = async (marketplaceId) => {
    try {
        const { data: withdrawals, error } = await supabaseUtil
            .from("withdrawals")
            .select("*")
            .eq("marketplace_id", marketplaceId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return withdrawals;
    } catch (error) {
        console.error("Error fetching withdrawals:", error);
        throw error;
    }
}; 