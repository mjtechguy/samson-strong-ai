import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};