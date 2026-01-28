import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  linkWithCredential,
  type User,
  type AuthError,
  type OAuthCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../lib/firebase';
import type { PendingLinkCredential } from '../utils/themes';

export type SignInResult =
  | { type: 'success'; user: User }
  | { type: 'cancelled' }
  | { type: 'link-required'; pendingLink: PendingLinkCredential };

const getOtherProvider = (provider: string): string => {
  return provider === 'google.com' ? 'github.com' : 'google.com';
};

export const signInWithGoogle = async (): Promise<SignInResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { type: 'success', user: result.user };
  } catch (error) {
    const authError = error as AuthError;

    if (authError.code === 'auth/account-exists-with-different-credential') {
      const credential = GoogleAuthProvider.credentialFromError(authError);
      const email = authError.customData?.email as string;

      if (credential && email) {
        return {
          type: 'link-required',
          pendingLink: {
            credential,
            email,
            attemptedProvider: 'google.com',
            existingProvider: getOtherProvider('google.com'),
          },
        };
      }
      throw new Error('Login failed');
    }

    if (authError.code === 'auth/popup-closed-by-user') {
      return { type: 'cancelled' };
    }

    throw error;
  }
};

export const signInWithGithub = async (): Promise<SignInResult> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return { type: 'success', user: result.user };
  } catch (error) {
    const authError = error as AuthError;

    if (authError.code === 'auth/account-exists-with-different-credential') {
      const credential = GithubAuthProvider.credentialFromError(authError);
      const email = authError.customData?.email as string;

      if (credential && email) {
        return {
          type: 'link-required',
          pendingLink: {
            credential,
            email,
            attemptedProvider: 'github.com',
            existingProvider: getOtherProvider('github.com'),
          },
        };
      }
      throw new Error('Login failed');
    }

    if (authError.code === 'auth/popup-closed-by-user') {
      return { type: 'cancelled' };
    }

    throw error;
  }
};

export const linkCredentialToUser = async (
  user: User,
  credential: OAuthCredential
): Promise<void> => {
  try {
    await linkWithCredential(user, credential);
  } catch (error) {
    const authError = error as AuthError;

    if (authError.code === 'auth/credential-already-in-use') {
      throw new Error('Account already linked');
    }
    if (authError.code === 'auth/provider-already-linked') {
      return;
    }
    if (authError.code === 'auth/invalid-credential') {
      throw new Error('Invalid credential');
    }

    throw new Error('Failed to link account');
  }
};

export const signOut = () => firebaseSignOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const getProviderName = (providerId: string): string => {
  const names: Record<string, string> = {
    'google.com': 'Google',
    'github.com': 'GitHub',
    'facebook.com': 'Facebook',
    'twitter.com': 'Twitter',
    'apple.com': 'Apple',
    'password': 'Email',
  };
  return names[providerId] || providerId;
};
