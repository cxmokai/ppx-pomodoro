import { useState, useEffect } from 'react';
import { Trash2, Check, ChevronRight, ChevronDown, ChevronUp } from './icons';
import { themes } from '../utils/themes';
import type { PomodoroQuest } from '../utils/themes';

interface PomodoroQuestsProps {
  currentTheme: string;
  triggerUpdate?: number;
}

type ExpandState = 'collapsed' | 'partial' | 'expanded';

export const PomodoroQuests = ({
  currentTheme,
  triggerUpdate,
}: PomodoroQuestsProps) => {
  const [quests, setQuests] = useState<PomodoroQuest[]>([]);
  const [expandState, setExpandState] = useState<ExpandState>('collapsed');
  const theme = themes[currentTheme];

  const loadQuests = () => {
    const existing = localStorage.getItem('pomodoro-completed-quests');
    if (existing) {
      const parsed: PomodoroQuest[] = JSON.parse(existing);
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
      const parsed: PomodoroQuest[] = JSON.parse(existing);
      const filtered = parsed.filter((q) => q.id !== id);
      localStorage.setItem(
        'pomodoro-completed-quests',
        JSON.stringify(filtered)
      );
      setQuests(filtered);
    }
  };

  if (quests.length === 0) return null;

  const handleHeaderClick = () => {
    if (expandState === 'collapsed') {
      setExpandState('partial');
    } else if (expandState === 'partial') {
      setExpandState('collapsed');
    } else {
      setExpandState('partial');
    }
  };

  const displayQuests =
    expandState === 'expanded' ? quests : quests.slice(0, 3);
  const showList = expandState !== 'collapsed';
  const showMoreButton = quests.length > 3 && expandState !== 'collapsed';

  return (
    <div className={`brutal-card mt-6 ${theme.surface}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b-4 cursor-pointer transition-colors`}
        style={{ borderColor: '#000000' }}
        onClick={handleHeaderClick}
      >
        <div className={`flex items-center gap-3 ${theme.text} no-select`}>
          <Check className="w-5 h-5" style={{ color: '#FF6B35' }} />
          <span className="text-sm">COMPLETED QUESTS ({quests.length})</span>
        </div>
        <span
          className={`no-select transition-transform duration-300 ${
            showList ? 'rotate-90' : ''
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </span>
      </div>

      {/* Quest List - Only show when not collapsed */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showList ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 space-y-2 overflow-y-auto">
          {displayQuests.map((quest, index) => (
            <div
              key={quest.id}
              className={`flex items-center justify-between p-3 brutal-card ${theme.surfaceHighlight} transition-all duration-200`}
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
                <div className={`text-xs ${theme.textMuted} mt-1 no-select`}>
                  {formatTime(quest.completedAt || quest.createdAt)}
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
      </div>

      {/* Show More/Less Button */}
      {showMoreButton && (
        <button
          onClick={() =>
            setExpandState(expandState === 'expanded' ? 'partial' : 'expanded')
          }
          className={`w-full p-3 border-t-4 text-sm ${theme.textMuted} hover:${theme.text} cursor-pointer transition-colors no-select flex items-center justify-center gap-2`}
          style={{ borderColor: '#000000' }}
        >
          {expandState === 'expanded' ? (
            <>
              <ChevronUp className="w-4 h-4" />
              SHOW LESS
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              SHOW {quests.length - 3} MORE
            </>
          )}
        </button>
      )}
    </div>
  );
};
