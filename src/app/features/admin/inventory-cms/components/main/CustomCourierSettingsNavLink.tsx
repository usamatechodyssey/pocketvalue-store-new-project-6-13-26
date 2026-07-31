// src/app/components/admin/CustomCourierSettingsNavLink.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck } from 'lucide-react';

const CustomCourierSettingsNavLink: React.FC = () => {
  const pathname = usePathname();
  const isActive = pathname === '/admin/courier-settings';

  return (
    <div style={{ padding: '0 0.5rem' }}>
      <Link
        href="/admin/courier-settings"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          textDecoration: 'none',
          color: isActive ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-500)',
          backgroundColor: isActive ? 'var(--theme-elevation-100)' : 'transparent',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = isActive
            ? 'var(--theme-elevation-100)'
            : 'transparent')
        }
      >
        <Truck size={18} />
        Courier Settings
      </Link>
    </div>
  );
};

export default CustomCourierSettingsNavLink;