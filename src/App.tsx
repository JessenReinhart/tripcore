import { Routes, Route, useParams } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TripPage from "./pages/TripPage";
import ErrorBoundary from "./components/ErrorBoundary";

function TripPageWrapper() {
  const { tripId } = useParams<{ tripId: string }>();
  return <TripPage key={tripId} />;
}

export default function App() {
  return (
    <div className="min-h-screen selection:bg-pastel-pink/30 flex flex-col items-center">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trip/:tripId" element={<TripPageWrapper />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}
