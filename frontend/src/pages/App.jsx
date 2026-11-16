
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";

import SupportPage from "./support/SupportPage";
import EmbeddedChatPage from "./support/EmbeddedChatPage";

import AgentDashboardPage from "./agent/AgentDashboardPage";
import AgentVisitorsPage from "./agent/AgentVisitorsPage";
import AgentSettingsPage from "./agent/AgentSettingsPage";
import AgentWidgetsPage from "./agent/AgentWidgetsPage";
import AgentInboxPage from "./agent/AgentInboxPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/support" replace />} />

        {/* Agent authentication */}
        <Route path="/agent/login" element={<LoginPage />} />
        <Route path="/agent/register" element={<RegisterPage />} />

        {/* Old auth URLs */}
        <Route path="/login" element={<Navigate to="/agent/login" replace />} />
        <Route path="/register" element={<Navigate to="/agent/register" replace />} />

        {/* Customer support */}
        <Route path="/support" element={<SupportPage />} />
        <Route path="/embed/chat" element={<EmbeddedChatPage />} />

        {/* Agent workspace */}
        <Route path="/agent/dashboard" element={<AgentDashboardPage />} />
        <Route path="/agent/visitors" element={<AgentVisitorsPage />} />
        <Route path="/agent/widgets" element={<AgentWidgetsPage />} />
        <Route path="/agent/inbox" element={<AgentInboxPage />} />
        <Route path="/agent/settings" element={<AgentSettingsPage />} />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/support" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
