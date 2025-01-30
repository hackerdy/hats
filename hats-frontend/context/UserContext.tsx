'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { TelegramUser } from '@/lib/types';
import axios from 'axios';

type UserContextType = {
  user: TelegramUser | null;
  setUser: (user: TelegramUser | null) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isClient, setIsClient] = useState(false); // Flag to check if it's running client-side

  // Client-side only effect to avoid SSR mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add refresh function, defer WebApp usage until after the client-side mount
  const refreshUser = useCallback(async () => {
    if (isClient) {
      const { default: WebApp } = await import('@twa-dev/sdk'); // Dynamic import of WebApp for client-side usage

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/user/validate-telegram-data`,
          { initData: WebApp.initData },
          {
            headers: {
              'Authorization': `Bearer ${WebApp.initData}`,
            },
          }
        );

        const userData = response.data.user;
        const unsafeData = WebApp.initDataUnsafe?.user;

        setUser({
          ...userData,
          photo_url: unsafeData?.photo_url,
          loginStreak: userData.loginStreak || 0,
          lastLogin: userData.lastLogin || '',
          streakRewards: userData.streakRewards || 0,
        });
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        WebApp.showAlert('Failed to refresh data. Please try again.');
      }
    }
  }, [isClient]);

  // Prevent rendering during SSR
  if (!isClient) return null;

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
