import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import storiesData from '../stories/mocks.json';

// Small helper for category emoji fallback
const emojiForCategory = (cat) => {
  switch ((cat || '').toLowerCase()) {
    case 'debt': return '💳';
    case 'budgeting': return '💰';
    case 'scams': return '⚠️';
    default: return '📘';
  }
};

const MadLib = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentBlank, setCurrentBlank] = useState(0);

  useEffect(() => {
    const selectedStory = storiesData.find(s => s.id === storyId);
    setStory(selectedStory);
  }, [storyId]);

  if (!story) return <div>Loading...</div>;

  const handleChange = (e) => {
    setAnswers({ ...answers, [currentBlank]: e.target.value });
  };

  const handleNext = () => {
    if (currentBlank < story.blanks.length - 1) {
      setCurrentBlank(currentBlank + 1);
    } else {
      // Save answers
      const sessionId = Date.now().toString();
      const sessionData = {
        storyId,
        answers,
        createdAt: new Date()
      };
      localStorage.setItem('session', JSON.stringify(sessionData));
      // Save to Firestore (best-effort)
      try {
        setDoc(doc(db, 'users', 'anonymous', 'sessions', sessionId), sessionData);
      } catch (err) {
        console.warn('Firestore save failed:', err);
      }
      navigate(`/comic/${sessionId}`);
    }
  };

  const blank = story.blanks[currentBlank];

  return (
    <div className="madlib">
      <div className="madlib-container">
        <div className="progress">Blank {currentBlank + 1} of {story.blanks.length}</div>
        <div className="madlib-header">
          <div className="madlib-thumb">{story.thumb ? story.thumb : emojiForCategory(story.category)}</div>
          <h2 className="madlib-title">{story.title}</h2>
        </div>

        <div className="blank-input">
          <label className="input-label">{blank.prompt}</label>
          <input
            className="text-input"
            type="text"
            value={answers[currentBlank] || ''}
            onChange={handleChange}
            placeholder="Type your answer..."
          />
        </div>

        <div className="madlib-actions">
          <button className="cta" onClick={handleNext}>
            {currentBlank < story.blanks.length - 1 ? 'Next' : 'Generate Comic'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MadLib;