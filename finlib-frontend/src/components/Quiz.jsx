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
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Load session
    const session = JSON.parse(localStorage.getItem('session')) || {};
    const selectedStory = storiesData.find(s => s.id === session.storyId);
    setStory(selectedStory);
  }, []);

  const handleAnswer = (selectedOption) => {
    const question = story.quiz[currentQuestion];
    const correct = selectedOption === question.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestion < story.quiz.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Save score
        updateDoc(doc(db, 'users', 'anonymous', 'sessions', sessionId), {
          quizScore: score + (correct ? 1 : 0)
        }).catch(err => console.warn('Firestore update failed:', err));
        navigate(`/whatif/${sessionId}`);
      }
    }, 2000);
  };

  if (!story) return <div>Loading...</div>;

  const question = story.quiz[currentQuestion];

  return (
    <div className="quiz">
      <div className="quiz-container">
        <h2>Quiz Time!</h2>
        <div className="question-card">
          <p className="question">{question.question}</p>
          <div className="options">
            {question.options.map((option, index) => (
              <button
                key={index}
                className="option-btn"
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {showFeedback && (
          <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? 'Correct! 🎉' : 'Not quite, but keep going!'}
          </div>
        )}
        {showConfetti && <Confetti />}
      </div>
    </div>
  );
};

export default Quiz;