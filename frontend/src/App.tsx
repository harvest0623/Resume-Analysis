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
        <Route path="/home/analyze" element={<Analyze />} />
        <Route path="/home/compare" element={<Compare />} />
        <Route path="/home/history" element={<History />} />
        <Route path="/home/match" element={<Match />} />
        <Route path="/home/stats" element={<Stats />} />
        <Route path="/home/batch" element={<Batch />} />
        <Route path="/home/optimize" element={<Optimize />} />
        <Route path="/home/jobs" element={<Jobs />} />
        <Route path="/home/talent" element={<Talent />} />
        <Route path="/home/interview" element={<Interview />} />
        <Route path="/home/templates" element={<Templates />} />
        <Route path="/home/generate" element={<Generate />} />
        <Route path="/home/editor" element={<Editor />} />
        <Route path="/home/pipeline" element={<Pipeline />} />
        <Route path="/home/export" element={<Export />} />
        <Route path="/home/settings" element={<Settings />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}
