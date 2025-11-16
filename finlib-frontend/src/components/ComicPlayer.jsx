import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import storiesData from '../stories/mocks.json';

const ComicPlayer = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Load session (mocked from localStorage)
    const session = JSON.parse(localStorage.getItem('session')) || {};
    const selectedStory = storiesData.find(s => s.id === session.storyId);
    setStory(selectedStory);

    if (selectedStory) {
      // Play audio
      audioRef.current = new Audio(selectedStory.comic.audio);
      audioRef.current.play().catch(err => console.warn('Audio play failed:', err));
    }
  }, []);

  useEffect(() => {
    if (!story || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev < story.comic.images.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          // Update session with comic URLs (mocked)
          updateDoc(doc(db, 'users', 'anonymous', 'sessions', sessionId), {
            comicImages: story.comic.images,
            comicAudio: story.comic.audio
          }).catch(err => console.warn('Firestore update failed:', err));
          navigate(`/quiz/${sessionId}`);
          return prev;
        }
      });
    }, 2500); // 2.5s per frame

    return () => clearInterval(interval);
  }, [story, isPlaying, sessionId, navigate]);

  const handleReplay = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.warn('Audio replay failed:', err));
    }
  };

  if (!story) return <div>Loading...</div>;

  return (
    <div className="comic-player">
      <div className="comic-frame">
        <img src={story.comic.images[currentFrame]} alt={`Frame ${currentFrame + 1}`} />
      </div>
      <div className="speaker">🔊</div>
      <button className="replay-btn" onClick={handleReplay}>Replay</button>
    </div>
  );
};

export default ComicPlayer;