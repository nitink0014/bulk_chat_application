
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Headset,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import api from "../../services/api";
import { connectVisitorSocket } from "../../services/socket";
import {
  getVisitorId,
  trackVisitor,
} from "../../utils/visitor";

const EmbeddedChatPage = () => {
  const [searchParams] = useSearchParams();

  const publicKey = searchParams.get("key");

  const [currentPage, setCurrentPage] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
  });

  const [chatStarted, setChatStarted] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [connected, setConnected] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const [conversation, setConversation] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Receive customer website URL from parent website
  useEffect(() => {
    const handleParentMessage = (event) => {
      if (event.source !== window.parent) return;

      if (event.origin !== "http://localhost:5174") return;

      if (event.data?.type !== "BULKCHAT_PARENT_INFO") return;

      const websiteUrl = event.data.customerWebsite;

      try {
        const url = new URL(websiteUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          return;
        }

        if (url.origin !== event.origin) {
          return;
        }

        setCurrentPage(url.href);
      } catch {
        console.error("Invalid customer website URL");
      }
    };

    window.addEventListener("message", handleParentMessage);

    // Inform parent website that iframe is ready
    window.parent.postMessage(
      { type: "BULKCHAT_READY" },
      "*"
    );

    return () => {
      window.removeEventListener("message", handleParentMessage);
    };
  }, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Disconnect socket when component unmounts
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Update customer form
  const handleCustomerChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  // Add received message
  const addMessage = (data) => {
    setMessages((previous) => {
      const messageId = data?._id || data?.id;

      if (
        messageId &&
        previous.some(
          (item) => (item._id || item.id) === messageId
        )
      ) {
        return previous;
      }

      return [...previous, data];
    });
  };

  // Connect visitor socket
  const setupSocket = (key, visitorId, activeConversation) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = connectVisitorSocket(
      key,
      visitorId,
      currentPage
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);

      socket.emit(
        "join_conversation",
        {
          conversationId: activeConversation._id,
        },
        (response) => {
          if (!response?.success) {
            console.error(
              "Conversation join failed:",
              response?.message
            );
          }
        }
      );
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setConnected(false);
    });

    socket.on("new_message", (data) => {
      addMessage(data);
    });
  };

  // Start visitor conversation
  const handleStartChat = async (e) => {
    e.preventDefault();

    setError("");

    if (!currentPage) {
      setError(
        "Waiting for customer website information. Please try again."
      );
      return;
    }

    if (!customer.name.trim() || !customer.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    if (!publicKey) {
      setError("Widget public key is missing.");
      return;
    }

    try {
      setStartingChat(true);

      const visitorId = getVisitorId(publicKey);

      // Track visitor using actual customer website URL
      await trackVisitor(
        publicKey,
        visitorId,
        currentPage
      );

      // Create or get conversation
      const response = await api.post("/chat/conversation", {
        publicKey,
        visitorId,
        name: customer.name.trim(),
        email: customer.email.trim(),
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to start chat."
        );
      }

      const activeConversation = response.data.conversation;

      setConversation(activeConversation);

      // Connect visitor socket
      setupSocket(
        publicKey,
        visitorId,
        activeConversation
      );

      setChatStarted(true);
    } catch (err) {
      console.error("Start chat error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setStartingChat(false);
    }
  };

  // Send visitor message
  const handleSendMessage = (e) => {
    e.preventDefault();

    const content = message.trim();

    if (!content || !socketRef.current || !connected) {
      return;
    }

    if (!conversation?._id) {
      return;
    }

    socketRef.current.emit(
      "send_message",
      {
        conversationId: conversation._id,
        content,
      },
      (response) => {
        if (!response?.success) {
          setError(
            response?.message || "Message could not be sent."
          );
          return;
        }

        setMessage("");
        setError("");
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white font-sans">

      {/* Header */}
      <div className="flex items-center gap-3 bg-blue-600 px-5 py-4 text-white shadow-md">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
          <Headset size={23} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">
            Customer Support
          </h2>

          <p className="flex items-center gap-1 text-xs text-blue-100">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-green-400" : "bg-yellow-300"
              }`}
            />

            {chatStarted
              ? connected
                ? "Online"
                : "Connecting..."
              : "We're here to help"}
          </p>
        </div>

        <ShieldCheck size={21} className="text-blue-100" />
      </div>

      {/* Customer Form */}
      {!chatStarted ? (
        <div className="flex flex-1 flex-col overflow-y-auto p-6">

          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <MessageCircle size={30} />
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              Welcome!
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please enter your details to start a conversation.
            </p>
          </div>

          <form
            onSubmit={handleStartChat}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Your Name
              </label>

              <div className="flex items-center rounded-lg border border-gray-200 px-3 focus-within:border-blue-500">
                <UserRound
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={handleCustomerChange}
                  placeholder="Enter your name"
                  required
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <div className="flex items-center rounded-lg border border-gray-200 px-3 focus-within:border-blue-500">
                <Mail
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleCustomerChange}
                  placeholder="Enter your email"
                  required
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={startingChat || !currentPage}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {startingChat
                ? "Starting chat..."
                : !currentPage
                  ? "Connecting to website..."
                  : "Start Chat"}

              {!startingChat && <ArrowLeft size={17} />}
            </button>
          </form>

          <p className="mt-auto pt-6 text-center text-xs text-gray-400">
            Powered by BulkChat
          </p>
        </div>
      ) : (

        /* Chat Window */
        <>
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">

            <div className="mx-auto max-w-[85%] rounded-xl bg-blue-50 p-3 text-center text-sm text-gray-600">
              Hi {customer.name}! How can we help you today?
            </div>

            {messages.map((item, index) => {
              const isVisitor =
                item.senderType === "visitor" ||
                item.sender === "visitor";

              return (
                <div
                  key={item._id || item.id || index}
                  className={`flex ${
                    isVisitor ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      isVisitor
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
                    }`}
                  >
                    <p className="break-words text-sm">
                      {item.content || item.message}
                    </p>

                    <p
                      className={`mt-1 text-right text-[10px] ${
                        isVisitor
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      {formatTime(
                        item.createdAt || item.timestamp
                      )}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <p className="bg-red-50 px-4 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                connected
                  ? "Type your message..."
                  : "Connecting..."
              }
              disabled={!connected}
              className="min-w-0 flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!connected || !message.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default EmbeddedChatPage;
