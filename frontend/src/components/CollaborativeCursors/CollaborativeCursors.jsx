import React, { useState, useEffect } from 'react';
import './CollaborativeCursors.css';

const CollaborativeCursors = ({ cursors = [] }) => {
  const getUserColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="collaborative-cursors">
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="cursor-indicator"
          style={{
            position: 'absolute',
            left: cursor.position?.x || 0,
            top: cursor.position?.y || 0,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {/* Línea del cursor */}
          <div
            className="cursor-line"
            style={{
              backgroundColor: getUserColor(cursor.userId),
              width: '2px',
              height: '20px',
              position: 'relative'
            }}
          >
            {/* Etiqueta con nombre del usuario */}
            <div
              className="cursor-label"
              style={{
                backgroundColor: getUserColor(cursor.userId),
                color: 'white',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: '500',
                position: 'absolute',
                top: '-25px',
                left: '0',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {cursor.userName}
            </div>
            
            {/* Punta del cursor */}
            <div
              className="cursor-tip"
              style={{
                width: '0',
                height: '0',
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: `6px solid ${getUserColor(cursor.userId)}`,
                position: 'absolute',
                top: '20px',
                left: '-3px'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollaborativeCursors;