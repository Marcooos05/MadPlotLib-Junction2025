import React, { useState, useEffect, useRef } from 'react';
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
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    const selectedStory = storiesData.find(s => s.id === storyId);
    setStory(selectedStory);
  }, [storyId]);

  if (!story) return <div>Loading...</div>;

  const handleChange = (index) => (e) => {
    setAnswers({ ...answers, [index]: e.target.value });
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < story.blanks.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleSubmit = () => {
    const allFilled = story.blanks.every((_, index) => answers[index] && answers[index].trim() !== '');
    if (!allFilled) {
      setError('Please fill in all blanks before generating the comic.');
      return;
    }
    setError('');
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
  };

  return (
    <div className="madlib">
      <div className="madlib-container">
        <div className="madlib-header">
          <div className="madlib-thumb">{story.thumb ? story.thumb : emojiForCategory(story.category)}</div>
          <h2 className="madlib-title">{story.title}</h2>
        </div>

        {story.blanks.map((blank, index) => (
          <div key={index} className="blank-input">
            <label className="input-label">{blank.prompt}</label>
            <input
              ref={(el) => inputRefs.current[index] = el}
              className="text-input"
              type="text"
              value={answers[index] || ''}
              onChange={handleChange(index)}
              onKeyDown={handleKeyDown(index)}
              placeholder="Type your answer..."
            />
          </div>
        ))}

        {error && <div className="error">{error}</div>}

        <div className="madlib-actions">
          <button className="cta" onClick={handleSubmit}>
            Generate Comic
          </button>
        </div>
      </div>
    </div>
  );
};

export default MadLib;