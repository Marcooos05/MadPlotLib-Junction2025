import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storiesData from '../stories/mocks.json';

const StoryPicker = () => {
  const [stories, setStories] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

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
    navigate(`/madlib/${storyId}`);
  };

  return (
    <div className="story-picker">
      <h1>Choose Your Story</h1>
      <div className="recommended">
        <h2>Recommended for You</h2>
        <div className="horizontal-scroll">
          {recommended.map(story => (
            <div key={story.id} className="story-card recommended" onClick={() => handleSelect(story.id)}>
              <h3>{story.title}</h3>
              <p>{story.shortDescription}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="tabs">
        {categories.map(cat => (
          <button key={cat} className={selectedCategory === cat ? 'active' : ''} onClick={() => setSelectedCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>
      <div className="horizontal-scroll">
        {filteredStories.map(story => (
          <div key={story.id} className="story-card" onClick={() => handleSelect(story.id)}>
            <h3>{story.title}</h3>
            <p>{story.shortDescription}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryPicker;