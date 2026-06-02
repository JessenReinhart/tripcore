import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TripPage from "./pages/TripPage";

export default function App() {
  return (
    <div className="min-h-screen selection:bg-pastel-pink/30 flex flex-col items-center">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/trip/:tripId" element={<TripPage />} />
      </Routes>
    </div>
  );
}
