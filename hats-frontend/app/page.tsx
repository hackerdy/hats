'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { UserProfile } from '@/components/user-profile';
import { BalanceCard } from '@/components/balance-card';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';
import { InviteSystem } from '@/components/invite-system';

export default function Home() {
  const { user, setUser } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const webApp = WebApp;
    const { initData, initDataUnsafe } = webApp;
    const startParam = initDataUnsafe?.start_param;

    const fetchData = async () => {
      if (initData) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/user/validate-telegram-data`,
            { initData }
          );
          const fetchedUser = response.data.user;
          setUser({ ...fetchedUser, photo_url: initDataUnsafe.user?.photo_url });
        } catch (error) {
          console.error('Error while fetching user data:', error);
        }
      }
    };

    const recordReferral = async () => {
      if (startParam && user) {
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/referral/record-referral`,
            {
              referralCode: startParam,
              newUserTelegramId: user.telegramId
            },
            {
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${initData}`
              }
            }
          );
        } catch (error) {
          console.log('Error recording referral:', error);
        }
      }
    };

    const initApp = async () => {
      await fetchData();
      await recordReferral();
    };

    initApp();
  }, [user, setUser]);

  if (!isClient) return null;

  return (
    <main className="min-h-screen flex flex-col p-4 max-w-md mx-auto">
      {user && <UserProfile user={user} />}
      <div className="mt-4 space-y-4">
        {user && <BalanceCard user={user} />}
        <InviteSystem />
      </div>
    </main>
  );
}


