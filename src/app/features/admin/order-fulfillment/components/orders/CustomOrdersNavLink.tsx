"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

const CustomOrdersNavLink: React.FC = () => {
  const pathname = usePathname();
  const isActive = pathname.startsWith('/admin/orders');

  return (
    <div style={{ padding: '0 0.5rem' }}>
      <Link 
        href="/admin/orders"
        style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', textDecoration: 'none', 
          color: isActive ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-500)', 
          backgroundColor: isActive ? 'var(--theme-elevation-100)' : 'transparent',
          borderRadius: '4px', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s ease'
        }}
      >
        <ShoppingBag size={18} />
        Orders
      </Link>
    </div>
  )
}
export default CustomOrdersNavLink