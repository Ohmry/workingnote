import React from 'react';
import { Check } from 'lucide-react';
import styles from './Checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => {
  return (
    <label className={styles.checkboxContainer}>
      <input 
        type="checkbox" 
        className={styles.hiddenCheckbox} 
        checked={checked} 
        onChange={onChange}
      />
      <div className={styles.styledCheckbox}>
        <Check className={styles.checkIcon} size={14} strokeWidth={3} />
      </div>
    </label>
  );
};

export default Checkbox;
