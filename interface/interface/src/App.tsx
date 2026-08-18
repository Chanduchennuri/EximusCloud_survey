import { BrowserRouter, Routes, Route } from "react-router-dom";
import ModeSelection from "./pages/ModeSelection";
import GenericForm from "./pages/GenericForm";
import DeepAnalysisChat from "./pages/DeepAnalysis";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ModeSelection />} />
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