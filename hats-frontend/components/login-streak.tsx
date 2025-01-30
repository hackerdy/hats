'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';
import { useUser } from '@/context/UserContext';

interface LoginStreakProps {
  streak: number;
  lastLogin: string;
  streakRewards: number;
}

export function LoginStreak({ streak, lastLogin, streakRewards }: LoginStreakProps) {
  const [localStreak, setLocalStreak] = useState({
    streak,
    lastLogin,
    streakRewards,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const telegramId = user?.telegramId;

  console.log(
    telegramId
  );

  const updateStreak = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/update-login-streak`,
        { telegramId: user?.telegramId },
        {
          headers: {
            'Authorization': `Bearer ${WebApp.initData}`,
            'Telegram-Init-Data': WebApp.initData
          }
        }
      );

      setLocalStreak({
        streak: response.data.streak,
        lastLogin: response.data.lastLogin,
        streakRewards: response.data.streakRewards,
      });

      WebApp.showAlert(
        response.data.dailyReward > 0
          ? `+${response.data.dailyReward} $HATS earned!`
          : 'Come back tomorrow to keep your streak!'
      );
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.error === 'Already claimed today'
      ) {
        WebApp.showAlert('You already claimed your daily reward today!');
      } else {
        console.error('Streak update failed:', error);
        WebApp.showAlert('Failed to update streak. Try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const lastLoginDate = localStreak.lastLogin ? new Date(localStreak.lastLogin) : null;
  const today = new Date();
  const isToday = lastLoginDate
    ? lastLoginDate.toDateString() === today.toDateString()
    : false;

    return (
      <Card className="border-gray-800 bg-[#121212] rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-[#1A1A1A] rounded-t-xl px-4 py-3">
          <CardTitle className="text-lg font-bold text-white">Daily Login Streak</CardTitle>
          <Calendar className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-white">{localStreak.streak}</div>
            <button
              onClick={updateStreak}
              disabled={loading || isToday}
              className={`text-sm ${
                isToday ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:text-blue-500'
              }`}
            >
              {isToday ? 'Logged in today!' : 'Claim Daily Reward'}
            </button>
          </div>
        </CardContent>
      </Card>
  );  
}
