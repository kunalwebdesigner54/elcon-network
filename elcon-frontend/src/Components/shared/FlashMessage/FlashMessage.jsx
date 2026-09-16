import React, { useEffect } from 'react';
import './FlashMessage.css';

/**
 * Flash Message / Toast Notification
 * Auto-dismisses after `duration` ms
 *
 * Props:
 *   message  {string}   - message text
 *   type     {string}   - 'success' | 'error' | 'info' | 'warning'
 *   onClose  {function} - called when dismissed
 *   duration {number}   - auto-close delay in ms (default 3500)
 */
const FlashMessage = ({ message, type = 'info', onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
  };

  return (
    <div className={`flash-message flash-message--${type}`} role="alert">
      <span className="flash-icon">{icons[type] || icons.info}</span>
      <span className="flash-text">{message}</span>
      <button className="flash-close" onClick={onClose} aria-label="Close notification">×</button>
    </div>
  );
};

export default FlashMessage;
