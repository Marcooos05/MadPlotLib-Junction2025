import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import storiesData from '../stories/mocks.json';

const ComicPlayer = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [ended, setEnded] = useState(false);
  const [answersMap, setAnswersMap] = useState({});
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const audioRef = useRef(null);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    // Load session (try localStorage first, fallback to Firestore)
    let onPlay = null;
    let onEnded = null;
    let autoplayTimeout = null;

    const load = async () => {
      let session = JSON.parse(localStorage.getItem('session')) || null;
      if (!session && sessionId) {
        try {
          const snap = await getDoc(doc(db, 'users', 'anonymous', 'sessions', sessionId));
          if (snap.exists()) session = snap.data();
        } catch (err) {
          console.warn('Failed to fetch session from Firestore:', err);
        }
      }

      const selectedStory = storiesData.find(s => s.id === (session && session.storyId));
      setStory(selectedStory);

      // Build answers map: placeholder numbers (1-based) -> answer text
      const answersObj = {};
      if (session && session.answers) {
        Object.keys(session.answers).forEach(k => {
          const idx = parseInt(k, 10);
          if (!isNaN(idx)) answersObj[idx + 1] = session.answers[k];
        });
      }
      setAnswersMap(answersObj);

      if (selectedStory) {
        audioRef.current = new Audio(selectedStory.comic.audio);
        // Ensure audio is on by default (unmuted + full volume)
        audioRef.current.muted = false;
        audioRef.current.volume = 1.0;

        // mark audio started when playback begins; reveal nav only when audio ends
        onPlay = () => setAudioStarted(true);
        onEnded = () => setOverlayVisible(true);

        audioRef.current.addEventListener('play', onPlay);
        audioRef.current.addEventListener('ended', onEnded);

        try {
          await audioRef.current.play();
          setIsAudioPlaying(true);
        } catch (err) {
          // Autoplay blocked; show nav so user can start audio manually
          console.warn('Audio play failed (autoplay blocked?):', err);
          setIsAudioPlaying(false);
          autoplayTimeout = setTimeout(() => setOverlayVisible(true), 250);
        }
      }
    };

    load();

    return () => {
      // cleanup audio listeners and timeout
      if (audioRef.current) {
        if (onPlay) audioRef.current.removeEventListener('play', onPlay);
        if (onEnded) audioRef.current.removeEventListener('ended', onEnded);
      }
      if (autoplayTimeout) clearTimeout(autoplayTimeout);
    };
  }, []);

  useEffect(() => {
    if (!story || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev < story.comic.images.length - 1) {
          return prev + 1;
        } else {
          // Last frame reached: stop auto-advance and mark ended
          setIsPlaying(false);
          setEnded(true);
          // Do NOT auto-navigate. Wait for user action.
          return prev;
        }
      });
    }, 2500); // 2000ms (2s) per frame for testing — switch to 10000 (10s) for production

    return () => clearInterval(interval);
  }, [story, isPlaying]);

  const handleReplay = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
    setEnded(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.warn('Audio replay failed:', err));
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(err => console.warn('Audio play failed:', err));
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      setIsPlaying(false);
    }
  };

  const handlePrevFrame = () => {
    if (!story) return;
    setIsPlaying(false);
    setEnded(false);
    setCurrentFrame(f => Math.max(0, f - 1));
  };

  const handleNextFrame = () => {
    if (!story) return;
    setIsPlaying(false);
    setCurrentFrame(f => {
      const next = Math.min(story.comic.images.length - 1, f + 1);
      if (next === story.comic.images.length - 1) setEnded(true);
      return next;
    });
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e) => {
    if (!touchStartX.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    touchDeltaX.current = dx;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current) return;
    const dx = touchDeltaX.current;
    const threshold = 50; // px
    if (dx > threshold) {
      // swipe right -> previous
      handlePrevFrame();
    } else if (dx < -threshold) {
      // swipe left -> next
      handleNextFrame();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handleFinish = async () => {
    // Update session with comic URLs (mocked) and navigate
    try {
      await updateDoc(doc(db, 'users', 'anonymous', 'sessions', sessionId), {
        comicImages: story.comic.images,
        comicAudio: story.comic.audio
      });
    } catch (err) {
      console.warn('Firestore update failed:', err);
    }
    navigate(`/quiz/${sessionId}`);
  };

  if (!story) return <div>Loading...</div>;

  return (
    <div className="comic-player">
      <div className="comic-card">
        <div className="comic-title">{story.title}</div>

        <div className="comic-frame" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <img src={story.comic.images[currentFrame]} alt={`Frame ${currentFrame + 1}`} />
          {/* Bottom overlay for controls (appears after audio starts) */}
            {/* overlay removed from inside frame — navigation moved below caption for better layout */}
        </div>

        <div className="comic-caption">{fillSentence((story.storySentences && story.storySentences[currentFrame]) || story.shortDescription || story.title, answersMap)}</div>

        {/* Navigation row: placed under captions, visible after audio starts */}
        <div className={`nav-row ${overlayVisible ? 'visible' : 'hidden'}`}>
          <button className="overlay-btn" aria-label="Previous frame" onClick={handlePrevFrame}>‹</button>
          <div className="overlay-gap" />
          <button className="overlay-btn" aria-label="Replay audio" onClick={handleReplay}>⟳</button>
          <div className="overlay-gap" />
          <button className="overlay-btn" aria-label="Next frame" onClick={handleNextFrame}>›</button>
        </div>

        <div className="card-controls">
          <button className="speaker" aria-pressed={isAudioPlaying} onClick={toggleAudio} aria-label="Toggle audio">{isAudioPlaying ? '🔊' : '🔈'}</button>
          <div style={{display: 'flex', gap: 8}}>
            <button className="replay-btn" onClick={handleReplay} aria-label="Replay comic">Replay</button>
            {ended && <button className="next-btn" onClick={handleFinish}>Next</button>}
          </div>
        </div>
        <div className="progress-wrap">
          <div className="progress-bar" style={{width: `${((currentFrame + 1) / (story.comic.images.length)) * 100}%`}} />
        </div>
      </div>
    </div>
  );
};

function fillSentence(template, answersMap) {
  if (!template) return '';
  return template.replace(/\{\{(\d+)\}\}/g, (m, g1) => {
    const num = parseInt(g1, 10);
    // answersMap uses 1-based keys mapping to stored answers (we populated idx+1 earlier)
    const val = answersMap[num];
    return val != null ? String(val) : m;
  });
}

export default ComicPlayer;