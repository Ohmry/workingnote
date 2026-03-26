import React from 'react';
import styles from './ConfirmDialog.module.css';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
  isDanger?: boolean;
  showInput?: boolean;
  inputPlaceholder?: string;
  defaultValue?: string;
  children?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = '확인',
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  isDanger = false,
  showInput = false,
  inputPlaceholder = '',
  defaultValue = '',
  children,
}) => {
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (isOpen) setValue(defaultValue);
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(showInput ? value : undefined);
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {!showInput && (
            <div className={`${styles.iconContainer} ${isDanger ? styles.danger : ''}`}>
              <AlertTriangle size={20} />
            </div>
          )}
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.body}>
          {message && <p className={styles.message}>{message}</p>}
          {showInput && (
            <input
              type="text"
              className={styles.modalInput}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={inputPlaceholder}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            />
          )}
          {children}
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button 
            className={`${styles.confirmButton} ${isDanger ? styles.dangerButton : ''}`} 
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
