import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import Stories from './components/Stories';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OnboardingView />} />
        <Route path="/stories" element={<Stories />} />
      </Routes>
    </Router>
  );
}

export default App;