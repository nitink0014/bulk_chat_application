
import { useEffect, useRef, useState } from "react";
import {
  Send,
  MessageCircle,
  Headset,
  ShieldCheck,
  UserRound,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";

function EmbeddedChatPage() {
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [chatStarted, setChatStarted] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartChat = (e) => {
    e.preventDefault();

    const welcomeMessages = [
      {
        id: 1,
        text: `Hello ${customer.name}! 👋 Welcome to BulkChat Support.`,
        sender: "agent",
        time: new Date(),
      },
      {
        id: 2,
        text: "How can we help you today?",
        sender: "agent",
        time: new Date(),
      },
    ];

    setMessages(welcomeMessages);
    setChatStarted(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !chatStarted) return;

    const newMessage = {
      id: Date.now(),
      text: trimmedMessage,
      sender: "customer",
      time: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f8f9fc]">

      {/* Header */}
      <div className="flex items-center justify-between bg-[#6650d9] px-4 py-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Headset size={22} />
          </div>

          <div>
            <h2 className="text-sm font-bold">
              BulkChat Support
            </h2>

            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <p className="text-xs text-purple-100">
                We're here to help
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
          <ShieldCheck size={14} />
          <span className="text-xs font-medium">
            Support
          </span>
        </div>
      </div>

      {!chatStarted ? (
        /* Customer Details Form */
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#6650d9]">
              <MessageCircle size={28} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Start a Conversation
            </h2>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Please share your details so our support team can assist you.
            </p>
          </div>

          <form onSubmit={handleStartChat} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Your Name
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-[#6650d9]">
                <UserRound size={17} className="text-gray-400" />

                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={handleCustomerChange}
                  placeholder="Enter your name"
                  required
                  maxLength={60}
                  className="w-full py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Email Address
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-[#6650d9]">
                <Mail size={17} className="text-gray-400" />

                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleCustomerChange}
                  placeholder="Enter your email"
                  required
                  className="w-full py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Phone Number
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-[#6650d9]">
                <Phone size={17} className="text-gray-400" />

                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={handleCustomerChange}
                  placeholder="Enter your phone number"
                  required
                  maxLength={15}
                  pattern="[0-9+\-\s()]{7,15}"
                  title="Please enter a valid phone number"
                  className="w-full py-3 text-sm outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6650d9] py-3 text-sm font-semibold text-white transition hover:bg-[#5540c0]"
            >
              Start Chat
              <MessageCircle size={17} />
            </button>
          </form>

          <p className="mt-5 text-center text-[10px] leading-5 text-gray-400">
            Your details will help our support team assist you better.
          </p>
        </div>
      ) : (
        /* Chat Interface */
        <>
          <div className="border-b border-gray-100 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {customer.name}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {customer.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setChatStarted(false)}
                className="flex items-center gap-1 text-xs font-medium text-[#6650d9]"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
            <div className="mb-2 text-center">
              <p className="text-xs text-gray-400">
                Welcome to BulkChat
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Our support team is ready to help you.
              </p>
            </div>

            {messages.map((msg) => {
              const isCustomer = msg.sender === "customer";

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isCustomer ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isCustomer && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-[#6650d9]">
                      <MessageCircle size={16} />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      isCustomer
                        ? "rounded-br-sm bg-[#6650d9] text-white"
                        : "rounded-bl-sm border border-gray-100 bg-white text-gray-700"
                    }`}
                  >
                    <p className="break-words text-sm leading-5">
                      {msg.text}
                    </p>

                    <p
                      className={`mt-1 text-right text-[10px] ${
                        isCustomer
                          ? "text-purple-200"
                          : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.time)}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 transition focus-within:border-[#6650d9] focus-within:ring-2 focus-within:ring-[#6650d9]/10"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />

              <button
                type="submit"
                disabled={!message.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6650d9] text-white transition hover:bg-[#5540c0] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>

            <p className="mt-2 text-center text-[10px] text-gray-400">
              Powered by BulkChat
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default EmbeddedChatPage;
