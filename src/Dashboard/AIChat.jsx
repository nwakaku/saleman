/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { Card, Input, Button, Avatar } from "@nextui-org/react";
import { LuSend, LuBot, LuUser } from "react-icons/lu";
import { useMyContext } from "../context/MyContext";
import supabaseUtil from "../utils/supabase";
import BottomNav from "../components/BottomNav";

const Message = ({ content, isUser }) => (
  <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
    <Avatar
      icon={isUser ? <LuUser /> : <LuBot />}
      className={isUser ? "bg-green-100" : "bg-blue-100"}
    />
    <div
      className={`p-3 rounded-lg max-w-[80%] ${
        isUser
          ? "bg-green-100 text-green-800 rounded-br-none"
          : "bg-gray-100 text-gray-800 rounded-bl-none"
      }`}>
      {content}
    </div>
  </div>
);

export const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { session } = useMyContext();

  useEffect(() => {
    loadChatHistory();
  }, [session?.user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabaseUtil
        .from("chat_history")
        .select("*")
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    const newUserMessage = {
      content: userMessage,
      is_user: true,
      created_at: new Date().toISOString(),
    };

    try {
      // Save user message to Supabase
      const { error: userMsgError } = await supabaseUtil
        .from("chat_history")
        .insert({
          user_id: session.user.id,
          content: userMessage,
          is_user: true,
        });

      if (userMsgError) throw userMsgError;

      // Get AI response (you'll need to implement your AI service)
      const aiResponse = await generateAIResponse(userMessage);

      // Save AI response to Supabase
      const { error: aiMsgError } = await supabaseUtil
        .from("chat_history")
        .insert({
          user_id: session.user.id,
          content: aiResponse,
          is_user: false,
        });

      if (aiMsgError) throw aiMsgError;

      // Update local messages
      setMessages((prev) => [
        ...prev,
        newUserMessage,
        {
          content: aiResponse,
          is_user: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock AI response generator - replace with actual AI service
  const generateAIResponse = async (userMessage) => {
    try {
      // Fetch relevant data
      const ordersPromise = supabaseUtil
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      const subscriptionsPromise = supabaseUtil
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_subscription", true)
        .not("subscription_status", "eq", "cancelled");

      const [ordersResult, subscriptionsResult] = await Promise.all([
        ordersPromise,
        subscriptionsPromise,
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (subscriptionsResult.error) throw subscriptionsResult.error;

      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          orderData: ordersResult.data,
          subscriptionData: subscriptionsResult.data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "I apologize, but I encountered an error while processing your request. Please try again.";
    }
  };

  return (
    <div className="lg:ml-64 pt-0 h-auto flex flex-col pb-20 lg:pb-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-b">
        <h1 className="text-xl font-bold sm:text-2xl">Qike AI </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <Card className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <Message
                key={index}
                content={message.content}
                isUser={message.is_user}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your orders..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                isLoading={isLoading}
                onClick={handleSendMessage}
                className="bg-green-600 text-white"
                isIconOnly>
                <LuSend />
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default AIChat;
