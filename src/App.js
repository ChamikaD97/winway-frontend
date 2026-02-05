import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Layouts & Pages
import DashboardLayout from "./Pages/DashboardLayout";
import FileUploadForm from "./Pages/FileUploadForm";
import ResultsView from "./Pages/ResultsView";
import Login from "./Pages/Auth/Login";
import Loyality from "./Pages/Loyality";
import MonthlyUpgrade from "./Pages/MonthlyUpgrade";
import Settings from "./Pages/Settings";
import LoyaltyCustomers from "./Pages/LoyaltyCustomers";
import LoyaltyHistory from "./Pages/LoyalityHistory";
import LoyaltyEmails from "./Pages/LoyaltyEmails";
import UpgradeHistory from "./Pages/UpgradeHistory";
import Dashboard from "./Pages/DashBoardPage";
// ✅ NEW: Shared Loyalty + SMS Hub
import LoyaltyHub from "./Pages/LoyaltyHub";
import CustomSMS from "./Pages/CustomSMS";
import CustomEmails from "./Pages/CustomEmails";
import LoyalityPromotions from "./Pages/LoyalityPromotions";

function App() {
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  // 🛑 Warn user before closing/refreshing
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // 📩 Handle file upload results
  const handleResults = (data) => {
    setResults(data);
    setActiveTab("2");
  };

  // 🟢 After successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  // 🚪 Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Routes>
      {/* 🔐 Login */}
      <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />

      {/* 🔒 Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <DashboardLayout
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
            >
              {/* 0️⃣ Dashboard */}
              {activeTab === "0" && <Dashboard />}

              {/* 1️⃣ Weekly Purchase */}
              {activeTab === "1" && (
                <FileUploadForm setResults={handleResults} />
              )}

              {/* 2️⃣ Results */}
              {activeTab === "2" && <ResultsView results={results} />}

              {/* 3️⃣ Reports */}

              {/* 4️⃣ Settings */}
              {activeTab === "4" && <Settings />}

              {/* 5️⃣ Loyalty */}
              {activeTab === "5-1" && <Loyality />}
              {activeTab === "5-2" && <LoyaltyCustomers />}
              {activeTab === "5-3" && <MonthlyUpgrade />}
              {activeTab === "5-4" && <LoyaltyHistory />}
              {activeTab === "5-5" && <LoyaltyEmails />}
   {activeTab === "7" && <LoyalityPromotions />}

              {/* ✅ 5-6 SMS + Loyalty Customers (SHARED DATA) */}
              {activeTab === "5-6" && <LoyaltyHub />}

              {activeTab === "6-1" && <CustomSMS />}
              {activeTab === "6-2" && <CustomEmails />}
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Default */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
