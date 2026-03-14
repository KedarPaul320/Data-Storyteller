import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingView from './pages/LandingView';
import DashboardView from './pages/DashboardView';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Page 1: Where users upload their files */}
        <Route path="/" element={<LandingView />} />
        
        {/* Page 2: The dynamic analysis dashboard */}
        <Route path="/dashboard" element={<DashboardView />} />
      </Routes>
    </Router>
  );
}