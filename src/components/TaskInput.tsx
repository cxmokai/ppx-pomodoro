import { useState } from "react";
import { Edit3 } from "lucide-react";
import { themes } from "../utils/themes";

interface TaskInputProps {
  currentTheme: string;
}

export const TaskInput = ({ currentTheme }: TaskInputProps) => {
  const [task, setTask] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const theme = themes[currentTheme];

  return (
    <div className="mb-8">
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsEditing(false);
              }
            }}
            placeholder="Enter current task..."
            className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${theme.input}`}
            autoFocus
          />
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors group"
        >
          <Edit3
            size={16}
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${theme.textMuted}`}
          />
          <span className={task ? theme.text : `${theme.textMuted} italic`}>
            {task || "Click to add a task"}
          </span>
        </div>
      )}
    </div>
  );
};
