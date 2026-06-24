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
import LoyaltyEmails from "./Pages/LoyaltyEmails";
import Dashboard from "./Pages/DashBoardPage";
import CustomSMS from "./Pages/CustomSMS";
import CustomEmails from "./Pages/CustomEmails";
import LoyalityPromotions from "./Pages/LoyalityPromotions";
import MonthlyUpgradesTable from "./Pages/MonthlyUpgradesTable";
import FileManager from "./Pages/FileManager.js";
import WeeklyImagesManager from "./Pages/WeeklyImagesManager.js";
import RegistrationCountPage from "./Pages/RegistrationCountPage.js";
import DailySalesSummery from "./Pages/DailySalesSummery.js";
import SmsWelcome from "./SMS/SmsWelcome.js";
import ReconciliationSummary from "./Pages/DailyLastSoldTime.js";
import DailyFullSummary from "./Pages/DailyFullSummary.js";
import SuperAdminUsersPage from "./Pages/Auth/SuperAdminUsersPage.js";
import ChangePassword from "./Pages/Auth/ChangePassword";
function App() {
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("0");
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );

  const navigate = useNavigate();

  const isLoggedIn = isAuthenticated || !!localStorage.getItem("token");

  // Check auth when app loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (token) {
      setIsAuthenticated(true);
    } else {
      navigate("/login");
      setIsAuthenticated(false);
    }
  }, []);

  // Warn user before closing/refreshing
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleResults = (data) => {
    setResults(data);
    setActiveTab("2");
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab("0");
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setActiveTab("0");
    setResults(null);
    navigate("/login");
  };

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLoginSuccess} />
          )
        }
      />

      <Route path="/sms/welcome" element={<SmsWelcome />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <DashboardLayout
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
            >
              {activeTab === "0" && <Dashboard />}

              {activeTab === "1" && (
                <FileUploadForm setResults={handleResults} />
              )}

              {activeTab === "2" && <ResultsView results={results} />}

              {activeTab === "4" && <Settings />}

              {activeTab === "5-1" && <Loyality />}
              {activeTab === "5-2" && <LoyaltyCustomers />}
              {activeTab === "5-3" && <MonthlyUpgrade />}
              {activeTab === "5-4" && <LoyalityPromotions />}
              {activeTab === "5-5" && <LoyaltyEmails />}
              {activeTab === "5-7" && <MonthlyUpgradesTable />}

              {activeTab === "6-1" && <CustomSMS />}
              {activeTab === "6-2" && <CustomEmails />}

              {activeTab === "7" && <FileManager />}
              {activeTab === "8" && <WeeklyImagesManager />}

              {activeTab === "9-1" && <RegistrationCountPage />}
              {activeTab === "9-2" && <DailySalesSummery />}
              {activeTab === "9-3" && <ReconciliationSummary />}
              {activeTab === "9-4" && <DailyFullSummary />}

              {activeTab === "11" && <SuperAdminUsersPage />}
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/change-password" element={<ChangePassword />} />
      {/* Default */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
