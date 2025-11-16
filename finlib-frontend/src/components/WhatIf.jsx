import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import storiesData from '../stories/mocks.json';

const WhatIf = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [story, setStory] = useState(null);
  const [answersMap, setAnswersMap] = useState({});
  const [revealed, setRevealed] = useState([false, false, false]);

  useEffect(() => {
    const loadData = async () => {
      let sess = JSON.parse(localStorage.getItem('session'));
      if (!sess && sessionId) {
        const docRef = doc(db, 'users', 'anonymous', 'sessions', sessionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          sess = docSnap.data();
        }
      }
      setSession(sess);
      if (sess) {
        const selectedStory = storiesData.find(s => s.id === sess.storyId);
        setStory(selectedStory);
        const answersObj = {};
        if (sess.answers) {
          Object.keys(sess.answers).forEach(k => {
            const idx = parseInt(k, 10);
            if (!isNaN(idx)) answersObj[idx + 1] = sess.answers[k];
          });
        }
        setAnswersMap(answersObj);
      }
    };
    loadData();
  }, [sessionId]);

  const fillSentence = (template) => {
    if (!template) return '';
    return String(template).replace(/\{\{(\d+)\}\}/g, (m, g1) => {
      const num = parseInt(g1, 10);
      const val = answersMap[num];
      return val != null ? String(val) : m;
    });
  };

  const handleReveal = (index) => {
    const newRevealed = [...revealed];
    newRevealed[index] = !newRevealed[index];
    setRevealed(newRevealed);
  };

  const handleExplore = () => {
    navigate(`/victory/${sessionId}`);
  };

  if (!story) return <div>Loading...</div>;

  return (
    <div className="whatif">
      <div className="whatif-container">
        <h2>What If? 🤔</h2>
        <p>Explore alternate endings to see how small changes could make a big difference!</p>
        <div className="whatif-cards">
          {story.whatIfs.map((whatIf, index) => (
            <div key={index} className="whatif-card" onClick={() => handleReveal(index)}>
              <h3>{whatIf.title}</h3>
              {revealed[index] && (
                <div className="whatif-reveal">
                  <p className="alternate-ending">{fillSentence(whatIf.modifiedSentence5)}</p>
                  <p className="explanation">{whatIf.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="cta" onClick={handleExplore}>See My Victory! 🏆</button>
      </div>
    </div>
  );
};

export default WhatIf;