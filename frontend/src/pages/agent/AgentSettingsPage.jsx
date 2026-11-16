
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Users,
  MessageCircle,
  Settings,
  UserRound,
  Bell,
  ShieldCheck,
  Save,
  Check,
} from "lucide-react";

function AgentSettingsPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "Agent A",
    email: "agent@bulkchat.com",
    role: "Support Agent",
  });

  const [availability, setAvailability] = useState(true);

  const [notifications, setNotifications] = useState({
    newConversation: true,
    newMessage: true,
    assignedConversation: false,
  });

  const [saved, setSaved] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Frontend demo only. Backend integration will come later.
    setSaved(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] text-gray-800">

      {/* Sidebar */}
      <aside className="flex w-[72px] shrink-0 flex-col items-center border-r border-gray-200 bg-white py-5">
        <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-xl bg-[#6650d9] text-white">
          <MessageCircle size={24} />
        </div>

        <nav className="flex flex-1 flex-col gap-4">
          <SidebarIcon
            icon={<LayoutDashboard size={21} />}
            onClick={() => navigate("/agent/dashboard")}
          />

          <SidebarIcon
            icon={<Inbox size={21} />}
            onClick={() => navigate("/agent/dashboard")}
          />

          <SidebarIcon
            icon={<Users size={21} />}
            onClick={() => navigate("/agent/visitors")}
          />
        </nav>

        <div className="flex flex-col gap-5">
          <SidebarIcon
            icon={<Settings size={21} />}
            active
          />

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeeaff] font-bold text-[#6650d9]">
            A
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#6650d9]">
            Agent Workspace
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your profile, availability and notification preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="mx-auto max-w-4xl space-y-6">

          {/* Profile Settings */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 border-b border-gray-100 p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6650d9]">
                <UserRound size={20} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Profile Information
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Update your personal account details.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleProfileChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition focus:border-[#6650d9] focus:ring-4 focus:ring-[#6650d9]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition focus:border-[#6650d9] focus:ring-4 focus:ring-[#6650d9]/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Account Role
                </label>

                <input
                  id="role"
                  type="text"
                  value={profile.role}
                  disabled
                  className="h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-500"
                />
              </div>
            </div>
          </section>

          {/* Availability */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Agent Availability
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Control your availability for customer conversations.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Available for chats
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {availability
                    ? "You are currently available."
                    : "You are currently unavailable."}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={availability}
                onClick={() => {
                  setAvailability((prev) => !prev);
                  setSaved(false);
                }}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  availability ? "bg-[#6650d9]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    availability ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 border-b border-gray-100 p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Bell size={20} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Notifications
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Choose which updates you want to receive.
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 px-5 sm:px-6">
              <NotificationOption
                title="New conversations"
                description="Get notified when a visitor starts a new conversation."
                checked={notifications.newConversation}
                onChange={() => handleNotificationChange("newConversation")}
              />

              <NotificationOption
                title="New messages"
                description="Get notified when a customer sends a new message."
                checked={notifications.newMessage}
                onChange={() => handleNotificationChange("newMessage")}
              />

              <NotificationOption
                title="Assigned conversations"
                description="Get notified when a conversation is assigned to you."
                checked={notifications.assignedConversation}
                onChange={() =>
                  handleNotificationChange("assignedConversation")
                }
              />
            </div>
          </section>

          {/* Save Changes */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
            <p className="text-xs text-gray-400">
              Changes are currently stored only in this page's state.
            </p>

            <button
              type="submit"
              className="flex h-11 items-center gap-2 rounded-lg bg-[#6650d9] px-5 text-sm font-semibold text-white transition hover:bg-[#5140b5]"
            >
              {saved ? <Check size={17} /> : <Save size={17} />}
              {saved ? "Changes Saved" : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
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

function NotificationOption({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 cursor-pointer accent-[#6650d9]"
      />
    </div>
  );
}

export default AgentSettingsPage;
