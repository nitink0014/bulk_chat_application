
import { useState } from "react";
import { MessageCircle, X, Headset } from "lucide-react";

function SupportPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#f8f9fc]">

      {/* Customer Website */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#eeeaff] text-[#6650d9]">
          <Headset size={38} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Welcome to BulkChat
        </h1>

        <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
          Need any help? Our support team is here for you.
          Click the chat icon to start a conversation.
        </p>

        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="mt-6 rounded-xl bg-[#6650d9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5540c0]"
        >
          Contact Support
        </button>
      </div>

      {/* Floating Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(620px,calc(100vh-130px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeeaff] text-[#6650d9]">
                <Headset size={19} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  BulkChat Support
                </h2>
                <p className="text-[11px] text-green-600">
                  We're here to help
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <iframe
            src="/embed/chat"
            title="BulkChat Customer Support"
            className="min-h-0 w-full flex-1 border-0"
            allow="clipboard-write"
          />
        </div>
      )}

      {/* Floating Message Icon */}
      <button
        type="button"
        onClick={() => setIsChatOpen((prev) => !prev)}
        aria-label={isChatOpen ? "Close support chat" : "Open support chat"}
        className="fixed bottom-5 right-5 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-[#6650d9] text-white shadow-xl transition duration-200 hover:scale-105 hover:bg-[#5540c0]"
      >
        {isChatOpen ? (
          <X size={27} />
        ) : (
          <MessageCircle size={28} />
        )}
      </button>

    </div>
  );
}

export default SupportPage;
