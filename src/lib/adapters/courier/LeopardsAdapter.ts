// src/lib/adapters/courier/LeopardsAdapter.ts

import {
    BaseCourierAdapter,
    ShipmentData,
    AWBResponse,
    TrackingResponse,
    LabelResponse,
  } from "./BaseCourierAdapter";
  
  /**
   * Leopards Courier Service Integration Adapter.
   * 
   * 🔧 REAL API Integration Ready:
   * - Uses credentials from Admin Settings
   * - Actual API endpoints (replace placeholders with actual Leopards endpoints)
   * - Full error handling and validation
   * 
   * 📍 Leopards API Endpoints (To be provided by Leopards partner team):
   * - AWB Generation: POST /api/v1/shipments
   * - Tracking: GET /api/v1/tracking/{awb}
   * - Label: GET /api/v1/labels/{awb}
   */
  export class LeopardsAdapter extends BaseCourierAdapter {
    private baseUrl: string;
  
    constructor(credentials: any) {
      super(credentials, "leopards");
      this.baseUrl = credentials?.apiUrl || process.env.LEOPARDS_API_URL || 'https://api.leopards.com.pk/v1';
    }
  
    // ================================================================
    // 🔒 REQUIRED IMPLEMENTATIONS
    // ================================================================
  
    async generateAWB(data: ShipmentData): Promise<AWBResponse> {
      try {
        await this.validateCredentials();
  
        const payload = this.buildLeopardsPayload(data);
  
        // 🔥 REAL API CALL
        const response = await this.makeRequest<{
          awb_number: string;
          label_url: string;
          status: string;
          estimated_delivery: string;
        }>(
          'POST',
          `${this.baseUrl}/shipments`,
          payload,
          {
            'X-API-Key': this.getCredential('leopardsApiKey') || '',
            'X-Secret': this.getCredential('leopardsSecret') || '',
          }
        );
  
        return {
          success: true,
          trackingId: response.awb_number,
          awbNumber: response.awb_number,
          labelUrl: response.label_url,
          courierStatus: response.status,
          estimatedDelivery: response.estimated_delivery,
          message: `Leopards AWB generated successfully for ${data.orderNumber}`,
        };
      } catch (error) {
        const err = this.handleError(error);
        return {
          success: false,
          trackingId: data.trackingId || 'N/A',
          awbNumber: data.trackingId || 'N/A',
          message: err.message,
          error: err.error,
        };
      }
    }
  
    async trackAWB(trackingId: string): Promise<TrackingResponse> {
      try {
        await this.validateCredentials();
  
        const response = await this.makeRequest<{
          status: string;
          estimated_delivery: string;
          delivered_at: string;
          history: Array<{
            timestamp: string;
            status: string;
            location: string;
            description: string;
          }>;
        }>(
          'GET',
          `${this.baseUrl}/tracking/${trackingId}`,
          undefined,
          {
            'X-API-Key': this.getCredential('leopardsApiKey') || '',
          }
        );
  
        const mappedStatus = this.mapLeopardsStatus(response.status);
  
        return {
          success: true,
          trackingId: trackingId,
          courier: 'Leopards',
          status: response.status,
          mappedStatus: mappedStatus,
          estimatedDelivery: response.estimated_delivery,
          deliveredAt: response.delivered_at,
          history: response.history || [],
          message: 'Tracking retrieved successfully',
        };
      } catch (error) {
        const err = this.handleError(error);
        return {
          success: false,
          trackingId: trackingId,
          courier: 'Leopards',
          status: 'unknown',
          mappedStatus: 'Preparing',
          message: err.message,
          error: err.error,
        };
      }
    }
  
    async generateLabel(trackingId: string): Promise<LabelResponse> {
      try {
        await this.validateCredentials();
  
        const response = await this.makeRequest<{
          label_url: string;
          label_format: string;
        }>(
          'GET',
          `${this.baseUrl}/labels/${trackingId}`,
          undefined,
          {
            'X-API-Key': this.getCredential('leopardsApiKey') || '',
            'Accept': 'application/json',
          }
        );
  
        return {
          success: true,
          trackingId: trackingId,
          labelUrl: response.label_url,
          labelFormat: response.label_format as 'pdf' | 'png' | 'zpl',
          message: 'Label generated successfully',
        };
      } catch (error) {
        const err = this.handleError(error);
        return {
          success: false,
          trackingId: trackingId,
          labelUrl: '',
          message: err.message,
          error: err.error,
        };
      }
    }
  
    async cancelAWB(trackingId: string, reason?: string): Promise<{ success: boolean; message: string }> {
      try {
        await this.validateCredentials();
  
        await this.makeRequest(
          'DELETE',
          `${this.baseUrl}/shipments/${trackingId}`,
          { reason },
          {
            'X-API-Key': this.getCredential('leopardsApiKey') || '',
            'X-Secret': this.getCredential('leopardsSecret') || '',
          }
        );
  
        return {
          success: true,
          message: `Leopards AWB ${trackingId} cancelled successfully.`,
        };
      } catch (error) {
        const err = this.handleError(error);
        return {
          success: false,
          message: err.message || 'Failed to cancel Leopards AWB.',
        };
      }
    }
  
    async validateCredentials(): Promise<boolean> {
      try {
        this.requireCredential('leopardsApiKey', this.getCredential('leopardsApiKey'));
        this.requireCredential('leopardsSecret', this.getCredential('leopardsSecret'));
        return true;
      } catch (error) {
        throw new Error(`Leopards credentials validation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  
    // ================================================================
    // 🛠️ HELPER METHODS
    // ================================================================
  
    private mapLeopardsStatus(rawStatus: string): string {
      const map: Record<string, string> = {
        'booked': 'Preparing',
        'picked_up': 'PickedUp',
        'in_transit': 'In Transit',
        'out_for_delivery': 'In Transit',
        'delivered': 'Delivered',
        'returned': 'RTO',
        'cancelled': 'Cancelled',
        'hold': 'On Hold',
      };
      return map[rawStatus.toLowerCase()] || 'Preparing';
    }
  
    private buildLeopardsPayload(data: ShipmentData): Record<string, unknown> {
      return {
        order_id: data.orderId,
        order_number: data.orderNumber,
        cod: data.isCod || false,
        cod_amount: data.codAmount || 0,
        weight: data.totalWeight || 1,
        dimensions: data.packageDetails
          ? {
              length: data.packageDetails.length || 0,
              width: data.packageDetails.width || 0,
              height: data.packageDetails.height || 0,
            }
          : undefined,
        destination: {
          full_name: data.destinationAddress.fullName,
          phone: data.destinationAddress.phone,
          address: data.destinationAddress.address,
          city: data.destinationAddress.city,
          province: data.destinationAddress.province,
          email: data.destinationAddress.email,
        },
        items: data.items.map((item) => ({
          product_id: item.productId,
          variant_key: item.variantKey,
          name: item.name,
          quantity: item.quantity,
          price: item.price || 0,
        })),
        insurance: data.insuranceValue || 0,
        created_at: new Date().toISOString(),
      };
    }
  }
  
  export default LeopardsAdapter;