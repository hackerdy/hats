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
  const [referralRecorded, setReferralRecorded] = useState(false); // Track if referral is recorded

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

          // Record referral after setting user
          if (startParam && !referralRecorded) {
            await recordReferral(fetchedUser.telegramId);
          }
        } catch (error) {
          console.error('Error while fetching user data:', error);
        }
      }
    };

    interface InitDataUnsafe {
      start_param?: string;
      user?: {
        photo_url?: string;
      };
    }

    interface FetchedUser {
      telegramId: string;
      photo_url?: string;
    }
 
    const recordReferral = async (telegramId: string): Promise<void> => {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/referral/record-referral`,
          {
            newUserTelegramId: telegramId,
            referralCode: startParam
          },
          {
            headers: {
              'Authorization': `Bearer ${WebApp.initData}`,
              'Telegram-Init-Data': WebApp.initData
            }
          }
        );
        setReferralRecorded(true); // Mark referral as recorded
      } catch (error) {
        console.log('Error recording referral:', error);
      }
    };

    fetchData();
  }, [referralRecorded, setUser]); 

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


