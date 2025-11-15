import React from 'react';

const ConfidenceSlider = ({ value, onChange }) => {
  const confidenceLabels = {
    1: 'Not confident',
    2: 'Slightly confident',
    3: 'Moderately confident',
    4: 'Confident',
    5: 'Very confident'
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="section-label">Confidence in digital payments</div>
      <div className="slider-container">
        <div className="slider-labels">
          <span>Not confident</span>
          <span>Very confident</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="slider"
        />
        <div className="slider-value">
          {confidenceLabels[value]}
        </div>
      </div>
    </div>
  );
};

export default ConfidenceSlider;