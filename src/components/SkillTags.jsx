import React from 'react';

export const SkillTags = ({ items }) => {
  return (
    <div className="section-wrapper">
      <h2>Skills Analysis</h2>
      <div className="tags-grid">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className={`skill-tag ${item.status ? 'found' : 'missing'} ${item.importance}`}
          >
            {item.status ? '✓' : '×'} {item.skill}
          </div>
        ))}
      </div>
    </div>
  );
};
