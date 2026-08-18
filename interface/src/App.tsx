import { BrowserRouter, Routes, Route } from "react-router-dom";
import ModeSelection from "./pages/ModeSelection";
import GenericForm from "./pages/GenericForm";
import DeepAnalysisChat from "./pages/DeepAnalysis";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ModeSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/session/:sessionId/generic" element={<GenericForm />} />
        <Route
          path="/session/:sessionId/deep-analysis"
          element={<DeepAnalysisChat />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;