import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import storiesData from '../stories/mocks.json';

const Victory = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [story, setStory] = useState(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [badgeImg, setBadgeImg] = useState(null);

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
        setFrameIndex(0);
        // attempt to find a badge image in public/badges by common extensions
        const candidates = [`/badges/${selectedStory.id}.png`, `/badges/${selectedStory.id}.svg`, `/badges/${selectedStory.id}.jpg`, `/badges/${selectedStory.id}.jpeg`];
        let found = null;
        await Promise.all(candidates.map(p => new Promise(res => {
          const img = new Image();
          img.onload = () => { if (!found) found = p; res(); };
          img.onerror = () => res();
          img.src = p;
        })));
        if (found) setBadgeImg(found);
        // Update badge in Firestore
        if (sessionId) {
          const sessRef = doc(db, 'users', 'anonymous', 'sessions', sessionId);
          await updateDoc(sessRef, { badge: selectedStory.badge });
        }
      }
    };
    loadData();
  }, [sessionId]);

  const handleShare = async () => {
    const shareData = {
      title: 'MadLib Financial Literacy',
      text: `I just completed a financial literacy story: ${story?.title} and earned the ${story?.badge} badge! Check it out:`,
      url: window.location.origin + `/victory/${sessionId}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert('Link copied to clipboard!');
    }
  };

  if (!story) return <div>Loading...</div>;

  const totalFrames = story.comic?.images?.length || 0;
  const prevFrame = () => setFrameIndex(i => Math.max(0, i - 1));
  const nextFrame = () => setFrameIndex(i => Math.min(totalFrames - 1, i + 1));

  function fillSentence(template) {
    if (!template) return '';
    // Build answers map from session (same mapping as elsewhere)
    const answersObj = {};
    if (session && session.answers) {
      Object.keys(session.answers).forEach(k => {
        const idx = parseInt(k, 10);
        if (!isNaN(idx)) answersObj[idx + 1] = session.answers[k];
      });
    }
    return String(template).replace(/\{\{(\d+)\}\}/g, (m, g1) => {
      const num = parseInt(g1, 10);
      const val = answersObj[num];
      return val != null ? String(val) : m;
    });
  }

  return (
    <div className="victory">
      <div className="victory-container">
        <div className="victory-grid">
          <div className="victory-main">
            <h1 className="victory-title">🎉 Victory! 🎉</h1>

            <div className="lessons">
              <h4>Lessons Learned:</h4>
              <ul>
                {story.lessons.map((lesson, index) => (
                  <li key={index}>{lesson}</li>
                ))}
              </ul>
            </div>

            <div className="stitched-comic">
              <h4>Your Comic Story:</h4>
              <div className="comic-player-mini">
                <div className="comic-frame mini">
                  <img src={story.comic.images[frameIndex]} alt={`Frame ${frameIndex + 1}`} />
                </div>
                <div className="comic-caption">{fillSentence((story.storySentences && story.storySentences[frameIndex]) || story.shortDescription)}</div>
                <div className="nav-row visible" style={{marginTop: 8}}>
                  <button className="overlay-btn" aria-label="Previous frame" onClick={prevFrame}>‹</button>
                  <div className="overlay-gap" />
                  <button className="overlay-btn" aria-label="Next frame" onClick={nextFrame}>›</button>
                </div>

                <div className="progress-mini" aria-hidden="true" style={{marginTop: 12}}>
                  <div className="progress-bar" style={{width: `${totalFrames ? ((frameIndex + 1) / totalFrames) * 100 : 0}%`}} />
                </div>
              </div>
            </div>

            <div className="share-wrap">
              <button className="share-btn" onClick={handleShare}>Share My Victory! 📤</button>
            </div>
          </div>

          <aside className="victory-side">
            <div className="badge-hero">
              {badgeImg ? (
                <img src={badgeImg} alt={story.badge} className="badge-image" />
              ) : (
                <>
                  <span className="badge-emoji">🏆</span>
                  <h3>{story.badge}</h3>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Victory;
