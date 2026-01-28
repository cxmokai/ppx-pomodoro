import { X, CheckCircle2, XCircle } from './icons';
import { themes } from '../utils/themes';
import { useData } from '../contexts/DataContext';
import type { PomodoroSession } from '../utils/themes';

interface SessionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
}

const formatSessionDuration = (startTime: number, endTime?: number): string => {
  const end = endTime || Date.now();
  const durationMs = end - startTime;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

const formatSessionTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getSessionTypeLabel = (type: string): string => {
  switch (type) {
    case 'work':
      return 'WORK';
    case 'shortBreak':
      return 'SHORT BREAK';
    case 'longBreak':
      return 'LONG BREAK';
    default:
      return type.toUpperCase();
  }
};

const getSessionTypeColor = (type: string): string => {
  switch (type) {
    case 'work':
      return '#FF6B35';
    case 'shortBreak':
      return '#FFB347';
    case 'longBreak':
      return '#FF8C42';
    default:
      return '#999999';
  }
};

const groupSessionsByDate = (sessions: PomodoroSession[]): Map<string, PomodoroSession[]> => {
  const grouped = new Map<string, PomodoroSession[]>();

  sessions.forEach((session) => {
    const date = new Date(session.startTime);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(session);
  });

  return grouped;
};

export const SessionHistoryDrawer = ({
  isOpen,
  onClose,
  currentTheme,
}: SessionHistoryDrawerProps) => {
  const { sessions } = useData();
  const theme = themes[currentTheme];

  const groupedSessions = groupSessionsByDate(sessions);
  const sortedDates = Array.from(groupedSessions.keys()).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return a.localeCompare(b);
  });

  const completedCount = sessions.filter((s: PomodoroSession) => s.completed).length;
  const incompleteCount = sessions.length - completedCount;

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
            SESSION HISTORY
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

        {/* Stats */}
        <div className={`p-4 border-b-2 ${theme.surfaceHighlight}`}>
          <div className="flex justify-around text-center">
            <div>
              <div className={`text-2xl font-bold ${theme.text}`}>
                {sessions.length}
              </div>
              <div className={`text-xs ${theme.textMuted} no-select`}>
                TOTAL
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold`} style={{ color: '#22c55e' }}>
                {completedCount}
              </div>
              <div className={`text-xs ${theme.textMuted} no-select`}>
                COMPLETED
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold`} style={{ color: '#ef4444' }}>
                {incompleteCount}
              </div>
              <div className={`text-xs ${theme.textMuted} no-select`}>
                SKIPPED
              </div>
            </div>
          </div>
        </div>

        {/* Session List */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {sessions.length === 0 ? (
            <div className="p-6">
              <p className={`text-sm ${theme.textMuted} text-center no-select`}>
                No sessions recorded yet
              </p>
              <p className={`text-xs ${theme.textMuted} text-center mt-2 no-select`}>
                Sessions will be recorded when you start the timer
              </p>
            </div>
          ) : (
            <div className="p-4">
              {sortedDates.map((dateKey) => {
                const dateSessions = groupedSessions.get(dateKey)!;
                return (
                  <div key={dateKey} className="mb-6">
                    {/* Date Header */}
                    <div
                      className={`text-xs font-bold ${theme.textMuted} mb-3 px-2 no-select`}
                    >
                      {dateKey}
                    </div>

                    {/* Sessions for this date */}
                    <div className="space-y-2">
                      {dateSessions.map((session, index) => (
                        <div
                          key={session.id}
                          className={`flex items-center gap-3 p-3 brutal-card ${theme.surfaceHighlight} transition-all duration-200`}
                          style={{
                            animation: `brutal-slide-in 0.2s ease-out ${index * 30}ms both`,
                          }}
                        >
                          {/* Status Icon */}
                          {session.completed ? (
                            <CheckCircle2
                              className="w-4 h-4 flex-shrink-0"
                              style={{ color: '#22c55e' }}
                            />
                          ) : (
                            <XCircle
                              className="w-4 h-4 flex-shrink-0"
                              style={{ color: '#ef4444' }}
                            />
                          )}

                          {/* Session Type */}
                          <div
                            className={`text-xs font-bold px-2 py-1 flex-shrink-0 no-select`}
                            style={{
                              backgroundColor: getSessionTypeColor(session.type),
                              color: '#ffffff',
                            }}
                          >
                            {getSessionTypeLabel(session.type)}
                          </div>

                          {/* Duration */}
                          <div className={`text-sm ${theme.text} no-select`}>
                            {formatSessionDuration(session.startTime, session.endTime)}
                          </div>

                          {/* Time */}
                          <div
                            className={`text-xs ${theme.textMuted} ml-auto no-select`}
                          >
                            {formatSessionTime(session.startTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
