
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Circle,
  Monitor,
  Globe,
  MoreHorizontal,
  MessageCircle,
  X,
  RefreshCw,
  Smartphone,
  Tablet,
  Clock,
  ExternalLink,
  MapPin,
  Calendar,
  Mail,
  Eye,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-indigo-100 text-indigo-700",
];

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "AV";
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleString();
};

const formatLastSeen = (date) => {
  if (!date) return "Unknown";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  const diff = Math.floor((Date.now() - parsedDate.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return parsedDate.toLocaleDateString();
};

const normalizeVisitor = (visitor, index) => {
  const browserName = visitor.browser?.name || "Unknown";
  const browserVersion = visitor.browser?.version || "";
  const osName = visitor.operatingSystem?.name || "Unknown";
  const osVersion = visitor.operatingSystem?.version || "";
  const name = visitor.name || "Anonymous Visitor";

  return {
    ...visitor,
    id: visitor.visitorId || visitor._id,
    name,
    email: visitor.email || "Not provided",

    // IP address
    ipAddress: visitor.ipAddress || "Not available",

    browser: `${browserName} ${browserVersion}`.trim(),
    os: `${osName} ${osVersion}`.trim(),

    device: visitor.device || "Unknown",
    page: visitor.currentPage || "Unknown",
    time: formatLastSeen(visitor.lastSeen),
    status: visitor.isOnline ? "Online" : "Offline",

    initials: getInitials(name),
    color: avatarColors[index % avatarColors.length],

    referrer: visitor.referrer || "Direct visit",
    widgetName: visitor.widget?.name || "Unknown Widget",
    websiteUrl: visitor.widget?.websiteUrl || "Unknown",
  };
};

function VisitorDetail({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
      {Icon && (
        <div className="rounded-lg bg-white p-2 text-gray-500">
          <Icon size={17} />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 break-all text-sm font-semibold text-gray-800">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

function VisitorDetailsModal({ visitor, onClose }) {
  if (!visitor) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Visitor Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Complete visitor information
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-6 flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold ${visitor.color}`}
            >
              {visitor.initials}
            </div>

            <div>
              <h3 className="font-bold text-gray-900">{visitor.name}</h3>
              <p className="text-sm text-gray-500">{visitor.email}</p>

              <span
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  visitor.isOnline
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Circle size={7} fill="currentColor" />
                {visitor.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <VisitorDetail
              label="Browser ID"
              value={visitor.visitorId || visitor._id}
              icon={Globe}
            />

            <VisitorDetail
              label="IP Address"
              value={visitor.ipAddress}
              icon={MapPin}
            />

            <VisitorDetail
              label="Widget"
              value={visitor.widgetName}
              icon={MessageCircle}
            />

            <VisitorDetail
              label="Website"
              value={visitor.websiteUrl}
              icon={ExternalLink}
            />

            <VisitorDetail
              label="Browser"
              value={visitor.browser}
              icon={Globe}
            />

            <VisitorDetail
              label="Operating System"
              value={visitor.os}
              icon={Monitor}
            />

            <VisitorDetail
              label="Device"
              value={visitor.device}
              icon={Smartphone}
            />

            <VisitorDetail
              label="Current Page"
              value={visitor.currentPage}
              icon={ExternalLink}
            />

            <VisitorDetail
              label="Referrer"
              value={visitor.referrer}
              icon={Globe}
            />

            <VisitorDetail
              label="First Seen"
              value={formatDate(visitor.firstSeen)}
              icon={Calendar}
            />

            <VisitorDetail
              label="Last Seen"
              value={formatDate(visitor.lastSeen)}
              icon={Clock}
            />

            <VisitorDetail
              label="Email"
              value={visitor.email}
              icon={Mail}
            />
          </div>
        </div>

        <div className="border-t p-5 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgentVisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const fetchVisitors = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/visitors");

      const visitorData = response.data?.visitors || [];

      setVisitors(visitorData.map(normalizeVisitor));
    } catch (err) {
      console.error("Fetch visitors error:", err);

      setError(
        err.response?.data?.message || "Unable to load visitors."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisitors();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredVisitors = useMemo(() => {
    return visitors.filter((visitor) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        visitor.name.toLowerCase().includes(searchText) ||
        visitor.email.toLowerCase().includes(searchText) ||
        visitor.browser.toLowerCase().includes(searchText) ||
        visitor.ipAddress.toLowerCase().includes(searchText) ||
        visitor.widgetName.toLowerCase().includes(searchText) ||
        visitor.page.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Online" && visitor.isOnline) ||
        (statusFilter === "Offline" && !visitor.isOnline);

      return matchesSearch && matchesStatus;
    });
  }, [visitors, search, statusFilter]);

  const onlineVisitors = visitors.filter(
    (visitor) => visitor.isOnline
  ).length;

  const offlineVisitors = visitors.length - onlineVisitors;

  const getDeviceIcon = (device) => {
    if (device === "mobile") return <Smartphone size={16} />;
    if (device === "tablet") return <Tablet size={16} />;
    return <Monitor size={16} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Website Visitors
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and understand visitors on your websites.
          </p>
        </div>

        <button
          onClick={() => fetchVisitors(false)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Visitors
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {visitors.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Online Visitors
              </p>
              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {onlineVisitors}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Circle size={23} fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Offline Visitors
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-700">
                {offlineVisitors}
              </h2>
            </div>

            <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
              <Users size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-900">All Visitors</h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredVisitors.length} visitors found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search visitors..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All Visitors</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="m-5 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw
              size={28}
              className="animate-spin text-blue-600"
            />
            <p className="mt-3 text-sm text-gray-500">
              Loading visitors...
            </p>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-gray-100 p-4 text-gray-400">
              <Users size={30} />
            </div>

            <h3 className="mt-4 font-semibold text-gray-800">
              No visitors found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Visitors will appear here when they visit your website.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">Visitor</th>
                  <th className="px-5 py-4">Widget</th>
                  <th className="px-5 py-4">Browser ID</th>
                  <th className="px-5 py-4">Browser / OS</th>
                  <th className="px-5 py-4">Current Page</th>
                  <th className="px-5 py-4">Last Seen</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredVisitors.map((visitor) => (
                  <tr
                    key={visitor._id || visitor.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${visitor.color}`}
                        >
                          {visitor.initials}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {visitor.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {visitor.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-700">
                        {visitor.widgetName}
                      </p>
                      <p className="mt-1 max-w-[150px] truncate text-xs text-gray-400">
                        {visitor.websiteUrl}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className="max-w-[140px] truncate text-xs text-gray-500"
                        title={visitor.visitorId}
                      >
                        {visitor.visitorId || visitor._id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Globe size={15} className="text-gray-400" />
                        {visitor.browser}
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        {visitor.os}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className="max-w-[180px] truncate text-sm text-gray-600"
                        title={visitor.page}
                      >
                        {visitor.page}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        {getDeviceIcon(visitor.device)}
                        {visitor.device}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">
                        {visitor.time}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          visitor.isOnline
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Circle
                          size={7}
                          fill="currentColor"
                        />
                        {visitor.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedVisitor(visitor)}
                        title="View visitor details"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visitor Details Modal */}
      {selectedVisitor && (
        <VisitorDetailsModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
        />
      )}
    </div>
  );
}
