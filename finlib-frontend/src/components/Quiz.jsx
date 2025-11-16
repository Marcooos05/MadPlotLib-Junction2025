import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import Confetti from 'react-confetti';
import storiesData from '../stories/mocks.json';

const Quiz = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answersMap, setAnswersMap] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Load session and build answers map for placeholder replacement
    const session = JSON.parse(localStorage.getItem('session')) || {};
    const selectedStory = storiesData.find(s => s.id === session.storyId);
    setStory(selectedStory);
    const answersObj = {};
    if (session && session.answers) {
      Object.keys(session.answers).forEach(k => {
        const idx = parseInt(k, 10);
        if (!isNaN(idx)) answersObj[idx + 1] = session.answers[k];
      });
    }
    setAnswersMap(answersObj);
  }, []);

  function fillSentence(template) {
    if (!template) return '';
    return String(template).replace(/\{\{(\d+)\}\}/g, (m, g1) => {
      const num = parseInt(g1, 10);
      const val = answersMap[num];
      return val != null ? String(val) : m;
    });
  }

  const handleAnswer = (selectedOption, idx) => {
    if (answered) return; // ignore repeat clicks
    const question = story.quiz[currentQuestion];
    const correct = selectedOption === question.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setSelectedIndex(idx);
    setAnswered(true);
    if (correct) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
  };

  const handleNext = async () => {
    // If last question, save score and navigate
    if (!story) return;
    if (currentQuestion >= story.quiz.length - 1) {
      const finalScore = score;
      try {
        await updateDoc(doc(db, 'users', 'anonymous', 'sessions', sessionId), {
          quizScore: finalScore
        });
      } catch (err) {
        console.warn('Firestore update failed:', err);
      }
      navigate(`/whatif/${sessionId}`);
      return;
    }
    // move to next question
    setCurrentQuestion(prev => prev + 1);
    // reset per-question state
    setSelectedIndex(null);
    setAnswered(false);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleBack = () => {
    if (currentQuestion === 0) return;
    setCurrentQuestion(prev => prev - 1);
    setSelectedIndex(null);
    setAnswered(false);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  if (!story) return <div>Loading...</div>;

  const question = story.quiz[currentQuestion];
  const numberEmojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

  return (
    <div className="quiz">
      <div className="quiz-container">
        <h2>Quiz Time! ✨</h2>

        <div className={`question-card ${answered ? 'answered' : ''}`}>
          <p className="question">{fillSentence(question.question)}</p>

          <div className="options">
            {question.options.map((option, index) => {
              const correctIdx = question.options.indexOf(question.answer);
              const isSelected = selectedIndex === index;
              const isCorrectOption = index === correctIdx;
              let cls = 'option-btn';
              if (answered) {
                if (isCorrectOption) cls += ' correct';
                else if (isSelected && !isCorrectOption) cls += ' incorrect';
              }
              const emoji = numberEmojis[index] || `${index + 1}️⃣`;
              return (
                <button
                  key={index}
                  className={cls}
                  onClick={() => handleAnswer(option, index)}
                  disabled={answered}
                >
                  <span className="option-emoji">{emoji}</span>
                  <span className="option-text">{fillSentence(option)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && (
          <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? 'Correct! 🎉' : 'Not quite, but keep going! 💪'}
          </div>
        )}

        <div className="quiz-nav">
          <div className="nav-left">
            {currentQuestion > 0 ? (
              <button className="nav-btn back" onClick={handleBack}>⬅️ Back</button>
            ) : <div />}
          </div>
          <div className="nav-right">
            <button className="nav-btn next" onClick={handleNext} disabled={!answered}>{currentQuestion < story.quiz.length - 1 ? 'Next ➡️' : 'Finish ✅'}</button>
          </div>
        </div>

        {showConfetti && <Confetti />}
      </div>
    </div>
  );
};

export default Quiz;