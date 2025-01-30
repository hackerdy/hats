'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { UserProfile } from '@/components/user-profile';
import { BalanceCard } from '@/components/balance-card';
import { LoginStreak } from '@/components/login-streak';
import { useUser } from '@/context/UserContext';
import { StreakReward } from '@/lib/types';

// Dynamically import @twa-dev/sdk to prevent SSR issues
const WebAppPromise = import('@twa-dev/sdk').then((mod) => mod.default);

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure rendering only happens on client

    const fetchData = async () => {
      try {
        const WebApp = await WebAppPromise;
        const initData = WebApp?.initData || '';
        const unsafeData = WebApp?.initDataUnsafe || {};

        if (initData) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/user/validate-telegram-data`,
            { initData }
          );
          const userData = response.data.user;

          setUser({
            ...userData,
            photo_url: unsafeData?.user?.photo_url || userData.photo_url,
          });
        }
      } catch (error) {
        console.error('Error while fetching user data:', error);
      }
    };

    fetchData();
  }, [setUser]);

  if (!isClient) {
    return (
      <main className="min-h-screen flex flex-col p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
      </main>
    );
  }

  const userStreak: StreakReward | null = user
    ? {
        loginStreak: user.loginStreak,
        lastLogin: new Date(user.lastLogin),
        streakRewards: user.streakRewards,
        day: 0, // Placeholder
        reward: 0, // Placeholder
      } 
    : null;

  return (
    <main className="min-h-screen flex flex-col p-4 max-w-md mx-auto">
      {user && <UserProfile user={user} />}
      <div className="mt-4">{user && <BalanceCard user={user} />}</div>
      <div className="mt-4">
        {userStreak && (
          <LoginStreak
            streak={userStreak.loginStreak}
            lastLogin={userStreak.lastLogin.toISOString()}
            streakRewards={userStreak.streakRewards}
          />
        )}
      </div>
    </main>
  );
}
