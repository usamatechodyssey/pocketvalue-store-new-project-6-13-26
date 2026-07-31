
"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UploadCloud } from 'lucide-react'

const CustomNavLink: React.FC = () => {
  const pathname = usePathname();
  const isActive = pathname === '/admin/import-products';

  return (
    <div className="nav-group" style={{ marginTop: '20px' }}>
      <h4 className="nav-group__title" style={{ padding: '0 1rem', fontSize: '11px', textTransform: 'uppercase', color: 'var(--theme-elevation-400)', marginBottom: '8px', fontWeight: 600 }}>
        Advanced Tools
      </h4>
      <div style={{ padding: '0 0.5rem' }}>
        <Link 
          href="/admin/import-products" 
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
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActive ? 'var(--theme-elevation-100)' : 'transparent'}
        >
          <UploadCloud size={18} />
          Bulk Product Import
        </Link>
      </div>
    </div>
  )
}

export default CustomNavLink