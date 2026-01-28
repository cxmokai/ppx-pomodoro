import { useState, useEffect, useCallback, useRef } from 'react';
import { Trash2, X, Search, CheckCircle2, History, Timer, Diamond } from './icons';
import { ConfirmModal } from './ConfirmModal';
import { themes } from '../utils/themes';
import type { PomodoroQuest } from '../utils/themes';
import { useData } from '../contexts/DataContext';
import {
  getDateLabel,
  getDateRangeForLoading,
  getUserLocalDate,
  getDateInTimezone,
} from '../utils/dateUtils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
}

// Format time as HH:MM
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Get relative time
const getRelativeTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
};

const INITIAL_DAYS_TO_LOAD = 7; // 1 week
const LOAD_MORE_DAYS = 7; // Load 1 more week at a time

export const HistoryDrawer = ({
  isOpen,
  onClose,
  currentTheme,
}: HistoryDrawerProps) => {
  const {
    completedQuests,
    deletePomodoroQuest,
    settings,
    getPomodoroQuestsByDateRange,
    getDailyRecord,
  } = useData();
  const theme = themes[currentTheme];
  const timezone = settings.timezone || 'Asia/Shanghai';

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuests, setFilteredQuests] = useState<PomodoroQuest[]>([]);
  const [questToDelete, setQuestToDelete] = useState<PomodoroQuest | null>(null);
  const [daysLoaded, setDaysLoaded] = useState(INITIAL_DAYS_TO_LOAD);
  const [hasMore, setHasMore] = useState(true);
  const [scrolledNearBottom, setScrolledNearBottom] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setDaysLoaded(INITIAL_DAYS_TO_LOAD);
      setHasMore(true);
      setSearchQuery('');
      setScrolledNearBottom(false);
    }
  }, [isOpen]);

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

  // Get date range for currently loaded days
  const getLoadedDateRange = useCallback((): { startDate: string; endDate: string } => {
    const endDate = getUserLocalDate(timezone); // Today
    const startDate = getDateRangeForLoading(daysLoaded, timezone)[daysLoaded - 1]; // Oldest loaded day

    return { startDate, endDate };
  }, [daysLoaded, timezone]);

  // Load quests for current date range
  const loadQuests = useCallback((): { grouped: Map<string, PomodoroQuest[]>; allQuests: PomodoroQuest[] } => {
    const { startDate, endDate } = getLoadedDateRange();
    const questsInRange = getPomodoroQuestsByDateRange(startDate, endDate);

    // Exclude today's quests
    const today = getUserLocalDate(timezone);
    const questsExcludingToday = questsInRange.filter((quest) => {
      const completedAt = quest.completedAt || quest.createdAt;
      const questDate = new Date(completedAt);
      const questDateStr = questDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return questDateStr !== today;
    });

    // Group by date using timezone-aware labels
    const grouped = new Map<string, PomodoroQuest[]>();
    questsExcludingToday.forEach((quest) => {
      const completedAt = quest.completedAt || quest.createdAt;
      const dateKey = getDateLabel(completedAt, timezone);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(quest);
    });

    return { grouped, allQuests: questsExcludingToday };
  }, [getPomodoroQuestsByDateRange, getLoadedDateRange, timezone]);

  // Group filtered quests by date
  const groupedQuests = useCallback((): Map<string, PomodoroQuest[]> => {
    const grouped = new Map<string, PomodoroQuest[]>();
    const today = getUserLocalDate(timezone);

    filteredQuests.forEach((quest) => {
      // Skip today's quests
      const completedAt = quest.completedAt || quest.createdAt;
      const questDate = new Date(completedAt);
      const questDateStr = questDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      if (questDateStr === today) {
        return;
      }

      const dateKey = getDateLabel(completedAt, timezone);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(quest);
    });

    return grouped;
  }, [filteredQuests, timezone]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Show "Scroll to load more" when scrolled near bottom
    if (scrollPercentage > 0.7) {
      setScrolledNearBottom(true);
    } else {
      setScrolledNearBottom(false);
    }

    // Load more when user is within 100px of bottom or scrolled 90%
    if (scrollPercentage > 0.9 || scrollHeight - scrollTop - clientHeight < 100) {
      setDaysLoaded((prev) => {
        const newDays = prev + LOAD_MORE_DAYS;
        // Check if we've loaded all available quests
        const totalAvailable = completedQuests.filter((q) => {
          const completedAt = q.completedAt || q.createdAt;
          const questDate = new Date(completedAt);
          const questDateStr = questDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          const today = getUserLocalDate(timezone);
          return questDateStr !== today;
        }).length;

        const { allQuests } = loadQuests();
        const hasMoreQuests = allQuests.length < totalAvailable;

        if (!hasMoreQuests) {
          setHasMore(false);
        }

        return newDays;
      });
    }
  }, [completedQuests, loadQuests, timezone]);

  // Get grouped quests
  const grouped = groupedQuests();

  // Create a mapping of date label to completed pomodoro count
  const dateToPomodoroCount = useCallback((dateLabel: string): number => {
    let actualDateStr: string;

    if (dateLabel === 'Today') {
      actualDateStr = getUserLocalDate(timezone);
    } else if (dateLabel === 'Yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      actualDateStr = getDateInTimezone(yesterday, timezone);
    } else {
      // dateLabel is already a date string in format like "Jan 28, 2025"
      // We need to parse it back to a date string
      // The dateLabel comes from getDateLabel which formats the date
      // Let's parse the quests to find the actual date
      const questsForDate = grouped.get(dateLabel);
      if (questsForDate && questsForDate.length > 0) {
        const completedAt = questsForDate[0].completedAt || questsForDate[0].createdAt;
        actualDateStr = getDateInTimezone(new Date(completedAt), timezone);
      } else {
        return 0;
      }
    }

    const record = getDailyRecord(actualDateStr);
    return record?.completedPomodoros || 0;
  }, [grouped, getDailyRecord, timezone]);

  // Sort dates (most recent first)
  const sortedDates = Array.from(grouped.keys()).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    // Sort by date (reverse)
    return new Date(b).getTime() - new Date(a).getTime();
  });

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
            <h2 className={`text-lg ${theme.text} no-select flex items-center gap-2`}>
              <History className="w-5 h-5" />
              HISTORY
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
                boxShadow: '2px 2px 0 0 #000000',
              }}
            />
          </div>
        </div>

        {/* Quest List with Infinite Scroll */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto"
          onScroll={handleScroll}
          style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
          {sortedDates.length === 0 ? (
            <div className="p-6">
              <p className={`text-sm ${theme.textMuted} text-center no-select`}>
                {searchQuery ? 'No quests match your search' : 'No completed quests yet'}
              </p>
            </div>
          ) : (
            <div className="p-4">
              {sortedDates.map((dateKey) => {
                const dateQuests = grouped.get(dateKey)!;
                return (
                  <div key={dateKey} className="mb-6">
                    {/* Date Header */}
                    <div
                      className={`text-xs font-bold ${theme.textMuted} mb-3 px-2 no-select flex items-center gap-2`}
                    >
                      <span>{dateKey}</span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {dateToPomodoroCount(dateKey)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Diamond className="w-3 h-3" />
                        {dateQuests.length}
                      </span>
                    </div>

                    {/* Quests for this date */}
                    <div className="space-y-2">
                      {dateQuests.map((quest, index) => (
                        <div
                          key={quest.id}
                          className={`flex items-center gap-3 p-3 brutal-card ${theme.surfaceHighlight} transition-all duration-200`}
                          style={{
                            animation: `brutal-slide-in 0.2s ease-out ${index * 30}ms both`,
                          }}
                        >
                          {/* Status Icon */}
                          <CheckCircle2
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: '#22c55e' }}
                          />

                          {/* Quest Title */}
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
                              className={`text-xs ${theme.textMuted} no-select`}
                            >
                              {formatTime(quest.completedAt || quest.createdAt)} · {getRelativeTime(quest.completedAt || quest.createdAt)}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(quest)}
                            className={`px-3 py-2 brutal-btn cursor-pointer no-select`}
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
                  </div>
                );
              })}

              {/* Load More Indicator */}
              {hasMore && !searchQuery && scrolledNearBottom && (
                <div className="text-center py-4">
                  <p className={`text-xs ${theme.textMuted} no-select`}>
                    Scroll to load more...
                  </p>
                </div>
              )}

              {!hasMore && sortedDates.length > 0 && (
                <div className="text-center py-4">
                  <p className={`text-xs ${theme.textMuted} no-select`}>
                    No more quests to load
                  </p>
                </div>
              )}
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
