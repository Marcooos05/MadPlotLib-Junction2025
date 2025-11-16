import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import StoryPicker from './components/StoryPicker';
import MadLib from './components/MadLib';
import ComicPlayer from './components/ComicPlayer';
import Quiz from './components/Quiz';
import Stories from './components/Stories';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/stories" element={<StoryPicker />} />
        <Route path="/madlib/:storyId" element={<MadLib />} />
        <Route path="/comic/:sessionId" element={<ComicPlayer />} />
        <Route path="/quiz/:sessionId" element={<Quiz />} />
      </Routes>
    </Router>
  );
}

export default App;