import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import storiesData from '../stories/mocks.json';

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
      // Save to Firestore
      setDoc(doc(db, 'users', 'anonymous', 'sessions', sessionId), sessionData);
      navigate(`/comic/${sessionId}`);
    }
  };

  const blank = story.blanks[currentBlank];

  return (
    <div className="madlib">
      <div className="progress">Blank {currentBlank + 1} of {story.blanks.length}</div>
      <h2>{story.title}</h2>
      <div className="blank-input">
        <label>{blank.prompt}</label>
        <input
          type="text"
          value={answers[currentBlank] || ''}
          onChange={handleChange}
          placeholder="Type your answer..."
        />
      </div>
      <button onClick={handleNext}>
        {currentBlank < story.blanks.length - 1 ? 'Next' : 'Generate Comic'}
      </button>
    </div>
  );
};

export default MadLib;