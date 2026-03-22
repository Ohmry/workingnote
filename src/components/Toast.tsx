import React, { useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={styles.toastContainer}>
      <span className={styles.message}>{message}</span>
      {onUndo && (
        <button className={styles.undoButton} onClick={() => {
          onUndo();
          onClose();
        }}>
          실행 취소
        </button>
      )}
    </div>
  );
};

export default Toast;
