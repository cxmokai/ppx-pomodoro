import { useState, useEffect } from 'react';
import { Trash2, X } from './icons';
import { themes } from '../utils/themes';
import type { CompletedQuest } from '../utils/themes';

interface CompletedQuestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  triggerUpdate?: number;
}

export const CompletedQuestsDrawer = ({
  isOpen,
  onClose,
  currentTheme,
  triggerUpdate,
}: CompletedQuestsDrawerProps) => {
  const [quests, setQuests] = useState<CompletedQuest[]>([]);
  const theme = themes[currentTheme];

  const loadQuests = () => {
    const existing = localStorage.getItem('pomodoro-completed-quests');
    if (existing) {
      const parsed: CompletedQuest[] = JSON.parse(existing);
      setQuests(parsed);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadQuests();
  }, [triggerUpdate]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const deleteQuest = (id: string) => {
    const existing = localStorage.getItem('pomodoro-completed-quests');
    if (existing) {
      const parsed: CompletedQuest[] = JSON.parse(existing);
      const filtered = parsed.filter((q) => q.id !== id);
      localStorage.setItem(
        'pomodoro-completed-quests',
        JSON.stringify(filtered)
      );
      setQuests(filtered);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 brutal-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 brutal-card transition-transform duration-300 ease-in-out ${theme.surface} ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          borderTop: 'none',
          borderBottom: 'none',
          borderRight: 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4">
          <h2 className={`text-lg ${theme.text} no-select`}>
            COMPLETED QUESTS ({quests.length})
          </h2>
          <button
            onClick={onClose}
            className={`brutal-btn p-2 cursor-pointer no-select`}
            style={{
              background: theme.surfaceHighlight
                .replace('bg-[', '')
                .replace(']', ''),
              color: theme.text.replace('text-[', '').replace(']', ''),
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest List */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
          {quests.length === 0 ? (
            <p className={`text-sm ${theme.textMuted} text-center no-select`}>
              No completed quests yet
            </p>
          ) : (
            <div className="space-y-3">
              {quests.map((quest, index) => (
                <div
                  key={quest.id}
                  className={`flex items-center justify-between p-4 brutal-card ${theme.surfaceHighlight} transition-all duration-200`}
                  style={{
                    animation: `brutal-slide-in 0.2s ease-out ${index * 50}ms both`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm ${theme.text} truncate no-select`}
                      style={{
                        textDecoration: 'line-through',
                        opacity: 0.7,
                      }}
                    >
                      {quest.title}
                    </div>
                    <div
                      className={`text-xs ${theme.textMuted} mt-1 no-select`}
                    >
                      {formatTime(quest.completedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteQuest(quest.id)}
                    className={`ml-3 px-3 py-2 brutal-btn cursor-pointer no-select`}
                    style={{
                      background: theme.surfaceHighlight
                        .replace('bg-[', '')
                        .replace(']', ''),
                      color: theme.text.replace('text-[', '').replace(']', ''),
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
