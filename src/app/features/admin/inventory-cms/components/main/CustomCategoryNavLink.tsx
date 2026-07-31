// src/app/components/admin/CustomCategoryNavLink.tsx
"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ListPlus } from 'lucide-react' // ✅ Naya Icon

const CustomCategoryNavLink: React.FC = () => {
  const pathname = usePathname();
  const isActive = pathname === '/admin/import-categories'; // ✅ Naya path

  return (
    // Isay 'Advanced Tools' group ke andar dikhane ke liye
    <div style={{ padding: '0 0.5rem' }}> 
      <Link 
        href="/admin/import-categories" // ✅ Naya URL
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
        <ListPlus size={18} /> {/* ✅ Naya Icon */}
        Bulk Category Import
      </Link>
    </div>
  )
}

export default CustomCategoryNavLink