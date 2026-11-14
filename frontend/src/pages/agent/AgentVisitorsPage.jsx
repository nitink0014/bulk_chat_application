
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Circle,
  Monitor,
  Globe,
  MoreHorizontal,
  MessageCircle,
  ArrowUpRight,
  X,
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

function AgentVisitorsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch =
      visitor.name.toLowerCase().includes(search.toLowerCase()) ||
      visitor.id.toLowerCase().includes(search.toLowerCase()) ||
      visitor.browser.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || visitor.status === filter;

    return matchesSearch && matchesFilter;
  });

  const onlineCount = visitors.filter(
    (visitor) => visitor.status === "Online"
  ).length;

  const startConversation = () => {
    if (!selectedVisitor) return;

    navigate("/agent/dashboard", {
      state: {
        visitor: selectedVisitor,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            All Visitors
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor visitors currently browsing your website.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-sm font-semibold text-gray-700">
            {onlineCount} Online
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Visitors"
          value={visitors.length}
          icon={<Users size={20} />}
        />

        <StatCard
          title="Online Visitors"
          value={onlineCount}
          icon={<Circle size={19} />}
        />

        <StatCard
          title="Offline Visitors"
          value={visitors.length - onlineCount}
          icon={<Globe size={20} />}
        />
      </div>

      {/* Visitors Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h2 className="font-bold text-gray-900">
              Website Visitors
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Visitor activity and device information
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
              <Search size={16} className="text-gray-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search visitors..."
                className="w-40 text-sm outline-none"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
            >
              <option value="All">All Visitors</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Visitor</th>
                <th className="px-5 py-4 font-semibold">Browser ID</th>
                <th className="px-5 py-4 font-semibold">Browser / OS</th>
                <th className="px-5 py-4 font-semibold">Current Page</th>
                <th className="px-5 py-4 font-semibold">Last Seen</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredVisitors.map((visitor) => (
                <tr
                  key={visitor.id}
                  onClick={() => setSelectedVisitor(visitor)}
                  className="cursor-pointer transition hover:bg-[#f8f6ff]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${visitor.color}`}
                      >
                        {visitor.initials}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {visitor.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {visitor.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs font-medium text-gray-600">
                    {visitor.id}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-700">
                      {visitor.browser}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Monitor size={12} />
                      {visitor.os} · {visitor.device}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {visitor.page}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-500">
                    {visitor.time}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        visitor.status === "Online"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Circle size={7} className="fill-current" />
                      {visitor.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      title="View visitor details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVisitor(visitor);
                      }}
                      className="rounded-lg bg-[#eeeaff] p-2 text-[#6650d9] transition hover:bg-[#6650d9] hover:text-white"
                    >
                      <MessageCircle size={17} />
                    </button>

                    <button
                      type="button"
                      title="More options"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <Users
                      className="mx-auto mb-3 text-gray-300"
                      size={30}
                    />

                    <p className="text-sm font-semibold text-gray-600">
                      No visitors found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400">
            Showing {filteredVisitors.length} of {visitors.length} visitors
          </p>

          <span className="flex items-center gap-1 text-xs text-gray-400">
            Demo data <ArrowUpRight size={13} />
          </span>
        </div>
      </div>

      {/* Visitor Details Modal */}
      {selectedVisitor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedVisitor(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Visitor Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Visitor Profile */}
            <div className="mt-6 flex items-center gap-3">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold ${selectedVisitor.color}`}
              >
                {selectedVisitor.initials}
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  {selectedVisitor.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {selectedVisitor.email}
                </p>

                <span
                  className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                    selectedVisitor.status === "Online"
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <Circle size={7} className="fill-current" />
                  {selectedVisitor.status}
                </span>
              </div>
            </div>

            {/* Visitor Information */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-gray-400">
                Visitor Information
              </h3>

              <div className="space-y-4">
                <VisitorDetail label="Browser ID" value={selectedVisitor.id} />
                <VisitorDetail label="Browser" value={selectedVisitor.browser} />
                <VisitorDetail label="Operating System" value={selectedVisitor.os} />
                <VisitorDetail label="Device" value={selectedVisitor.device} />
                <VisitorDetail label="Current Page" value={selectedVisitor.page} />
                <VisitorDetail label="Location" value={selectedVisitor.location} />
                <VisitorDetail label="Last Seen" value={selectedVisitor.time} />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={startConversation}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6650d9] py-3 text-sm font-semibold text-white transition hover:bg-[#5140b5]"
              >
                <MessageCircle size={16} />
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VisitorDetail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-400">{label}</span>

      <span className="break-all text-right text-sm font-semibold text-gray-700">
        {value}
      </span>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <h3 className="mt-2 text-2xl font-bold text-gray-900">
          {value}
        </h3>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6650d9]">
        {icon}
      </div>
    </div>
  );
}

export default AgentVisitorsPage;
