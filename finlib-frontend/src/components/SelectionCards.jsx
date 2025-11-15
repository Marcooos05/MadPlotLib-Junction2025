import React from 'react';

const SelectionCards = ({ options, selected, onSelect, label }) => {
  return (
    <div style={{ width: '100%' }}>
      <div className="section-label">{label}</div>
      <div className="selection-cards">
        {options.map(option => (
          <div
            key={option.value}
            className={`selection-card ${selected === option.value ? 'selected' : ''}`}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectionCards;