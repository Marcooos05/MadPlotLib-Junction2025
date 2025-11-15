import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

const Onboarding = () => {
  const [profile, setProfile] = useState({
    name: '',
    gender: '',
    confidence: '',
    familyTalk: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Animate inputs
    const inputs = document.querySelectorAll('.onboarding input, .onboarding select');
    inputs.forEach((input, index) => {
      setTimeout(() => {
        input.style.opacity = '1';
      }, index * 200);
    });
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (error) {
      console.error('Error saving profile:', error);
      localStorage.setItem('profile', JSON.stringify(profile));
    }
    navigate('/stories');
  };

  return (
    <div className="onboarding">
      <div className="background"></div>
      <h1>Welcome to MadLib Financial Literacy!</h1>
      <p>Let's get to know you to personalize your experience.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={profile.name}
          onChange={handleChange}
          required
        />
        <select name="gender" value={profile.gender} onChange={handleChange} required>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          type="number"
          name="confidence"
          placeholder="Confidence in digital payments (1-5)"
          min="1"
          max="5"
          value={profile.confidence}
          onChange={handleChange}
          required
        />
        <select name="familyTalk" value={profile.familyTalk} onChange={handleChange} required>
          <option value="">How often does your family talk about money?</option>
          <option value="never">Never</option>
          <option value="rarely">Rarely</option>
          <option value="sometimes">Sometimes</option>
          <option value="often">Often</option>
        </select>
        <button type="submit">Start My Journey</button>
      </form>
    </div>
  );
};

export default Onboarding;