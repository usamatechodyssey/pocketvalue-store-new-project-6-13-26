"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box } from 'lucide-react'

const CustomProductsNavLink: React.FC = () => {
  const pathname = usePathname();
  const isActive = pathname === '/admin/product-explorer';

  return (
    <div style={{ padding: '0 0.5rem' }}>
      <Link 
        href="/admin/product-explorer"
        style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', textDecoration: 'none', 
          color: isActive ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-500)', 
          backgroundColor: isActive ? 'var(--theme-elevation-100)' : 'transparent',
          borderRadius: '4px', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s ease'
        }}
      >
        <Box size={18} />
        Product Explorer
      </Link>
    </div>
  )
}
export default CustomProductsNavLink