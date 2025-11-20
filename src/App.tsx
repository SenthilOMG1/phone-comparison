import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/navigation';
import { Home } from './pages/Home';
import { Compare } from './pages/Compare';
import { Admin } from './pages/Admin';
import { Dashboard } from './pages/Dashboard';
import { MarketIntelligence } from './pages/MarketIntelligence';
import { Promotions } from './pages/Promotions';
import { Analytics } from './pages/Analytics';
import { AIAssistant } from './pages/AIAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/market" element={<MarketIntelligence />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
