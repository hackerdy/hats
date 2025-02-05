'use client';

import type { ReactNode, JSX } from 'react';
import React, { useEffect, useState } from 'react';

import type { TelegramWebAppData } from '@tonsolutions/telemetree-react';
import {
  TrackGroups,
  TwaAnalyticsProvider,
} from '@tonsolutions/telemetree-react';

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps): JSX.Element => {
  const [telegramWebAppData, setTelegramWebAppData] = useState<TelegramWebAppData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import('@twa-dev/sdk').then((mod) => {
        const WebApp = mod.default;
        const { initDataUnsafe } = WebApp;

        setTelegramWebAppData({
          query_id: initDataUnsafe?.query_id,
          user: initDataUnsafe?.user,
          chat_type: initDataUnsafe?.chat_type,
          chat_instance: initDataUnsafe?.chat_instance,
          start_param: initDataUnsafe?.start_param,
          auth_date: initDataUnsafe?.auth_date,
          hash: initDataUnsafe?.hash,
          platform: WebApp.platform,
        });
      });
    }
  }, []);

  if (!telegramWebAppData) return <></>; 

  return (
    <TwaAnalyticsProvider
      projectId={process.env.NEXT_PUBLIC_PROJECT_ID || ""}
      apiKey={process.env.NEXT_PUBLIC_API_KEY || ""}
      telegramWebAppData={telegramWebAppData}
    >
      {children}
    </TwaAnalyticsProvider>
  );
};

export default Providers;
