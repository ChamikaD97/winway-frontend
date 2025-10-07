import React, { useState } from "react";
import FileUploadForm from "./components/FileUploadForm";
import ResultsView from "./components/ResultsView";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("1"); // default: Upload

  // When results are generated, switch to Results tab
  const handleResults = (data) => {
    setResults(data);
    setActiveTab("2"); // go to Results tab
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "1" && <FileUploadForm setResults={handleResults} />}
      {activeTab === "2" && <ResultsView results={results} />}
      {activeTab === "3" && <h2>📊 Reports (Coming soon)</h2>}
      {activeTab === "4" && <h2>⚙️ Settings (Coming soon)</h2>}
    </DashboardLayout>
  );
}

export default App;
