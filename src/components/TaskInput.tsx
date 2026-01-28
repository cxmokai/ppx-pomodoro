import { useState, useEffect } from 'react';
import { Check } from './icons';
import { ConfirmModal } from './ConfirmModal';
import { themes } from '../utils/themes';
import type { PomodoroQuest } from '../utils/themes';
import { useData } from '../contexts/DataContext';

interface TaskInputProps {
  currentTheme: string;
  onQuestComplete?: (quest: PomodoroQuest) => void;
}

export const TaskInput = ({
  currentTheme,
  onQuestComplete,
}: TaskInputProps) => {
  const { currentTask, setCurrentTask, addPomodoroQuest } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const theme = themes[currentTheme];

  useEffect(() => {
    // Sync with localStorage for fallback
    localStorage.setItem('pomodoro-task', currentTask);
  }, [currentTask]);

  const handleCompleteClick = () => {
    if (!currentTask.trim()) return;
    setShowConfirmModal(true);
  };

  const handleCompleteConfirm = () => {
    setShowConfirmModal(false);
    setIsCompleted(true);

    // Save to completed quests
    const completedQuest: PomodoroQuest = {
      id: Date.now().toString(),
      title: currentTask,
      completed: true,
      createdAt: Date.now(),
      completedAt: Date.now(),
    };

    addPomodoroQuest(completedQuest);

    // Notify parent (for backward compatibility)
    onQuestComplete?.(completedQuest);

    // Clear after animation
    setTimeout(() => {
      setCurrentTask('');
      setIsCompleted(false);
      localStorage.removeItem('pomodoro-task');
    }, 1500);
  };

  const handleCompleteCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
    <div className="flex items-center gap-3">
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditing(false);
              }
            }}
            placeholder="Enter your quest..."
            className={`w-full px-4 py-3 text-sm brutal-input no-select`}
            style={{
              background: theme.bg.replace('bg-[', '').replace(']', ''),
              color: theme.text.replace('text-[', '').replace(']', ''),
            }}
            autoFocus
          />
        ) : (
          <div
            onClick={() => !isCompleted && setIsEditing(true)}
            className={`w-full px-4 py-3 cursor-pointer brutal-btn no-select flex items-center ${
              currentTask ? theme.surfaceHighlight : theme.bg
            } ${isCompleted ? 'opacity-50' : ''}`}
            style={{
              background: currentTask
                ? theme.surfaceHighlight.replace('bg-[', '').replace(']', '')
                : theme.bg.replace('bg-[', '').replace(']', ''),
              color: currentTask
                ? theme.text.replace('text-[', '').replace(']', '')
                : theme.textMuted.replace('text-[', '').replace(']', ''),
            }}
          >
            <span
              style={{
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}
            >
              {currentTask || 'Click to add quest...'}
            </span>
          </div>
        )}
      </div>

      {/* Complete button - only show when there's a task */}
      {currentTask && !isEditing && (
        <button
          onClick={handleCompleteClick}
          disabled={isCompleted}
          className={`brutal-btn px-5 py-3 flex items-center justify-center cursor-pointer no-select`}
          style={{
            background: isCompleted ? '#FFB347' : '#FF6B35',
            color: '#000000',
            opacity: isCompleted ? 0.7 : 1,
          }}
        >
          <Check className="w-[18px] h-[18px]" />
        </button>
      )}
    </div>

    <ConfirmModal
      isOpen={showConfirmModal}
      title="COMPLETE QUEST?"
      message={`Mark "${currentTask}" as completed?`}
      confirmText="COMPLETE"
      cancelText="CANCEL"
      onConfirm={handleCompleteConfirm}
      onCancel={handleCompleteCancel}
      currentTheme={currentTheme}
    />
    </>
  );
};