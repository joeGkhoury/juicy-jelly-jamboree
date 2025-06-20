import React from 'react';
import MinimalistSidebar from './MinimalistSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F0F0F0' }}>
      <MinimalistSidebar />
      <main
        style={{
          flexGrow: 1,
          background: '#FFF',
          padding: '32px',
          borderRadius: 16,
          margin: '32px',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </main>
    </div>
  );
} 