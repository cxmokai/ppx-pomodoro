import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signOut } from '../services/authService';
import type { Theme } from '../utils/themes';
import { LogIn, LogOut } from './icons';
import { ConfirmModal } from './ConfirmModal';

interface AuthButtonProps {
  theme: Theme;
  currentTheme: string;
}

export function AuthButton({ theme, currentTheme }: AuthButtonProps) {
  const { user, loading } = useAuth();
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  const handleSignOutClick = () => {
    setIsSignOutConfirmOpen(true);
  };

  const handleSignOutConfirm = () => {
    setIsSignOutConfirmOpen(false);
    signOut();
  };

  const handleSignOutCancel = () => {
    setIsSignOutConfirmOpen(false);
  };

  if (loading) {
    return (
      <button
        disabled
        className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center gap-2 cursor-not-allowed opacity-50 no-select`}
        style={{
          background: theme.surfaceHighlight
            .replace('bg-[', '')
            .replace(']', ''),
          color: theme.text.replace('text-[', '').replace(']', ''),
        }}
      >
        <span>...</span>
      </button>
    );
  }

  if (user) {
    return (
      <>
        <button
          onClick={handleSignOutClick}
          className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center justify-center cursor-pointer no-select`}
          style={{
            background: theme.surfaceHighlight
              .replace('bg-[', '')
              .replace(']', ''),
            color: theme.text.replace('text-[', '').replace(']', ''),
          }}
          title={`Sign out (${user.email})`}
        >
          <LogOut className="w-4 h-4" />
        </button>
        <ConfirmModal
          isOpen={isSignOutConfirmOpen}
          title="SIGN OUT?"
          message="Are you sure you want to sign out? Your local data will still be available."
          confirmText="SIGN OUT"
          cancelText="CANCEL"
          onConfirm={handleSignOutConfirm}
          onCancel={handleSignOutCancel}
          currentTheme={currentTheme}
        />
      </>
    );
  }

  return (
    <button
      onClick={() => signInWithGoogle()}
      className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center justify-center cursor-pointer no-select`}
      style={{
        background: theme.surfaceHighlight.replace('bg-[', '').replace(']', ''),
        color: theme.text.replace('text-[', '').replace(']', ''),
      }}
      title="Sign in with Google to sync data across devices"
    >
      <LogIn className="w-4 h-4" />
    </button>
  );
}
