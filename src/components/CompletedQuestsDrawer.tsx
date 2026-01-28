import { useState, useEffect, useCallback } from 'react';
import { Trash2, X, Search } from './icons';
import { ConfirmModal } from './ConfirmModal';
import { themes } from '../utils/themes';
import type { PomodoroQuest } from '../utils/themes';
import { useData } from '../contexts/DataContext';

interface PomodoroQuestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  triggerUpdate?: number;
}

export const PomodoroQuestsDrawer = ({
  isOpen,
  onClose,
  currentTheme,
}: PomodoroQuestsDrawerProps) => {
  const { completedQuests, deletePomodoroQuest } = useData();
  const theme = themes[currentTheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuests, setFilteredQuests] = useState<PomodoroQuest[]>(completedQuests);
  const [questToDelete, setQuestToDelete] = useState<PomodoroQuest | null>(null);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredQuests(completedQuests);
      } else {
        const filtered = completedQuests.filter((quest) =>
          quest.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredQuests(filtered);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, completedQuests]);

  const handleDeleteClick = useCallback((quest: PomodoroQuest) => {
    setQuestToDelete(quest);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (questToDelete) {
      deletePomodoroQuest(questToDelete.id);
      setQuestToDelete(null);
    }
  }, [questToDelete, deletePomodoroQuest]);

  const handleDeleteCancel = useCallback(() => {
    setQuestToDelete(null);
  }, []);

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
        <div className="p-6 border-b-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg ${theme.text} no-select`}>
              COMPLETED QUESTS ({filteredQuests.length})
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

          {/* Search Input */}
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search completed quests..."
              className={`w-full pl-10 pr-4 py-2 text-sm brutal-input no-select`}
              style={{
                background: theme.bg.replace('bg-[', '').replace(']', ''),
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
            />
          </div>
        </div>

        {/* Quest List */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
          {filteredQuests.length === 0 ? (
            <p className={`text-sm ${theme.textMuted} text-center no-select`}>
              {searchQuery ? 'No quests match your search' : 'No completed quests yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredQuests.map((quest, index) => (
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
                      title={quest.title}
                    >
                      {quest.title}
                    </div>
                    <div
                      className={`text-xs ${theme.textMuted} mt-1 no-select`}
                    >
                      {formatTime(quest.completedAt || quest.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(quest)}
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

      <ConfirmModal
        isOpen={questToDelete !== null}
        title="DELETE QUEST?"
        message={`Delete "${questToDelete?.title || 'this quest'}"? This action cannot be undone.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        currentTheme={currentTheme}
      />
    </>
  );
};
