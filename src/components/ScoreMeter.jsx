import React from 'react';

export const ScoreMeter = ({ score }) => {
  if (!score) return null;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.value / 100) * circumference;

  return (
    <div className="section-wrapper">
      <h2>Overall Match</h2>
      <div className="score-circle-container">
        <svg className="score-svg">
          <circle className="score-bg" cx="50" cy="50" r={radius} />
          <circle 
            className="score-fill" 
            cx="50" cy="50" r={radius} 
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-text">
          <span className="score-value">{score.value}%</span>
          <span className="score-label">{score.label}</span>
        </div>
      </div>
    </div>
  );
};
