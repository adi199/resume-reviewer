import React from 'react';

export const ProsConsList = ({ items, type }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="section-wrapper">
      <h2>{type === 'pros' ? 'Strengths' : 'Areas for Improvement'}</h2>
      <div className="pro-con-grid">
        {items.map((item, idx) => (
          <div key={idx} className="card-item">
            <span className="icon-box" style={{color: type === 'pros' ? 'var(--success)' : 'var(--error)'}}>
              {type === 'pros' ? '★' : '!'}
            </span>
            <div>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
