import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signOut } from '../services/authService';
import type { Theme } from '../utils/themes';
import { LogIn, LogOut } from './icons';

interface AuthButtonProps {
  theme: Theme;
}

export function AuthButton({ theme }: AuthButtonProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <button
        disabled
        className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center gap-2 cursor-not-allowed opacity-50 no-select`}
        style={{
          background: theme.surfaceHighlight.replace('bg-[', '').replace(']', ''),
          color: theme.text.replace('text-[', '').replace(']', ''),
        }}
      >
        <span>...</span>
      </button>
    );
  }

  if (user) {
    return (
      <button
        onClick={() => signOut()}
        className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center gap-2 cursor-pointer no-select`}
        style={{
          background: theme.surfaceHighlight.replace('bg-[', '').replace(']', ''),
          color: theme.text.replace('text-[', '').replace(']', ''),
        }}
        title={`Sign out (${user.email})`}
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline max-w-[150px] truncate">{user.email}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => signInWithGoogle()}
      className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center gap-2 cursor-pointer no-select`}
      style={{
        background: theme.surfaceHighlight.replace('bg-[', '').replace(']', ''),
        color: theme.text.replace('text-[', '').replace(']', ''),
      }}
      title="Sign in with Google to sync data across devices"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">SIGN IN</span>
    </button>
  );
}
