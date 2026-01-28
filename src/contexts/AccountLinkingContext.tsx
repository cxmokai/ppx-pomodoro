import type { User } from 'firebase/auth';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { linkCredentialToUser, signInWithGoogle, signInWithGithub, type SignInResult } from '../services/authService';
import type { PendingLinkCredential } from '../utils/themes';

interface AccountLinkingContextType {
  pendingLink: PendingLinkCredential | null;
  setPendingLink: (link: PendingLinkCredential | null) => void;
  completeLinking: (user: User) => Promise<{ success: boolean; error?: string }>;
  clearPendingLink: () => void;
  signInWithOtherProvider: () => Promise<SignInResult>;
}

const AccountLinkingContext = createContext<AccountLinkingContextType | undefined>(undefined);

export const useAccountLinking = () => {
  const context = useContext(AccountLinkingContext);
  if (!context) {
    throw new Error('useAccountLinking must be used within an AccountLinkingProvider');
  }
  return context;
};

export const AccountLinkingProvider = ({ children }: { children: ReactNode }) => {
  const [pendingLink, setPendingLink] = useState<PendingLinkCredential | null>(null);

  const clearPendingLink = useCallback(() => {
    setPendingLink(null);
  }, []);

  const completeLinking = useCallback(
    async (user: User): Promise<{ success: boolean; error?: string }> => {
      if (!pendingLink) {
        return { success: false, error: 'Missing credentials' };
      }

      try {
        await linkCredentialToUser(user, pendingLink.credential);
        console.log('[AccountLinking] Successfully linked', pendingLink.attemptedProvider);
        setPendingLink(null);
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to link account';
        return { success: false, error: errorMessage };
      }
    },
    [pendingLink]
  );

  const signInWithOtherProvider = useCallback(async (): Promise<SignInResult> => {
    // If user has Google account, offer to sign in with GitHub, and vice versa
    // For simplicity, we'll just try GitHub first
    try {
      const result = await signInWithGithub();
      if (result.type === 'link-required') {
        setPendingLink(result.pendingLink);
      }
      return result;
    } catch (error) {
      // If GitHub fails, try Google as fallback
      const result = await signInWithGoogle();
      if (result.type === 'link-required') {
        setPendingLink(result.pendingLink);
      }
      return result;
    }
  }, []);

  return (
    <AccountLinkingContext.Provider
      value={{ pendingLink, setPendingLink, completeLinking, clearPendingLink, signInWithOtherProvider }}
    >
      {children}
    </AccountLinkingContext.Provider>
  );
};
