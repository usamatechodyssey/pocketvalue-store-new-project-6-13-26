// 📂 src/app/(payload)/layout.tsx

import configPromise from '@payload-config';
import { RootLayout } from '@payloadcms/next/layouts';
import React from 'react';
import { importMap } from './admin/importMap';
import { serverFunction } from './actions';
import { Toaster } from 'react-hot-toast'; // ✅ 🆕 IMPORTED TOASTER

// @ts-ignore
import '@payloadcms/next/css';
import './admin.css';

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout 
      config={configPromise} 
      importMap={importMap} 
      serverFunction={serverFunction}
    >
      {/* ✅ 🆕 MOUNTED GLOBAL TOASTER FOR ALL PAYLOAD ADMIN VIEWS */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
            maxWidth: '100%',
          },
        }}
        containerClassName="z-[99999]" 
      />
      {children}
    </RootLayout>
  );
}