
import { Link } from "react-router-dom";
import {
  MessageCircle,
  LayoutDashboard,
  Headset,
  UserRound,
  Settings,
  LogOut,
  ArrowRight,
  Clock,
  ShieldCheck,
  Menu,
} from "lucide-react";

function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#e9eaf0] flex-col">
        <div className="h-20 px-7 flex items-center gap-3 border-b border-[#e9eaf0]">
          <div className="w-10 h-10 rounded-xl bg-[#6650d9] text-white flex items-center justify-center">
            <MessageCircle size={22} />
          </div>
          <span className="text-xl font-extrabold text-[#17172a]">
            BulkChat
          </span>
        </div>

        <div className="p-5 flex-1">
          <p className="text-[11px] font-bold text-[#9999a8] tracking-widest mb-4">
            MENU
          </p>

          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#6650d9]/10 text-[#6650d9] font-semibold text-sm"
            >
              <LayoutDashboard size={19} />
              Dashboard
            </Link>

            <Link
              to="/support"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#77788c] hover:bg-[#f5f4fb] hover:text-[#6650d9] transition text-sm font-medium"
            >
              <Headset size={19} />
              Live Support
            </Link>

            <Link
  to="/profile"
  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-[#f0edff] hover:text-[#6650d9]"
>
  <UserRound size={19} />
  My Profile
</Link>

            <Link
  to="/settings"
  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-[#f0edff] hover:text-[#6650d9]"
>
  <Settings size={19} />
  Settings
</Link>
          </nav>
        </div>

        <div className="p-5 border-t border-[#e9eaf0]">
          <button className="flex items-center gap-3 text-sm font-medium text-red-500 px-4 py-3">
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">

        {/* Topbar */}
        <header className="h-20 bg-white border-b border-[#e9eaf0] px-5 md:px-9 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#77788c]">
              <Menu size={23} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#17172a]">
                Dashboard
              </h1>
              <p className="text-xs text-[#9999a8]">
                Welcome back to BulkChat
              </p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#eeeafd] text-[#6650d9] flex items-center justify-center font-bold">
            U
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-5 md:p-9 max-w-7xl mx-auto">

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#17172a] tracking-tight">
              Hello, Welcome! 👋
            </h2>
            <p className="text-sm text-[#77788c] mt-2">
              We're here to help whenever you need us.
            </p>
          </div>

          {/* Support Banner */}
          <div className="relative overflow-hidden bg-[#6650d9] rounded-2xl p-7 md:p-10 text-white">
            <div className="relative z-10 max-w-xl">
              <span className="text-xs font-bold tracking-widest text-white/70">
                NEED ASSISTANCE?
              </span>

              <h2 className="text-2xl md:text-3xl font-bold mt-3">
                How can we help you today?
              </h2>

              <p className="text-sm text-white/75 mt-3 leading-6">
                Connect with our support team and get answers
                to your questions through live chat.
              </p>

              <Link
                to="/support"
                className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-black-100 text-[#6650d9] rounded-lg text-sm font-bold hover:bg-[#f3f0f0] transition"
              >
                Start a Conversation
                <ArrowRight size={17} />
              </Link>
            </div>

            <MessageCircle
              size={190}
              className="absolute -right-8 -bottom-12 text-white/10"
            />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-7">

            <div className="bg-white border border-[#e9eaf0] rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl bg-[#eeeafd] text-[#6650d9] flex items-center justify-center">
                <MessageCircle size={22} />
              </div>
              <h3 className="font-bold text-[#17172a] mt-5">
                Live Chat Support
              </h3>
              <p className="text-sm text-[#77788c] mt-2 leading-6">
                Chat directly with our support team for quick assistance.
              </p>
              <Link
                to="/support"
                className="inline-flex items-center gap-2 text-sm text-[#6650d9] font-semibold mt-4"
              >
                Open Live Chat <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white border border-[#e9eaf0] rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl bg-[#e8f8f0] text-[#15965b] flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-bold text-[#17172a] mt-5">
                Customer Assistance
              </h3>
              <p className="text-sm text-[#77788c] mt-2 leading-6">
                Get help from our team whenever you face an issue.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#15965b] font-semibold mt-4">
                <Clock size={16} />
                Support available
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
