import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import storiesData from '../stories/mocks.json';

const WhatIf = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [story, setStory] = useState(null);
  const [answersMap, setAnswersMap] = useState({});
  const [activeIndex, setActiveIndex] = useState(null);

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
    setActiveIndex(index);
  };

  const closeModal = () => setActiveIndex(null);

  const handleExplore = () => {
    navigate(`/victory/${sessionId}`);
  };

  if (!story) return <div>Loading...</div>;
  const activeWhatIf = (activeIndex != null && story) ? story.whatIfs[activeIndex] : null;
  const modalImg = activeWhatIf ? (activeWhatIf.image || (story?.comic?.images || [])[Math.min(activeIndex + 1, Math.max(0, (story?.comic?.images||[]).length - 1))] || (story?.comic?.images || [])[0]) : null;

  return (
    <div className="whatif">
      <div className="whatif-container">
        <h2>What If? 🤔</h2>
        <p>Explore alternate endings to see how small changes could make a big difference!</p>
        <div className="whatif-cards">
          {story.whatIfs.map((whatIf, index) => {
            const frames = story?.comic?.images || [];
            const thumb = whatIf.thumbImage || frames[index] || frames[0] || `https://via.placeholder.com/600x360?text=${encodeURIComponent(whatIf.title)}`;
            return (
              <div
                key={index}
                className="whatif-card simple"
                onClick={() => handleReveal(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleReveal(index); }}
              >
                  <div className="whatif-card-row">
                    <div className="whatif-meta full">
                      <h3>{whatIf.title}</h3>
                    </div>
                  </div>
              </div>
            );
          })}

        </div>

        {/* Modal for large preview */}
        {activeWhatIf && (
          <div className="whatif-modal" role="dialog" aria-modal="true">
            <div className="whatif-modal-backdrop" onClick={closeModal} />
            <div className="whatif-modal-content" aria-labelledby={`whatif-title-${activeIndex}`}>
              <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
              <h3 id={`whatif-title-${activeIndex}`}>{activeWhatIf.title}</h3>
              <img src={modalImg || ('https://via.placeholder.com/900x540?text=' + encodeURIComponent(activeWhatIf.title))} alt={activeWhatIf.title} className="modal-image" />
              <div className="whatif-modal-text">
                <p className="alternate-ending">{fillSentence(activeWhatIf.modifiedSentence5)}</p>
                <p className="explanation">{activeWhatIf.explanation}</p>
              </div>
            </div>
          </div>
        )}
        <div className="whatif-actions">
          <button className="cta" onClick={handleExplore}>See My Victory! 🏆</button>
        </div>
      </div>
    </div>
  );
};

export default WhatIf;