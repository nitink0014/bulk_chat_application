
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Inbox,
  Users,
  MessageCircle,
  Settings,
  Search,
  MoreHorizontal,
  Send,
  Paperclip,
  Smile,
  Circle,
  Monitor,
  Globe,
  Clock,
  UserRound,
  UserCheck,
  CheckCircle,
  RotateCcw,
} from "lucide-react";

const visitors = [
  {
    id: "BRW-10245",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    browser: "Chrome 156.0",
    os: "Windows 11",
    device: "Desktop",
    page: "/dashboard",
    location: "India",
    time: "Just now",
    status: "Online",
    initials: "RS",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "BRW-10246",
    name: "Priya Verma",
    email: "priya@example.com",
    browser: "Firefox 132.0",
    os: "Windows 10",
    device: "Desktop",
    page: "/pricing",
    location: "India",
    time: "2 min ago",
    status: "Online",
    initials: "PV",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: "BRW-10247",
    name: "Aman Kumar",
    email: "aman@example.com",
    browser: "Safari 18.0",
    os: "macOS",
    device: "Laptop",
    page: "/support",
    location: "India",
    time: "15 min ago",
    status: "Offline",
    initials: "AK",
    color: "bg-blue-100 text-blue-700",
  },
];

const initialConversations = [
  {
    id: 1,
    visitorId: "BRW-10245",
    message: "I need help with my account.",
    time: "10:42 AM",
    status: "New",
    unread: 2,
    assignee: null,
  },
  {
    id: 2,
    visitorId: "BRW-10246",
    message: "Thank you for your support!",
    time: "10:30 AM",
    status: "Open",
    unread: 0,
    assignee: "me",
  },
  {
    id: 3,
    visitorId: "BRW-10247",
    message: "Can you explain the pricing?",
    time: "09:55 AM",
    status: "Open",
    unread: 1,
    assignee: "other",
  },
];

const initialMessages = {
  "BRW-10245": [
    {
      id: 1,
      text: "Hello! I need some help with my account. I am unable to access my dashboard.",
      sender: "customer",
      time: "10:42 AM",
    },
    {
      id: 2,
      text: "Hello! Welcome to BulkChat support. I will be happy to help you. Can you tell me what issue you are facing?",
      sender: "agent",
      time: "10:43 AM",
    },
    {
      id: 3,
      text: "I am getting an error when I try to log in.",
      sender: "customer",
      time: "10:44 AM",
    },
  ],
  "BRW-10246": [
    {
      id: 4,
      text: "Hi, I have a question about my subscription.",
      sender: "customer",
      time: "10:25 AM",
    },
    {
      id: 5,
      text: "Sure! I would be happy to help you with that.",
      sender: "agent",
      time: "10:27 AM",
    },
    {
      id: 6,
      text: "Thank you for your support!",
      sender: "customer",
      time: "10:30 AM",
    },
  ],
  "BRW-10247": [
    {
      id: 7,
      text: "Can you explain the pricing?",
      sender: "customer",
      time: "09:55 AM",
    },
  ],
};

function AgentDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const routeVisitor = location.state?.visitor || visitors[0];

  const [activeVisitor, setActiveVisitor] = useState(routeVisitor);
  const [conversations, setConversations] = useState(initialConversations);
  const [messagesByVisitor, setMessagesByVisitor] = useState(initialMessages);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const messagesEndRef = useRef(null);

  const isNewVisitor = !conversations.some(
    (conversation) => conversation.visitorId === activeVisitor.id
  );

  const activeConversation = conversations.find(
    (conversation) => conversation.visitorId === activeVisitor.id
  );

  const messages = messagesByVisitor[activeVisitor.id] || [];

  const currentStatus = activeConversation?.status || "New";

  // Visitors page se selected visitor receive karna
  useEffect(() => {
    if (location.state?.visitor) {
      setActiveVisitor(location.state.visitor);
      setReply("");
    }
  }, [location.state]);

  // Search and filters
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const visitor = visitors.find(
        (item) => item.id === conversation.visitorId
      );

      if (!visitor) return false;

      const matchesSearch =
        visitor.name.toLowerCase().includes(search.toLowerCase()) ||
        conversation.message.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Unassigned" && !conversation.assignee) ||
        (activeFilter === "Mine" && conversation.assignee === "me");

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter, conversations]);

  // Conversation select
  const handleSelectConversation = (visitor) => {
    setActiveVisitor(visitor);
    setReply("");
  };

  // Assign conversation to current agent
  const handleAssignToMe = () => {
    setConversations((prev) => {
      const exists = prev.some(
        (item) => item.visitorId === activeVisitor.id
      );

      if (!exists) {
        return [
          {
            id: Date.now(),
            visitorId: activeVisitor.id,
            message: "New conversation",
            time: "Just now",
            status: "Open",
            unread: 0,
            assignee: "me",
          },
          ...prev,
        ];
      }

      return prev.map((item) =>
        item.visitorId === activeVisitor.id
          ? { ...item, assignee: "me" }
          : item
      );
    });
  };

  // Update conversation status
  const handleStatusChange = (newStatus) => {
    setConversations((prev) => {
      const exists = prev.some(
        (item) => item.visitorId === activeVisitor.id
      );

      if (!exists) {
        return [
          {
            id: Date.now(),
            visitorId: activeVisitor.id,
            message: "New conversation",
            time: "Just now",
            status: newStatus,
            unread: 0,
            assignee: null,
          },
          ...prev,
        ];
      }

      return prev.map((item) =>
        item.visitorId === activeVisitor.id
          ? { ...item, status: newStatus }
          : item
      );
    });
  };

  // Agent message send
  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedReply = reply.trim();

    if (!trimmedReply || currentStatus === "Closed") return;

    const newMessage = {
      id: Date.now(),
      text: trimmedReply,
      sender: "agent",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessagesByVisitor((prev) => ({
      ...prev,
      [activeVisitor.id]: [
        ...(prev[activeVisitor.id] || []),
        newMessage,
      ],
    }));

    setConversations((prev) => {
      const exists = prev.some(
        (item) => item.visitorId === activeVisitor.id
      );

      if (!exists) {
        return [
          {
            id: Date.now(),
            visitorId: activeVisitor.id,
            message: trimmedReply,
            time: newMessage.time,
            status: "Open",
            unread: 0,
            assignee: "me",
          },
          ...prev,
        ];
      }

      return prev.map((item) =>
        item.visitorId === activeVisitor.id
          ? {
              ...item,
              message: trimmedReply,
              time: newMessage.time,
              status: "Open",
            }
          : item
      );
    });

    setReply("");
  };

  // Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const statusStyle = {
    New: "bg-blue-50 text-blue-700",
    Open: "bg-green-50 text-green-700",
    Closed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc] text-gray-800">

      {/* Sidebar */}
      <aside className="flex w-[72px] shrink-0 flex-col items-center border-r border-gray-200 bg-white py-5">
        <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-xl bg-[#6650d9] text-white">
          <MessageCircle size={24} />
        </div>

        <nav className="flex flex-1 flex-col gap-4">
          <SidebarIcon icon={<LayoutDashboard size={21} />} />
          <SidebarIcon icon={<Inbox size={21} />} active />

          <SidebarIcon
            icon={<Users size={21} />}
            onClick={() => navigate("/agent/visitors")}
          />

          <SidebarIcon icon={<MessageCircle size={21} />} />
        </nav>

        <div className="flex flex-col gap-5">
          <SidebarIcon
  icon={<Settings size={21} />}
  onClick={() => navigate("/agent/settings")}
/>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeeaff] font-bold text-[#6650d9]">
            A
          </div>
        </div>
      </aside>

      {/* Conversations Panel */}
      <section className="flex w-[320px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
            <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <MoreHorizontal size={21} />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3">
            <Search size={17} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mt-5 flex gap-5 text-sm font-medium">
            {["All", "Unassigned", "Mine"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`border-b-2 pb-3 transition ${
                  activeFilter === filter
                    ? "border-[#6650d9] text-[#6650d9]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const visitor = visitors.find(
              (item) => item.id === conversation.visitorId
            );

            if (!visitor) return null;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => handleSelectConversation(visitor)}
                className={`flex w-full gap-3 border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 ${
                  activeVisitor.id === visitor.id ? "bg-[#f5f2ff]" : ""
                }`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${visitor.color}`}>
                  {visitor.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {visitor.name}
                    </h3>
                    <span className="shrink-0 text-[11px] text-gray-400">
                      {conversation.time}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {conversation.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle[conversation.status]}`}>
                      {conversation.status}
                    </span>

                    <div className="flex items-center gap-2">
                      {conversation.assignee === "me" && (
                        <span className="text-[10px] text-gray-400">
                          Agent A
                        </span>
                      )}

                      {conversation.unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6650d9] px-1 text-[10px] font-bold text-white">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {isNewVisitor && (
            <div className="flex gap-3 border-b border-gray-100 bg-[#f5f2ff] p-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${activeVisitor.color}`}>
                {activeVisitor.initials}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900">
                  {activeVisitor.name}
                </h3>
                <p className="mt-1 truncate text-xs text-gray-500">
                  New conversation
                </p>
                <span className="mt-2 inline-block rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                  New
                </span>
              </div>
            </div>
          )}

          {filteredConversations.length === 0 && !isNewVisitor && (
            <div className="px-5 py-10 text-center">
              <MessageCircle size={28} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-600">
                No conversations found
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Try another search or filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Main Chat */}
      <main className="flex min-w-0 flex-1 flex-col bg-[#f8f9fc]">
        <header className="flex min-h-[76px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${activeVisitor.color}`}>
              {activeVisitor.initials}
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {activeVisitor.name}
              </h2>

              <div className="mt-1 flex items-center gap-1.5">
                <Circle
                  size={8}
                  className={`fill-current ${
                    activeVisitor.status === "Online"
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                />
                <span className="text-xs text-gray-500">
                  {activeVisitor.status} · {currentStatus} conversation
                </span>
              </div>
            </div>
          </div>

          {/* Conversation Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {!activeConversation?.assignee && (
              <button
                type="button"
                onClick={handleAssignToMe}
                className="flex items-center gap-2 rounded-lg border border-[#6650d9] px-3 py-2 text-xs font-semibold text-[#6650d9] transition hover:bg-[#f5f2ff]"
              >
                <UserCheck size={15} />
                Assign to Me
              </button>
            )}

            {activeConversation?.assignee === "me" && (
              <span className="rounded-lg bg-[#eeeaff] px-3 py-2 text-xs font-semibold text-[#6650d9]">
                <UserCheck size={14} className="mr-1 inline" />
                Assigned to Agent A
              </span>
            )}

            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#6650d9]"
            >
              <option value="New">New</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>

            {currentStatus !== "Closed" ? (
              <button
                type="button"
                onClick={() => handleStatusChange("Closed")}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200"
              >
                <CheckCircle size={15} />
                Close
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStatusChange("Open")}
                className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
              >
                <RotateCcw size={15} />
                Reopen
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          <div className="self-center rounded-full bg-white px-4 py-2 text-xs text-gray-400 shadow-sm">
            Today, November 13
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#6650d9]">
                <MessageCircle size={30} />
              </div>

              <h3 className="mt-5 text-base font-bold text-gray-800">
                Start a conversation
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                You are now viewing {activeVisitor.name}. Send a message to begin the conversation.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAgent = msg.sender === "agent";

              return (
                <div
                  key={msg.id}
                  className={`flex max-w-[75%] items-end gap-2 ${
                    isAgent ? "self-end flex-row-reverse" : ""
                  }`}
                >
                  {!isAgent && (
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${activeVisitor.color}`}>
                      {activeVisitor.initials}
                    </div>
                  )}

                  <div className={`rounded-2xl p-4 shadow-sm ${
                    isAgent
                      ? "rounded-br-sm bg-[#6650d9] text-white"
                      : "rounded-bl-sm bg-white text-gray-700"
                  }`}>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {msg.text}
                    </p>
                    <span className={`mt-2 block text-right text-[10px] ${
                      isAgent ? "text-purple-200" : "text-gray-400"
                    }`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        <div className="border-t border-gray-200 bg-white p-4">
          {currentStatus === "Closed" ? (
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                This conversation is closed.
              </p>
              <button
                type="button"
                onClick={() => handleStatusChange("Open")}
                className="text-sm font-semibold text-[#6650d9]"
              >
                Reopen conversation
              </button>
            </div>
          ) : (
            <>
              <form
                onSubmit={handleSendMessage}
                className="rounded-xl border border-gray-200 p-3 focus-within:border-[#6650d9] focus-within:ring-2 focus-within:ring-[#6650d9]/10"
              >
                <textarea
                  rows={2}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${activeVisitor.name}...`}
                  className="w-full resize-none text-sm outline-none"
                />

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-3 text-gray-400">
                    <button type="button" className="hover:text-[#6650d9]">
                      <Paperclip size={19} />
                    </button>
                    <button type="button" className="hover:text-[#6650d9]">
                      <Smile size={19} />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="flex items-center gap-2 rounded-lg bg-[#6650d9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5140b5] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Send
                    <Send size={15} />
                  </button>
                </div>
              </form>

              <p className="mt-2 text-right text-[10px] text-gray-400">
                Enter to send · Shift + Enter for new line
              </p>
            </>
          )}
        </div>
      </main>

      {/* Visitor Details */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-l border-gray-200 bg-white xl:flex">
        <div className="flex h-[76px] items-center justify-between border-b border-gray-100 px-5">
          <h2 className="font-bold text-gray-900">Visitor Details</h2>
          <button className="text-gray-400">
            <MoreHorizontal size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="flex flex-col items-center border-b border-gray-100 pb-6 text-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${activeVisitor.color}`}>
              {activeVisitor.initials}
            </div>

            <h3 className="mt-3 font-bold text-gray-900">
              {activeVisitor.name}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {activeVisitor.email}
            </p>

            <span className={`mt-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              activeVisitor.status === "Online"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}>
              <Circle size={7} className="fill-current" />
              {activeVisitor.status}
            </span>
          </div>

          <div className="border-b border-gray-100 py-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
              Visitor Information
            </h3>

            <VisitorInfo icon={<UserRound size={16} />} label="Visitor Name" value={activeVisitor.name} />
            <VisitorInfo icon={<Globe size={16} />} label="Browser ID" value={activeVisitor.id} />
            <VisitorInfo icon={<Globe size={16} />} label="Browser" value={activeVisitor.browser} />
            <VisitorInfo icon={<Monitor size={16} />} label="Operating System" value={activeVisitor.os} />
            <VisitorInfo icon={<Monitor size={16} />} label="Device" value={activeVisitor.device} />
            <VisitorInfo icon={<Globe size={16} />} label="Location" value={activeVisitor.location} />
            <VisitorInfo icon={<Clock size={16} />} label="Last Seen" value={activeVisitor.time} />
          </div>

          <div className="pt-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              Current Page
            </h3>

            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-800">
                Visited Page
              </p>
              <p className="mt-1 break-all text-xs text-gray-500">
                {activeVisitor.page}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SidebarIcon({ icon, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
        active
          ? "bg-[#eeeaff] text-[#6650d9]"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {icon}
    </button>
  );
}

function VisitorInfo({ icon, label, value }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="mt-1 break-words text-xs font-semibold text-gray-700">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

export default AgentDashboardPage;
