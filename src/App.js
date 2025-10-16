import React, { useState, useEffect } from "react";
import DashboardLayout from "./Pages/DashboardLayout";
import FileUploadForm from "./Pages/FileUploadForm";
import ResultsView from "./Pages/ResultsView";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";

function App() {
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleResults = (data) => {
    setResults(data);
    setActiveTab("2");
  };

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return authMode === "login" ? (
      <Login
        onLogin={(mode) =>
          mode === "register" ? setAuthMode("register") : handleLoginSuccess()
        }
      />
    ) : (
      <Register onSwitch={(mode) => setAuthMode(mode)} />
    );
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {activeTab === "1" && <FileUploadForm setResults={handleResults} />}
      {activeTab === "2" && <ResultsView results={results} />}
      {activeTab === "3" && <h2>📊 Reports (Coming soon)</h2>}
      {activeTab === "4" && <h2>⚙️ Settings (Coming soon)</h2>}
    </DashboardLayout>
  );
}

export default App;
