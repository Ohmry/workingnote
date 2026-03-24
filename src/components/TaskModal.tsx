import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import TagPicker from './TagPicker';
import styles from './TaskModal.module.css';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  dueDate?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, dueDate }) => {
  const { addTask, addTag } = useTaskStore();
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setSelectedTags([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      await addTask(title.trim(), dueDate, selectedTags);
      onClose();
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName) 
        : [...prev, tagName]
    );
  };

  const handleAddNewTag = async (tagName: string) => {
    await addTag(tagName);
    setSelectedTags(prev => [...prev, tagName]);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>새 업무 추가</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.field}>
            <label htmlFor="task-title">업무 이름</label>
            <input
              id="task-title"
              type="text"
              className={styles.input}
              placeholder="무엇을 해야 하나요?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label>라벨</label>
            <TagPicker 
              selectedTags={selectedTags} 
              onToggleTag={toggleTag} 
              onAddTag={handleAddNewTag}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.submitButton} disabled={!title.trim()}>
              만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
