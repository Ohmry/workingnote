import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isDanger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
  children?: React.ReactNode;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, isOpen, onClose, items, children }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Adjust position if menu goes off screen
  const menuWidth = 220; // Increased for better tag picker fit
  const menuHeight = (items.length * 36) + (children ? 100 : 0) + 16;
  
  const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
  const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

  return (
    <div 
      ref={menuRef}
      className={styles.contextMenu}
      style={{ left: adjustedX, top: adjustedY, width: menuWidth }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className={`${styles.menuItem} ${item.isDanger ? styles.danger : ''}`}
          onClick={() => {
            item.onClick();
            if (!children) onClose(); // Don't close immediately if there are other interactive elements
          }}
        >
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
      {children && (
        <div className={styles.customContent}>
          {children}
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
