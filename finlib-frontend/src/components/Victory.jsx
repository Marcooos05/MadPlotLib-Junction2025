import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import storiesData from '../stories/mocks.json';

const Victory = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [story, setStory] = useState(null);

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

  return (
    <div className="victory">
      <div className="victory-container">
        <div className="badge-hero">
          <h2>Victory! 🎉</h2>
          <div className="badge">
            <span className="badge-emoji">🏆</span>
            <h3>{story.badge}</h3>
          </div>
        </div>
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
          {story.comic.images.map((img, index) => (
            <img key={index} src={img} alt={`Frame ${index + 1}`} className="comic-frame" />
          ))}
        </div>
        <button className="share-btn" onClick={handleShare}>Share My Victory! 📤</button>
      </div>
    </div>
  );
};

export default Victory;