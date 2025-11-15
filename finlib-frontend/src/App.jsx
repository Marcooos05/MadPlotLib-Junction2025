import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import StoryPicker from './components/StoryPicker';
import MadLib from './components/MadLib';
import Stories from './components/Stories';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/stories" element={<StoryPicker />} />
        <Route path="/madlib/:storyId" element={<MadLib />} />
        <Route path="/comic/:sessionId" element={<div>Comic View - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;