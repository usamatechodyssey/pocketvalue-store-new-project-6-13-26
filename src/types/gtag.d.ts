// src/types/gtag.d.ts

// ✅ Method 1: Extend Window interface directly
declare global {
    interface Window {
      gtag: (...args: any[]) => void;
      dataLayer: any[];
    }
  }
  
  // ✅ Method 2: Or use this if you want stricter types
  // interface Window {
  //   gtag: (
  //     command: 'config' | 'event' | 'set' | 'consent' | 'get',
  //     targetId: string,
  //     config?: Record<string, any>
  //   ) => void;
  //   dataLayer: any[];
  // }
  
  export {};