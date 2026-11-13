
import {
  UserRound,
  Mail,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Camera,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

function ProfilePage() {
  const user = {
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    location: "New York, USA",
    memberSince: "November 2026",
    role: "Customer",
    bio: "I enjoy connecting with people and getting quick solutions to my questions.",
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#6650d9]"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#6650d9]">
              Account Settings
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Profile
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your personal information and account details.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-36 bg-gradient-to-r from-[#6650d9] via-[#8068e8] to-[#a18df4]" />

          <div className="px-6 pb-7 sm:px-9">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="relative w-fit">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-[#eeeaff] text-3xl font-bold text-[#6650d9] shadow-sm">
                  {user.name.charAt(0)}
                </div>

                <button
                  type="button"
                  aria-label="Change profile picture"
                  className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-[#6650d9] p-2 text-white shadow-md transition hover:bg-[#5140b5]"
                >
                  <Camera size={15} />
                </button>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6650d9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5140b5]"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            </div>

            <div className="mt-5">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              <span className="mt-3 inline-flex rounded-full bg-[#f0edff] px-3 py-1 text-xs font-semibold text-[#6650d9]">
                {user.role}
              </span>
            </div>

            <div className="my-7 border-t border-gray-100" />

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Personal Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your basic account information.
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <InfoItem
                  icon={<UserRound size={18} />}
                  label="Full Name"
                  value={user.name}
                />

                <InfoItem
                  icon={<Mail size={18} />}
                  label="Email Address"
                  value={user.email}
                />

                <InfoItem
                  icon={<MapPin size={18} />}
                  label="Location"
                  value={user.location}
                />

                <InfoItem
                  icon={<CalendarDays size={18} />}
                  label="Member Since"
                  value={user.memberSince}
                />
              </div>
            </div>

            <div className="my-7 border-t border-gray-100" />

            {/* About */}
            <div>
              <h3 className="text-lg font-bold text-gray-900">About Me</h3>
              <p className="mt-3 rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-600">
                {user.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-6 flex items-start gap-4 rounded-2xl border border-green-100 bg-green-50 p-5">
          <div className="rounded-xl bg-green-100 p-3 text-green-700">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Your account is secure
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Your account is active. Keep your information updated for a
              better support experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-[#f0edff] p-3 text-[#6650d9]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;
