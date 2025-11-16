import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import SelectionCards from './SelectionCards';
import ConfidenceSlider from './ConfidenceSlider';

const Onboarding = () => {
  const [profile, setProfile] = useState({
    name: '',
    gender: '',
    confidence: '3',
    familyTalk: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Animate cards
    const cards = document.querySelectorAll('.selection-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
      }, index * 200);
    });
  }, []);

  const handleChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.name || !profile.gender || !profile.familyTalk) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await signInAnonymously(auth);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid, 'profile', 'profile'), {
          ...profile,
          createdAt: new Date()
        });
        localStorage.setItem('profile', JSON.stringify(profile));
      }
      navigate('/stories');
    } catch (error) {
      console.error('Error saving profile:', error);
      localStorage.setItem('profile', JSON.stringify(profile));
      navigate('/stories');
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: 'male', label: 'Male ♂️' },
    { value: 'female', label: 'Female ♀️' },
    { value: 'other', label: 'Other 🌈' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say 🤷' }
  ];

  const familyTalkOptions = [
    { value: 'never', label: 'Never 🚫' },
    { value: 'rarely', label: 'Rarely 🤏' },
    { value: 'sometimes', label: 'Sometimes 🤔' },
    { value: 'often', label: 'Often 💬' }
  ];

  return (
    <div className="onboarding">
      <div className="background"></div>
      <h1>Welcome to MadLib</h1>
      <h2>Money Made Fun! 💸</h2>
      <p>Tell us about yourself to make this experience just for you 🎉</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="What's your name? 😊"
          value={profile.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
        <SelectionCards
          label="How do you identify? ✨"
          options={genderOptions}
          selected={profile.gender}
          onSelect={(value) => handleChange('gender', value)}
        />
        <ConfidenceSlider
          value={profile.confidence}
          onChange={(value) => handleChange('confidence', value)}
        />
        <SelectionCards
          label="How often do people at home talk about money? 💬"
          options={familyTalkOptions}
          selected={profile.familyTalk}
          onSelect={(value) => handleChange('familyTalk', value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Starting...' : 'Start My Journey'}
        </button>
      </form>
    </div>
  );
};

export default Onboarding;