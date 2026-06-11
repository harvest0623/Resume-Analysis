import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import Analyze from "@/pages/Analyze";
import Compare from "@/pages/Compare";
import History from "@/pages/History";
import Match from "@/pages/Match";
import Stats from "@/pages/Stats";
import Batch from "@/pages/Batch";
import Optimize from "@/pages/Optimize";
import Jobs from "@/pages/Jobs";
import Talent from "@/pages/Talent";
import Interview from "@/pages/Interview";
import Templates from "@/pages/Templates";
import Generate from "@/pages/Generate";
import Editor from "@/pages/Editor";
import Pipeline from "@/pages/Pipeline";
import Export from "@/pages/Export";
import Settings from "@/pages/Settings";
import ScrollToTop from "@/components/ScrollToTop";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/history" element={<History />} />
        <Route path="/match" element={<Match />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/batch" element={<Batch />} />
        <Route path="/optimize" element={<Optimize />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/talent" element={<Talent />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/export" element={<Export />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}
