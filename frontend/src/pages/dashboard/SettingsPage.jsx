import React from "react";
import {
  Bell,
  LockKeyhole,
  ShieldCheck,
  Globe,
  Moon,
  Mail,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

function SettingsPage() {
  const [notifications, setNotifications] = React.useState({
    email: true,
    chat: true,
    updates: false,
  });

  const toggleNotification = (key) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#6650d9]">
            Preferences
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your account preferences and notifications.
          </p>
        </div>

        {/* Notifications */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#f0edff] p-3 text-[#6650d9]">
              <Bell size={21} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">
                Choose which notifications you want to receive.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <SettingToggle
              title="Email Notifications"
              description="Receive important updates through email."
              checked={notifications.email}
              onChange={() => toggleNotification("email")}
            />

            <SettingToggle
              title="Chat Notifications"
              description="Get notified about new support messages."
              checked={notifications.chat}
              onChange={() => toggleNotification("chat")}
            />

            <SettingToggle
              title="Product Updates"
              description="Receive news about new features and improvements."
              checked={notifications.updates}
              onChange={() => toggleNotification("updates")}
            />
          </div>
        </section>

        {/* Security */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ShieldCheck size={21} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Security & Privacy</h2>
              <p className="text-sm text-gray-500">
                Manage your account security.
              </p>
            </div>
          </div>

          <SettingRow
            icon={<LockKeyhole size={19} />}
            title="Change Password"
            description="Update your account password."
          />

          <SettingRow
            icon={<ShieldCheck size={19} />}
            title="Privacy"
            description="Review your account privacy preferences."
          />
        </section>

        {/* Appearance */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Globe size={21} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">General Preferences</h2>
              <p className="text-sm text-gray-500">
                Customize your experience.
              </p>
            </div>
          </div>

          <SettingRow
            icon={<Globe size={19} />}
            title="Language"
            description="English (United States)"
          />

          <SettingRow
            icon={<Moon size={19} />}
            title="Appearance"
            description="Light mode"
          />
        </section>

        {/* Support */}
        <section className="rounded-2xl border border-[#e9e3ff] bg-[#f5f2ff] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white p-3 text-[#6650d9]">
              <MessageCircle size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Need help with your account?
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Our support team is here to help you.
              </p>

              <a
                href="/support"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6650d9] hover:text-[#5140b5]"
              >
                Contact Support
                <ChevronRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#6650d9]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SettingRow({ icon, title, description }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 border-t border-gray-100 py-4 text-left transition hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500">{icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-gray-400" />
    </button>
  );
}

export default SettingsPage;
