import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Analyze from "@/pages/Analyze";
import Compare from "@/pages/Compare";
import History from "@/pages/History";
import Match from "@/pages/Match";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/home/analyze" element={<Analyze />} />
        <Route path="/home/compare" element={<Compare />} />
        <Route path="/home/history" element={<History />} />
        <Route path="/home/match" element={<Match />} />
      </Routes>
    </Router>
  );
}
