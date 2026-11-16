
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  LayoutDashboard,
  Users,
  Settings,
  PanelsTopLeft,
  Globe,
  Plus,
  Copy,
  Check,
  ArrowLeft,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Code,
} from "lucide-react";

import api from "../../services/api";

// Generate installation script for a widget
const getInstallationScript = (publicKey) => {
  return `<script
  src="http://localhost:5173/widget.js"
  data-key="${publicKey}"
  async
></script>`;
};

function AgentWidgetsPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    websiteUrl: "",
    allowedDomains: "",
  });

  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingWidgets, setFetchingWidgets] = useState(true);
  const [error, setError] = useState("");
  const [createdWidget, setCreatedWidget] = useState(null);

  const [copiedWidgetId, setCopiedWidgetId] = useState("");
  const [copiedScriptWidgetId, setCopiedScriptWidgetId] = useState("");

  // Fetch all widgets from backend
  const fetchWidgets = async () => {
    try {
      setFetchingWidgets(true);

      const response = await api.get("/widgets");

      setWidgets(response.data.widgets || []);
    } catch (err) {
      console.error("Fetch Widgets Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to fetch widgets. Please try again."
      );
    } finally {
      setFetchingWidgets(false);
    }
  };

  // Fetch widgets when page loads
  useEffect(() => {
    fetchWidgets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Create new widget
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setCreatedWidget(null);

    const allowedDomains = formData.allowedDomains
      .split(",")
      .map((domain) => domain.trim())
      .filter(Boolean);

    try {
      setLoading(true);

      const response = await api.post("/widgets", {
        name: formData.name.trim(),
        websiteUrl: formData.websiteUrl.trim(),
        allowedDomains,
      });

      const newWidget = response.data.widget;

      setCreatedWidget(newWidget);

      setWidgets((prev) => [
        newWidget,
        ...prev.filter((widget) => widget._id !== newWidget._id),
      ]);

      setFormData({
        name: "",
        websiteUrl: "",
        allowedDomains: "",
      });
    } catch (err) {
      console.error("Create Widget Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create widget. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Copy public key
  const handleCopy = async (widget) => {
    if (!widget?.publicKey) return;

    try {
      await navigator.clipboard.writeText(widget.publicKey);

      setCopiedWidgetId(widget._id);

      setTimeout(() => {
        setCopiedWidgetId("");
      }, 2000);
    } catch {
      setError("Unable to copy Public Key. Please copy it manually.");
    }
  };

  // Copy installation script
  const handleCopyScript = async (widget) => {
    if (!widget?.publicKey) return;

    try {
      const script = getInstallationScript(widget.publicKey);

      await navigator.clipboard.writeText(script);

      setCopiedScriptWidgetId(widget._id);

      setTimeout(() => {
        setCopiedScriptWidgetId("");
      }, 2000);
    } catch {
      setError("Unable to copy installation script. Please try again.");
    }
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
            label="Dashboard"
            onClick={() => navigate("/agent/dashboard")}
          />

          <SidebarIcon
            icon={<Users size={21} />}
            label="Visitors"
            onClick={() => navigate("/agent/visitors")}
          />

          <SidebarIcon
            icon={<PanelsTopLeft size={21} />}
            label="Widgets"
            active
          />
        </nav>

        <div className="flex flex-col gap-5">
          <SidebarIcon
            icon={<Settings size={21} />}
            label="Settings"
            onClick={() => navigate("/agent/settings")}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-5 sm:px-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Widget Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage your website chat widgets.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/agent/dashboard")}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
        </header>

        <div className="mx-auto max-w-4xl space-y-6 p-6 sm:p-8">
          {/* Introduction */}
          <section className="rounded-2xl bg-gradient-to-r from-[#6650d9] to-[#8875ed] p-6 text-white shadow-sm sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Globe size={29} />
              </div>

              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Connect Your Website
                </h2>

                <p className="mt-2 text-sm leading-6 text-purple-100">
                  Create a unique BulkChat widget for your website.
                  You will receive a Public Key and installation script
                  after creation.
                </p>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {createdWidget && (
            <section className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={23}
                  className="shrink-0 text-green-600"
                />

                <div>
                  <h2 className="font-bold text-gray-900">
                    Widget Created Successfully!
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your widget "{createdWidget.name}" has been created.
                  </p>
                </div>
              </div>

              {/* Public Key */}
              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Your Public Key
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <code className="min-w-0 flex-1 break-all text-sm text-gray-800">
                    {createdWidget.publicKey}
                  </code>

                  <button
                    type="button"
                    onClick={() => handleCopy(createdWidget)}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-[#6650d9] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#5140b5]"
                  >
                    {copiedWidgetId === createdWidget._id ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}

                    {copiedWidgetId === createdWidget._id
                      ? "Copied"
                      : "Copy"}
                  </button>
                </div>
              </div>

              {/* Installation Script */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Installation Script
                </p>

                <div className="rounded-xl bg-gray-900 p-4">
                  <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs leading-6 text-green-400">
                    {getInstallationScript(createdWidget.publicKey)}
                  </pre>

                  <button
                    type="button"
                    onClick={() => handleCopyScript(createdWidget)}
                    className="mt-4 flex items-center gap-2 rounded-lg bg-[#6650d9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5140b5]"
                  >
                    {copiedScriptWidgetId === createdWidget._id ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}

                    {copiedScriptWidgetId === createdWidget._id
                      ? "Copied"
                      : "Copy Installation Script"}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Add this script before the closing body tag of your
                customer website.
              </p>
            </section>
          )}

          {/* My Widgets */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5 sm:p-6">
              <div>
                <h2 className="font-bold text-gray-900">
                  My Widgets ({widgets.length})
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  All your connected website widgets.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchWidgets}
                disabled={fetchingWidgets}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={fetchingWidgets ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {fetchingWidgets ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <LoaderCircle
                    size={30}
                    className="animate-spin text-[#6650d9]"
                  />

                  <p className="mt-3 text-sm">
                    Loading your widgets...
                  </p>
                </div>
              ) : widgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eeeaff] text-[#6650d9]">
                    <Globe size={26} />
                  </div>

                  <h3 className="mt-4 font-semibold text-gray-800">
                    No widgets found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Create your first website widget below.
                  </p>
                </div>
              ) : (
                widgets.map((widget) => (
                  <div
                    key={widget._id}
                    className="rounded-xl border border-gray-200 p-4 transition hover:border-[#c9c0fa] sm:p-5"
                  >
                    {/* Widget Information */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6650d9]">
                          <Globe size={21} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words font-bold text-gray-900">
                            {widget.name}
                          </h3>

                          <a
                            href={widget.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-1 break-all text-xs text-[#6650d9] hover:underline"
                          >
                            {widget.websiteUrl}
                            <ExternalLink
                              size={12}
                              className="shrink-0"
                            />
                          </a>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          widget.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {widget.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Public Key */}
                    <div className="mt-5 rounded-lg bg-gray-50 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Public Key
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        <code className="min-w-0 flex-1 break-all text-xs text-gray-700">
                          {widget.publicKey}
                        </code>

                        <button
                          type="button"
                          onClick={() => handleCopy(widget)}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#6650d9] shadow-sm transition hover:bg-[#eeeaff]"
                        >
                          {copiedWidgetId === widget._id ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}

                          {copiedWidgetId === widget._id
                            ? "Copied"
                            : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* Allowed Domains */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500">
                        Allowed Domains
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {widget.allowedDomains?.map((domain) => (
                          <span
                            key={domain}
                            className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Installation Script */}
                    <div className="mt-5">
                      <div className="mb-2 flex items-center gap-2">
                        <Code size={15} className="text-[#6650d9]" />

                        <p className="text-xs font-semibold text-gray-500">
                          Installation Script
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-900 p-4">
                        <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs leading-6 text-green-400">
                          {getInstallationScript(widget.publicKey)}
                        </pre>

                        <button
                          type="button"
                          onClick={() => handleCopyScript(widget)}
                          className="mt-3 flex items-center gap-2 rounded-lg bg-[#6650d9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5140b5]"
                        >
                          {copiedScriptWidgetId === widget._id ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}

                          {copiedScriptWidgetId === widget._id
                            ? "Copied"
                            : "Copy Installation Script"}
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-gray-400">
                        Add this script before the closing body tag
                        of your customer website.
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Create Widget Form */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6650d9]">
                <Plus size={22} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Create New Widget
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Enter your website details below.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              {/* Widget Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Widget Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="My Website Chat"
                  maxLength={100}
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6650d9] focus:ring-4 focus:ring-[#6650d9]/10 disabled:bg-gray-50"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Maximum 100 characters.
                </p>
              </div>

              {/* Website URL */}
              <div>
                <label
                  htmlFor="websiteUrl"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Website URL <span className="text-red-500">*</span>
                </label>

                <input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://mywebsite.com"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6650d9] focus:ring-4 focus:ring-[#6650d9]/10 disabled:bg-gray-50"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Enter a valid HTTP or HTTPS website URL.
                </p>
              </div>

              {/* Allowed Domains */}
              <div>
                <label
                  htmlFor="allowedDomains"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Allowed Domains

                  <span className="ml-2 font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <input
                  id="allowedDomains"
                  name="allowedDomains"
                  type="text"
                  value={formData.allowedDomains}
                  onChange={handleChange}
                  placeholder="mywebsite.com, www.mywebsite.com"
                  disabled={loading}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6650d9] focus:ring-4 focus:ring-[#6650d9]/10 disabled:bg-gray-50"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Separate multiple domains with commas. Leave blank
                  to use the website domain automatically.
                </p>
              </div>

              {/* Submit */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-400">
                  Your Public Key will be generated automatically.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6650d9] px-6 text-sm font-semibold text-white transition hover:bg-[#5140b5] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Widget
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

function SidebarIcon({ icon, active = false, onClick, label }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
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

export default AgentWidgetsPage;
