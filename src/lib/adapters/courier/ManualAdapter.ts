// src/lib/adapters/courier/ManualAdapter.ts

import {
    BaseCourierAdapter,
    ShipmentData,
    AWBResponse,
    TrackingResponse,
    LabelResponse,
  } from "./BaseCourierAdapter";
  
  /**
   * Manual Entry Adapter — Fallback when no courier is selected.
   * Admin manually enters tracking ID.
   */
  export class ManualAdapter extends BaseCourierAdapter {
    constructor(credentials: any) {
      super(credentials, "manual");
    }
  
    async generateAWB(data: ShipmentData): Promise<AWBResponse> {
      // Manual mode: use trackingId provided by admin, or generate a placeholder
      const trackingId = data.trackingId || `MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
      return {
        success: true,
        trackingId: trackingId,
        awbNumber: trackingId,
        labelUrl: '',
        courierStatus: 'manual',
        estimatedDelivery: 'N/A',
        message: `Manual tracking ID: ${trackingId}`,
      };
    }
  
    async trackAWB(trackingId: string): Promise<TrackingResponse> {
      return {
        success: true,
        trackingId: trackingId,
        courier: 'Manual Entry',
        status: 'manual',
        mappedStatus: 'Preparing',
        message: 'Manual tracking — no real-time updates available.',
      };
    }
  
    async generateLabel(trackingId: string): Promise<LabelResponse> {
      return {
        success: false,
        trackingId: trackingId,
        labelUrl: '',
        message: 'Manual entry does not support label generation.',
        error: 'Manual mode: no label available',
      };
    }
  
    async cancelAWB(trackingId: string, reason?: string): Promise<{ success: boolean; message: string }> {
      return {
        success: true,
        message: `Manual tracking ID ${trackingId} marked as cancelled.`,
      };
    }
  
    async validateCredentials(): Promise<boolean> {
      return true; // Always valid
    }
  }
  
  export default ManualAdapter;