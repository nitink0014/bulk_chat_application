
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Inbox,
  Users,
  MessageCircle,
  PanelsTopLeft,
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
  LogOut,
} from "lucide-react";

import api from "../../services/api";
import { connectAgentSocket } from "../../services/socket";
import NotificationSetup from "../../components/NotificationSetup.jsx";
import { disablePushNotifications } from "../../services/pushNotifications";

const getInitials = (name = "Visitor") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatVisitor = (visitor) => {
  if (!visitor) return null;

  const name = visitor.name || "Unknown Visitor";

  return {
    ...visitor,
    id: visitor._id,
    name,
    email: visitor.email || "Email not provided",
    browser: visitor.browser || "Not available",
    os: visitor.os || "Not available",
    device: visitor.device || "Not available",
    page: visitor.currentPage || "Not available",
    location: visitor.country || visitor.location || "Not available",
    time: formatTime(visitor.lastSeen),
    status: visitor.isOnline ? "Online" : "Offline",
    initials: getInitials(name),
    color: "bg-purple-100 text-purple-700",
  };
};

const formatConversation = (item) => {
  const visitor = formatVisitor(item.visitor);

  return {
    ...item,
    id: item._id,
    visitorId: visitor?._id,
    visitor,
    message: item.lastMessage || "No messages yet",
    time: formatTime(item.lastMessageAt || item.createdAt),
    status:
      item.status?.charAt(0).toUpperCase() +
      item.status?.slice(1),
    unread: item.unread || 0,
    assignee: item.agent ? "me" : null,
  };
};

const formatMessage = (item) => ({
  id: item._id || item.id || `${Date.now()}`,
  text: item.content || item.message || "",
  sender:
    item.senderType === "agent" || item.sender === "agent"
      ? "agent"
      : "customer",
  time: formatTime(item.createdAt || new Date()),
});

function AgentDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeVisitor, setActiveVisitor] = useState(null);
  const [messagesByVisitor, setMessagesByVisitor] = useState({});

  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    setIsLoggingOut(true);
    setError("");

    try {
      // Attempt to unsubscribe from push notifications.
      // A push unsubscribe failure should not block logout.
      try {
        await disablePushNotifications();
        console.log("Push notifications disabled.");
      } catch (pushError) {
        console.error(
          "Push notification unsubscribe failed:",
          pushError
        );
      }

      // Clear authentication cookie on backend.
      await api.post("/auth/logout");

      // Disconnect Socket.IO.
      socketRef.current?.disconnect();
      socketRef.current = null;

      setSocketConnected(false);

      // Redirect to login.
      navigate("/agent/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to logout. Please try again."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const activeConversation = conversations.find(
    (item) => item.visitorId === activeVisitor?.id
  );

  const messages =
    messagesByVisitor[activeVisitor?.id] || [];

  const currentStatus = activeConversation?.status || "New";

  // Fetch conversations
  useEffect(() => {
    let mounted = true;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/chat/conversations");

        console.log("Backend Conversations:", response.data);

        const data = response.data.conversations || [];

        const formatted = data
          .map(formatConversation)
          .filter((item) => item.visitor);

        if (!mounted) return;

        setConversations(formatted);

        const requestedVisitor = location.state?.visitor;

        const selected = requestedVisitor
          ? formatted.find(
              (item) =>
                item.visitorId ===
                (requestedVisitor._id || requestedVisitor.id)
            )
          : null;

        setActiveVisitor(
          selected?.visitor || formatted[0]?.visitor || null
        );
      } catch (err) {
        console.error("Conversations API Error:", err);

        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load conversations."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchConversations();

    return () => {
      mounted = false;
    };
  }, []);

  // Agent Socket connection
  useEffect(() => {
    const socket = connectAgentSocket();

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("Agent connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      console.log("Agent disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Agent socket error:", err.message);
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Fetch existing messages when agent selects a conversation
  useEffect(() => {
    if (!activeConversation?._id || !activeVisitor?.id) return;

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        console.log(
          "Fetching messages for:",
          activeConversation._id
        );

        const response = await api.get(
          `/chat/${activeConversation._id}/messages`
        );

        if (cancelled) return;

        const formattedMessages = (
          response.data.messages || []
        ).map(formatMessage);

        setMessagesByVisitor((previous) => ({
          ...previous,
          [activeVisitor.id]: formattedMessages,
        }));

        console.log("Messages loaded:", formattedMessages);
      } catch (err) {
        console.error("Fetch Messages Error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load messages."
          );
        }
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [activeConversation?._id, activeVisitor?.id]);

  // Join active conversation room
  useEffect(() => {
    const socket = socketRef.current;

    if (!socket?.connected || !activeConversation?._id) return;

    socket.emit(
      "join_conversation",
      {
        conversationId: activeConversation._id,
      },
      (response) => {
        if (response?.success) {
          console.log(
            "Joined conversation:",
            activeConversation._id
          );
        } else {
          console.error(
            "Join failed:",
            response?.message
          );
        }
      }
    );
  }, [activeConversation?._id, socketConnected]);

  // Receive real-time messages
  useEffect(() => {
    const socket = socketRef.current;

    if (!socket) return;

    const handleNewMessage = (data) => {
      console.log("New message received:", data);

      const conversationId =
        data.conversationId ||
        data.conversation?._id ||
        data.conversation?.toString?.() ||
        data.conversation;

      if (!conversationId) {
        console.error("Message has no conversation ID:", data);
        return;
      }

      const conversation = conversations.find(
        (item) => item._id.toString() === conversationId.toString()
      );

      if (!conversation) {
        console.log(
          "Message belongs to another conversation:",
          conversationId
        );
        return;
      }

      const newMessage = formatMessage(data);

      setMessagesByVisitor((previous) => {
        const existing = previous[conversation.visitorId] || [];

        if (
          existing.some(
            (item) => item.id.toString() === newMessage.id.toString()
          )
        ) {
          return previous;
        }

        return {
          ...previous,
          [conversation.visitorId]: [
            ...existing,
            newMessage,
          ],
        };
      });

      setConversations((previous) =>
        previous.map((item) =>
          item._id.toString() === conversationId.toString()
            ? {
                ...item,
                message: newMessage.text,
                time: newMessage.time,
                lastMessage: newMessage.text,
                lastMessageAt: data.createdAt || new Date(),
              }
            : item
        )
      );
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [conversations]);

  // Handle visitor selected from Visitors page
  useEffect(() => {
    if (!location.state?.visitor) return;

    const requestedId =
      location.state.visitor._id ||
      location.state.visitor.id;

    const conversation = conversations.find(
      (item) => item.visitorId === requestedId
    );

    if (conversation) {
      setActiveVisitor(conversation.visitor);
      setReply("");
    }
  }, [location.state, conversations]);

  // Search and filters
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const visitor = conversation.visitor;

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
  }, [conversations, search, activeFilter]);

  const handleSelectConversation = (visitor) => {
    setActiveVisitor(visitor);
    setReply("");
    setError("");
  };

  // Assign conversation to agent
  const handleAssignToMe = async () => {
    if (!activeConversation?._id || assigning) return;

    try {
      setAssigning(true);
      setError("");

      const response = await api.patch(
        `/chat/${activeConversation._id}/assign`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Conversation could not be assigned."
        );
      }

      setConversations((previous) =>
        previous.map((item) =>
          item._id === activeConversation._id
            ? {
                ...item,
                assignee: "me",
                agent: response.data.conversation?.agent || item.agent,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Assign Conversation Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to assign conversation."
      );
    } finally {
      setAssigning(false);
    }
  };

  // Status change (local UI only)
  const handleStatusChange = (newStatus) => {
    setConversations((previous) =>
      previous.map((item) =>
        item.visitorId === activeVisitor?.id
          ? { ...item, status: newStatus }
          : item
      )
    );
  };

  // Send message through Socket.IO
  const handleSendMessage = (e) => {
    e.preventDefault();

    const content = reply.trim();
    const socket = socketRef.current;

    if (!content || !activeConversation?._id) return;
    if (currentStatus === "Closed") return;

    if (!socket?.connected) {
      setError("Agent is disconnected. Please reconnect.");
      return;
    }

    setSending(true);
    setError("");

    socket.emit(
      "send_message",
      {
        conversationId: activeConversation._id,
        content,
      },
      (response) => {
        setSending(false);

        if (!response?.success) {
          setError(
            response?.message || "Message could not be sent."
          );
          return;
        }

        setReply("");

        console.log("Message sent successfully:", response.data);
      }
    );
  };

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
          <SidebarIcon
            icon={<LayoutDashboard size={21} />}
            onClick={() => navigate("/agent/dashboard")}
            label="Dashboard"
          />

          <SidebarIcon
            icon={<Inbox size={21} />}
            onClick={() => navigate("/agent/inbox")}
            label="Inbox"
          />

          <SidebarIcon
            icon={<Users size={21} />}
            onClick={() => navigate("/agent/visitors")}
            label="Visitors"
          />

          <SidebarIcon
            icon={<MessageCircle size={21} />}
            label="Messages"
          />

          <SidebarIcon
            icon={<PanelsTopLeft size={21} />}
            onClick={() => navigate("/agent/widgets")}
            label="Widgets"
          />
        </nav>

        <div className="flex flex-col gap-5">
          <SidebarIcon
            icon={<Settings size={21} />}
            onClick={() => navigate("/agent/settings")}
            label="Settings"
          />

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeeaff] font-bold text-[#6650d9]">
            A
          </div>

          <SidebarIcon
            icon={<LogOut size={21} />}
            onClick={handleLogout}
            label={isLoggingOut ? "Logging out..." : "Logout"}
          />
        </div>
      </aside>

      {/* Conversations Panel */}
      <section className="flex w-[320px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              Inbox
            </h1>

            <div className="flex items-center gap-2">
              <NotificationSetup />
              <MoreHorizontal size={21} className="text-gray-500" />
            </div>
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
                    : "border-transparent text-gray-500"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-5 text-center text-sm text-gray-500">
              Loading conversations...
            </p>
          ) : filteredConversations.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <MessageCircle size={28} className="mx-auto text-gray-300" />

              <p className="mt-3 text-sm font-medium text-gray-600">
                No conversations found
              </p>

              {error && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const visitor = conversation.visitor;

              return (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => handleSelectConversation(visitor)}
                  className={`flex w-full gap-3 border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 ${
                    activeVisitor?.id === visitor.id ? "bg-[#f5f2ff]" : ""
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

                    <div className="mt-2 flex items-center justify-between">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle[conversation.status] || statusStyle.New}`}>
                        {conversation.status}
                      </span>

                      {conversation.assignee && (
                        <span className="text-[10px] text-gray-400">
                          Agent assigned
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Main Chat */}
      <main className="flex min-w-0 flex-1 flex-col bg-[#f8f9fc]">
        {!activeVisitor ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <MessageCircle size={40} className="text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">
              Select a conversation to start.
            </p>
          </div>
        ) : (
          <>
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

              <div className="flex flex-wrap items-center gap-2">
                {!activeConversation?.assignee && (
                  <button
                    type="button"
                    onClick={handleAssignToMe}
                    disabled={assigning}
                    className="flex items-center gap-2 rounded-lg border border-[#6650d9] px-3 py-2 text-xs font-semibold text-[#6650d9] hover:bg-[#f5f2ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserCheck size={15} />
                    {assigning ? "Assigning..." : "Assign to Me"}
                  </button>
                )}

                {activeConversation?.assignee === "me" && (
                  <span className="rounded-lg bg-[#eeeaff] px-3 py-2 text-xs font-semibold text-[#6650d9]">
                    Assigned to Agent A
                  </span>
                )}

                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none"
                >
                  <option value="New">New</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>

                {currentStatus !== "Closed" ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Closed")}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                  >
                    <CheckCircle size={15} />
                    Close
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Open")}
                    className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
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
                Conversation
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
                    Send a message to {activeVisitor.name}.
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
              {error && (
                <p className="mb-2 text-sm text-red-500">{error}</p>
              )}

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
                        disabled={!reply.trim() || sending || !socketConnected}
                        className="flex items-center gap-2 rounded-lg bg-[#6650d9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5140b5] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {sending ? "Sending..." : "Send"}
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
          </>
        )}
      </main>

      {/* Visitor Details */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-l border-gray-200 bg-white xl:flex">
        <div className="flex h-[76px] items-center justify-between border-b border-gray-100 px-5">
          <h2 className="font-bold text-gray-900">Visitor Details</h2>

          <MoreHorizontal size={20} className="text-gray-400" />
        </div>

        {activeVisitor && (
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
              <VisitorInfo icon={<Globe size={16} />} label="Visitor ID" value={activeVisitor.id} />
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
        )}
      </aside>
    </div>
  );
}

function SidebarIcon({ icon, active = false, onClick, label, disabled = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
        active
          ? "bg-[#eeeaff] text-[#6650d9]"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      } disabled:cursor-not-allowed disabled:opacity-50`}
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
