import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import styles from './TagPicker.module.css';
import { Plus, Tag as TagIcon, X } from 'lucide-react';

interface TagPickerProps {
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
  onAddTag: (tagName: string) => void;
  showAddButton?: boolean;
}

const TagPicker: React.FC<TagPickerProps> = ({ 
  selectedTags, 
  onToggleTag, 
  onAddTag,
  showAddButton = true 
}) => {
  const { tags: availableTags } = useTaskStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleAdd = () => {
    if (newTagName.trim()) {
      onAddTag(newTagName.trim());
      setNewTagName('');
      setIsAdding(false);
    }
  };

  return (
    <div className={styles.tagPicker}>
      <div className={styles.tagList}>
        {availableTags.map(tag => (
          <button
            key={tag.name}
            type="button"
            className={`${styles.tagItem} ${selectedTags.includes(tag.name) ? styles.selected : ''}`}
            onClick={() => onToggleTag(tag.name)}
          >
            <TagIcon size={12} />
            {tag.name}
          </button>
        ))}
        
        {showAddButton && (
          isAdding ? (
            <div className={styles.addTagInput}>
              <input
                type="text"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="새 라벨..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                autoFocus
              />
              <button type="button" onClick={handleAdd} className={styles.iconBtn}>
                <Plus size={14} />
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className={styles.iconBtn}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              className={styles.addTagBtn} 
              onClick={() => setIsAdding(true)}
            >
              <Plus size={14} /> 라벨 추가
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default TagPicker;
