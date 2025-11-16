import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storiesData from '../stories/mocks.json';
import { useRef } from 'react';

const StoryPicker = () => {
  const [stories, setStories] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const navigate = useNavigate();
  const recommendedRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    const allStories = storiesData;
    setStories(allStories);

    // Simple recommendation logic
    const rec = allStories.filter(story => {
      try {
        const condition = story.recommendedIf.replace(/gender|confidence|familyTalk/g, match => `'${profile[match]}'`);
        return eval(condition);
      } catch {
        return false;
      }
    });
    setRecommended(rec.length > 0 ? rec : [allStories[0]]);
  }, []);

  const filteredStories = selectedCategory === 'All' ? stories : stories.filter(s => s.category === selectedCategory);
  const categories = ['All', ...new Set(stories.map(s => s.category))];

  const handleSelect = (storyId) => {
    // select the card first; user must press Start to begin
    setSelectedStoryId(storyId === selectedStoryId ? null : storyId);
  };

  const handleStart = (storyId) => {
    navigate(`/madlib/${storyId}`);
  };

  const emojiForCategory = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'debt': return '💳';
      case 'budgeting': return '💰';
      case 'scams': return '⚠️';
      default: return '📘';
    }
  };

  const shortTitle = (t) => {
    if (!t) return '';
    const words = t.split(' ');
    if (words.length <= 3) return t;
    return words.slice(0, 3).join(' ') + '...';
  };

  const engagingDescription = (story) => {
    const base = story.shortDescription || '';
    const extras = {
      Debt: 'Make choices about borrowing, compare costs, and see how interest changes what you pay.',
      Budgeting: 'Split your first paycheck, try simple budgeting, and reach your goals faster.',
      Scams: 'Spot red flags, protect your accounts, and learn who to trust when it feels urgent.'
    };
    return `${base} ${extras[story.category] || ''}`.trim();
  };

  const scroll = (ref, direction = 'right') => {
    if (!ref || !ref.current) return;
    const el = ref.current;
    const amount = el.clientWidth * 0.6; // scroll by most of the viewport
    el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="story-picker">
      <h1>Choose Your Story</h1>
      <div className="recommended">
        <h2>Recommended for You</h2>
        <div className="carousel-container">
          <button className="arrow left" onClick={() => scroll(recommendedRef, 'left')}>‹</button>
          <div className="horizontal-scroll" ref={recommendedRef}>
            {recommended.map(story => (
              <div key={story.id} className={`story-card recommended ${selectedStoryId === story.id ? 'active' : ''}`} onClick={() => handleSelect(story.id)}>
                <div className="card-top">
                  <div className="thumb">
                    {story.thumb ? story.thumb : emojiForCategory(story.category)}
                  </div>
                  <div className={`badge ${story.category.toLowerCase()}`}>{story.badge || story.category}</div>
                </div>
                <h3>{shortTitle(story.title)}</h3>
                <p>{engagingDescription(story)}</p>
                <div className="card-footer">
                  {selectedStoryId === story.id ? (
                    <button className="cta" onClick={() => handleStart(story.id)}>Start</button>
                  ) : (
                    <button className="select" onClick={() => handleSelect(story.id)}>Select</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="arrow right" onClick={() => scroll(recommendedRef, 'right')}>›</button>
        </div>
      </div>
      <div className="tabs">
        {categories.map(cat => (
          <button key={cat} className={selectedCategory === cat ? 'active' : ''} onClick={() => setSelectedCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>
      <div className="carousel-container">
        <button className="arrow left" onClick={() => scroll(listRef, 'left')}>‹</button>
        <div className="horizontal-scroll" ref={listRef}>
          {filteredStories.map(story => (
            <div key={story.id} className={`story-card ${selectedStoryId === story.id ? 'active' : ''}`} onClick={() => handleSelect(story.id)}>
              <div className="card-top">
                <div className="thumb">{story.thumb ? story.thumb : emojiForCategory(story.category)}</div>
                <div className={`badge ${story.category.toLowerCase()}`}>{story.badge || story.category}</div>
              </div>
              <h3>{shortTitle(story.title)}</h3>
              <p>{engagingDescription(story)}</p>
              <div className="card-footer">
                {selectedStoryId === story.id ? (
                  <button className="cta" onClick={() => handleStart(story.id)}>Start</button>
                ) : (
                  <button className="select" onClick={() => handleSelect(story.id)}>Select</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="arrow right" onClick={() => scroll(listRef, 'right')}>›</button>
      </div>
    </div>
  );
};

export default StoryPicker;