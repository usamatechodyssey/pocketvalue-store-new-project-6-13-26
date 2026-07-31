
"use client"

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import MassDeletionModal from './MassDeletionModal'; // ✅ MassDeletionModal import kiya

const CustomDeletionNavLink: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    // Isay 'Advanced Tools' group ke andar dikhane ke liye
    <div style={{ padding: '0 0.5rem' }}> 
      <button 
        onClick={() => setIsModalOpen(true)} // ✅ Button click par modal open hoga
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          padding: '8px 12px', 
          textDecoration: 'none', 
          color: 'var(--theme-elevation-500)', // Normal color
          backgroundColor: 'transparent',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          width: '100%', // Button poori width lega
          justifyContent: 'flex-start' // Content left align hoga
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Trash2 size={18} className="text-red-500" /> {/* ✅ Delete Icon (Red color) */}
        Mass Category Deletion
      </button>

      {/* ✅ Mass Deletion Modal yahan render hoga */}
      <MassDeletionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}

export default CustomDeletionNavLink