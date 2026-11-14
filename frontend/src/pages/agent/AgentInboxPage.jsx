
import { useState } from "react";
import {
  MessageCircle,
  Search,
  Send,
  UserRound,
  ArrowLeft,
  Inbox,
} from "lucide-react";

function AgentInboxPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");

  // Temporary UI data. Later backend API se replace hoga.
  const conversations = [];

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
          <aside className={`border-r border-gray-100 ${selectedConversation ? "hidden md:block" : "block"}`}>
            <div className="border-b border-gray-100 p-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#6650d9]"
                />
              </div>
            </div>

            <div className="flex h-[calc(100%-75px)] items-center justify-center p-6">
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
          </aside>

          {/* Chat Area */}
          <section className={`${selectedConversation ? "block" : "hidden md:flex"} flex-col`}>
            {selectedConversation ? (
              <>
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
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {selectedConversation.name}
                    </h3>
                    <p className="text-xs text-gray-500">Visitor</p>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                  Messages will appear here.
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMessage("");
                  }}
                  className="flex items-center gap-3 border-t border-gray-100 p-4"
                >
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#6650d9]"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="rounded-xl bg-[#6650d9] p-3 text-white transition hover:bg-[#5540c5] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={18} />
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
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AgentInboxPage;
