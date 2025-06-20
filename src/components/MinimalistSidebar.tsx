import React from 'react';
import { NavLink } from 'react-router-dom';
import { DollarSign, BarChart3, FileText, Save, UserCircle } from 'lucide-react';

const navItems = [
  { label: 'DCF Analysis', icon: <DollarSign />, to: '/dcf' },
  { label: 'Comps Analysis', icon: <BarChart3 />, to: '/comps' },
  { label: 'Investment Memo', icon: <FileText />, to: '/memo' },
  { label: 'Saved Analyses', icon: <Save />, to: '/saved' },
];

export default function MinimalistSidebar() {
  return (
    <aside
      style={{
        width: 280,
        background: '#F0F0F0',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        borderRight: '1px solid #DDDDDD',
      }}
    >
      {/* Logo Area */}
      <div style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 24px', marginBottom: 32 }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#333' }}>ValueVista</span>
      </div>
      {/* User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <UserCircle size={32} color="#666" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: '#333' }}>Jane Doe</div>
          <div style={{ fontSize: 14, color: '#777' }}>Analyst</div>
        </div>
      </div>
      {/* Divider */}
      <div style={{ height: 1, background: '#DDDDDD', margin: '16px 0' }} />
      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 8px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 8,
              textDecoration: 'none',
              color: isActive ? '#333' : '#666',
              background: isActive ? '#E0E0E0' : 'transparent',
              fontWeight: 500,
              fontSize: 16,
              transition: 'background 0.2s, color 0.2s',
            })}
          >
            <span style={{ color: '#666' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      {/* Spacer to push content to top */}
      <div style={{ flex: 1 }} />
    </aside>
  );
} 