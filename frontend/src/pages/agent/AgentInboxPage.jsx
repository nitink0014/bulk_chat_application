
import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Search,
  Send,
  UserRound,
  ArrowLeft,
  Inbox,
  Loader2,
  Circle,
} from "lucide-react";

import api from "../../services/api";
import { connectAgentSocket } from "../../services/socket";

function AgentInboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Keep selected conversation ID available to socket callbacks.
  useEffect(() => {
    selectedConversationRef.current = selectedConversation?._id || null;
  }, [selectedConversation]);

  // Load conversations from backend.
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const { data } = await api.get("/chat/conversations");

      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Fetch conversations error:", err);
      setError(
        err.response?.data?.message || "Failed to load conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  };

  // Add message only once.
  const addMessage = (newMessage) => {
    if (!newMessage?._id) return;

    setMessages((prev) => {
      const alreadyExists = prev.some(
        (item) => item._id === newMessage._id
      );

      if (alreadyExists) return prev;

      return [...prev, newMessage];
    });
  };

  // Connect agent socket and listen for live messages.
  useEffect(() => {
    const socket = connectAgentSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Agent socket connected:", socket.id);

      const conversationId = selectedConversationRef.current;

      if (conversationId) {
        socket.emit("join_conversation", { conversationId }, (response) => {
          console.log("Conversation joined:", response);
        });
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Agent socket connection error:", err.message);
    });

    socket.on("new_message", (newMessage) => {
      const currentId = selectedConversationRef.current;

      if (
        currentId &&
        String(newMessage.conversation) === String(currentId)
      ) {
        addMessage(newMessage);
      }

      // Update conversation preview.
      setConversations((prev) =>
        prev.map((conversation) =>
          String(conversation._id) === String(newMessage.conversation)
            ? {
                ...conversation,
                lastMessage: newMessage.content,
                lastMessageAt: newMessage.createdAt,
              }
            : conversation
        )
      );
    });

    fetchConversations();

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("new_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Load messages and join selected conversation.
  useEffect(() => {
    if (!selectedConversation?._id) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    const conversationId = selectedConversation._id;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setError("");

        const { data } = await api.get(
          `/chat/${conversationId}/messages`
        );

        console.log("API Messages:", data.messages);
console.log("Messages Count:", data.messages?.length);

        if (!cancelled) {
          setMessages(data.messages || []);

console.log("Messages received:", data.messages?.length);
        }
      } catch (err) {
        console.error("Fetch messages error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to load messages."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    const socket = socketRef.current;

    if (socket) {
      const joinConversation = () => {
        socket.emit(
          "join_conversation",
          { conversationId },
          (response) => {
            console.log("Join conversation response:", response);

            if (response && !response.success) {
              console.error("Could not join conversation:", response.message);
            }
          }
        );
      };

      if (socket.connected) {
        joinConversation();
      } else {
        socket.once("connect", joinConversation);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [selectedConversation?._id]);

  // Scroll to latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message using Socket.IO.
  const handleSendMessage = (e) => {
    e.preventDefault();

    const content = message.trim();
    const conversationId = selectedConversation?._id;
    const socket = socketRef.current;

    if (!content || !conversationId || sending) return;

    if (!socket?.connected) {
      setError("Socket disconnected. Please wait and try again.");
      return;
    }

    setSending(true);
    setError("");

    socket.emit(
      "send_message",
      {
        conversationId,
        content,
      },
      (response) => {
        setSending(false);

        if (!response?.success) {
          setError(response?.message || "Failed to send message.");
          return;
        }

        if (response.data) {
          addMessage(response.data);
        }

        setMessage("");

        setConversations((prev) =>
          prev.map((conversation) =>
            String(conversation._id) === String(conversationId)
              ? {
                  ...conversation,
                  lastMessage: content,
                  lastMessageAt: new Date().toISOString(),
                }
              : conversation
          )
        );
      }
    );
  };

  const filteredConversations = conversations.filter((conversation) => {
    const visitorName = conversation.visitor?.name || "Visitor";
    const visitorEmail = conversation.visitor?.email || "";

    const searchText = search.toLowerCase();

    return (
      visitorName.toLowerCase().includes(searchText) ||
      visitorEmail.toLowerCase().includes(searchText) ||
      (conversation.lastMessage || "").toLowerCase().includes(searchText)
    );
  });

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and reply to your customer conversations.
          </p>
        </div>

        <div className="grid h-[calc(100vh-155px)] min-h-[500px] grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:grid-cols-[320px_1fr]">

          {/* Conversation List */}
          <aside
            className={`border-r border-gray-100 ${
              selectedConversation ? "hidden md:block" : "block"
            }`}
          >
            <div className="border-b border-gray-100 p-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#6650d9]"
                />
              </div>
            </div>

            <div className="h-[calc(100%-75px)] overflow-y-auto">
              {loadingConversations ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="animate-spin text-[#6650d9]" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex h-full items-center justify-center p-6">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#6650d9]">
                      <Inbox size={26} />
                    </div>

                    <h3 className="font-semibold text-gray-800">
                      No conversations yet
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      New visitor chats will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const visitor = conversation.visitor || {};
                  const isSelected =
                    selectedConversation?._id === conversation._id;

                  return (
                    <button
                      key={conversation._id}
                      onClick={() => {
                        setError("");
                        setSelectedConversation(conversation);
                      }}
                      className={`flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 ${
                        isSelected ? "bg-purple-50" : ""
                      }`}
                    >
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#6650d9]">
                        <UserRound size={20} />

                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            visitor.isOnline
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-semibold text-gray-800">
                            {visitor.name || "Visitor"}
                          </h3>

                          <span className="shrink-0 text-xs text-gray-400">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>

                        <p className="truncate text-xs text-gray-400">
                          {visitor.email || "No email"}
                        </p>

                        <p className="mt-1 truncate text-sm text-gray-500">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat Area */}
          <section
            className={`${
              selectedConversation ? "flex" : "hidden md:flex"
            } min-h-0 flex-col`}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-gray-500 md:hidden"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-[#6650d9]">
                    <UserRound size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800">
                      {selectedConversation.visitor?.name || "Visitor"}
                    </h3>

                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Circle
                        size={8}
                        fill={
                          selectedConversation.visitor?.isOnline
                            ? "#22c55e"
                            : "#9ca3af"
                        }
                        className={
                          selectedConversation.visitor?.isOnline
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      />

                      {selectedConversation.visitor?.isOnline
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto bg-[#fafbff] p-4">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="animate-spin text-[#6650d9]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No messages in this conversation.
                    </div>
                  ) : (
                    messages.map((item) => {
                      const isAgent = item.senderType === "agent";

                      return (
                        <div
                          key={item._id}
                          className={`flex ${
                            isAgent ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                              isAgent
                                ? "rounded-br-sm bg-[#6650d9] text-white"
                                : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm">
                              {item.content}
                            </p>

                            <p
                              className={`mt-1 text-right text-[10px] ${
                                isAgent
                                  ? "text-purple-200"
                                  : "text-gray-400"
                              }`}
                            >
                              {formatTime(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Error */}
                {error && (
                  <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-3 border-t border-gray-100 p-4"
                >
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    maxLength={5000}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#6650d9]"
                  />

                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="rounded-xl bg-[#6650d9] p-3 text-white transition hover:bg-[#5540c5] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-[#6650d9]">
                  <MessageCircle size={30} />
                </div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Your conversations
                </h2>

                <p className="mt-1 max-w-xs text-sm text-gray-400">
                  Select a conversation from the left to start chatting with a visitor.
                </p>

                {error && (
                  <p className="mt-4 text-sm text-red-600">{error}</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AgentInboxPage;
