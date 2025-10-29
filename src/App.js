import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Layouts & Pages
import DashboardLayout from "./Pages/DashboardLayout";
import FileUploadForm from "./Pages/FileUploadForm";
import ResultsView from "./Pages/ResultsView";
import Login from "./Pages/Auth/Login";
import ReconciliationReport from "./Pages/ReconciliationReport";
import DailyActivations from "./Pages/DailyActivations";
import LastPurchaseTimes from "./Pages/LastPurchaseTimes";
import Loyality from "./Pages/Loyality";
import Settings from "./Pages/Settings";

function App() {
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  // 🧠 Check token validity on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    try {
      const decoded = jwtDecode(token);
      
      if (decoded.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
      }
    } catch {
    }
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
    setIsAuthenticated(false);
    navigate("/login");
  };

  // ============ ROUTES ============
  return (
    <Routes>
      {/* Login Page */}
      <Route
        path="/login"
        element={<Login onLogin={() => handleLoginSuccess()} />}
      />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <DashboardLayout
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
            >
              {/* 1️⃣ Upload & Generate */}
              {activeTab === "1" && (
                <FileUploadForm setResults={handleResults} />
              )}

              {/* 2️⃣ Results & Rankings */}
              {activeTab === "2" && <ResultsView results={results} />}

              {/* 3️⃣ Reports Overview */}
              {activeTab === "3" && (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <h2>📊 Reports Overview</h2>
                  <p>View analytics summaries, trends, and insights.</p>
                </div>
              )}
              {activeTab === "3-1" && <ReconciliationReport />}
              {activeTab === "3-2" && <DailyActivations />}
              {activeTab === "3-3" && <LastPurchaseTimes />}

              {/* 4️⃣ Settings */}
              {activeTab === "4" && (
                <Settings/>
              )}

              {/* 5️⃣ Loyalty */}
              {activeTab === "5-1" && <Loyality />}
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Default Route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
