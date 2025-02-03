'use client'

import { TrackGroups, TwaAnalyticsProvider } from '@tonsolutions/telemetree-react';
import { UserProvider } from "@/context/UserContext";  // Replace with the actual path to your UserProvider
import { NavBar } from "@/components/nav-bar"; 



import { ReactNode } from 'react';

interface AppWrapperProps {
    children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
    return (
    <TwaAnalyticsProvider
        projectId={process.env.NEXT_PUBLIC_PROJECT_ID || ''}
        apiKey={process.env.NEXT_PUBLIC_API_KEY || ''}
        trackGroup={TrackGroups.MEDIUM} // default is TrackGroups.MEDIUM
    >
     <UserProvider>
          <div className="pb-16">{children}</div>
          <NavBar />
        </UserProvider>
    </TwaAnalyticsProvider>
    );
}
