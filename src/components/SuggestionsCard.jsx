import React from 'react';

export const SuggestionsCard = ({ items }) => {
  return (
    <div className="section-wrapper">
      <h2>Optimization Strategy</h2>
      <div className="pro-con-grid">
        {items.map((item, idx) => (
          <div key={idx} className="card-item suggestion-card">
            <div>
              <div style={{marginBottom: '8px'}}>
                <span className={`priority-badge priority-${item.priority}`}>
                  {item.priority}
                </span>
                <strong style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                  {item.category}
                </strong>
              </div>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
