// src/lib/adapters/courier/PostExAdapter.ts

import {
    BaseCourierAdapter,
    ShipmentData,
    AWBResponse,
    TrackingResponse,
    LabelResponse,
  } from "./BaseCourierAdapter";
  
  /**
   * PostEx Courier Service Integration Adapter.
   * 
   * 🔧 REAL API Integration Ready:
   * - Uses credentials from Admin Settings
   * - PostEx Merchant API v4.1.9 (most accessible API among Pakistani couriers)
   * - Full error handling and validation
   * 
   * 📍 PostEx API Endpoints (Official v4.1.9):
   * - AWB Generation: POST /api/v4/shipments
   * - Tracking: GET /api/v4/tracking/{awb}
   * - Label: GET /api/v4/labels/{awb}
   * - Cancel: DELETE /api/v4/shipments/{awb}
   * 
   * 🔑 Required Credentials:
   * - postExApiKey: Merchant API Key
   * - postExSecret: Merchant Secret
   * - postExMerchantId: Merchant ID
   */
  export class PostExAdapter extends BaseCourierAdapter {
    private baseUrl: string;
  
    constructor(credentials: any) {
      super(credentials, "postex");
      this.baseUrl = credentials?.apiUrl || process.env.POSTEX_API_URL || 'https://api.postex.pk/api/v4';
    }
  
    // ================================================================
    // 🔒 REQUIRED IMPLEMENTATIONS
    // ================================================================
  
    async generateAWB(data: ShipmentData): Promise<AWBResponse> {
      try {
        await this.validateCredentials();
  
        const payload = this.buildPostExPayload(data);
  
        // 🔥 REAL API CALL (PostEx v4.1.9)
        const response = await this.makeRequest<{
          data: {
            awb_number: string;
            label_url: string;
            status: string;
            estimated_delivery: string;
          };
          message: string;
          success: boolean;
        }>(
          'POST',
          `${this.baseUrl}/shipments`,
          payload,
          {
            'X-API-Key': this.getCredential('postExApiKey') || '',
            'X-Secret': this.getCredential('postExSecret') || '',
            'X-Merchant-ID': this.getCredential('postExMerchantId') || '',
            'Content-Type': 'application/json',
          }
        );
  
        if (!response.success) {
          throw new Error(response.message || 'PostEx API returned error');
        }
  
        return {
          success: true,
          trackingId: response.data.awb_number,
          awbNumber: response.data.awb_number,
          labelUrl: response.data.label_url,
          courierStatus: response.data.status,
          estimatedDelivery: response.data.estimated_delivery,
          message: `PostEx AWB generated successfully for ${data.orderNumber}`,
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
          data: {
            status: string;
            estimated_delivery: string;
            delivered_at: string;
            history: Array<{
              timestamp: string;
              status: string;
              location: string;
              description: string;
            }>;
          };
          message: string;
          success: boolean;
        }>(
          'GET',
          `${this.baseUrl}/tracking/${trackingId}`,
          undefined,
          {
            'X-API-Key': this.getCredential('postExApiKey') || '',
            'Content-Type': 'application/json',
          }
        );
  
        if (!response.success) {
          throw new Error(response.message || 'PostEx tracking failed');
        }
  
        const mappedStatus = this.mapPostExStatus(response.data.status);
  
        return {
          success: true,
          trackingId: trackingId,
          courier: 'PostEx',
          status: response.data.status,
          mappedStatus: mappedStatus,
          estimatedDelivery: response.data.estimated_delivery,
          deliveredAt: response.data.delivered_at,
          history: response.data.history || [],
          message: 'Tracking retrieved successfully',
        };
      } catch (error) {
        const err = this.handleError(error);
        return {
          success: false,
          trackingId: trackingId,
          courier: 'PostEx',
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
          data: {
            label_url: string;
            label_format: string;
          };
          message: string;
          success: boolean;
        }>(
          'GET',
          `${this.baseUrl}/labels/${trackingId}`,
          undefined,
          {
            'X-API-Key': this.getCredential('postExApiKey') || '',
            'Accept': 'application/json',
          }
        );
  
        if (!response.success) {
          throw new Error(response.message || 'PostEx label generation failed');
        }
  
        return {
          success: true,
          trackingId: trackingId,
          labelUrl: response.data.label_url,
          labelFormat: response.data.label_format as 'pdf' | 'png' | 'zpl',
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
  
        const response = await this.makeRequest<{
          success: boolean;
          message: string;
        }>(
          'DELETE',
          `${this.baseUrl}/shipments/${trackingId}`,
          { reason },
          {
            'X-API-Key': this.getCredential('postExApiKey') || '',
            'X-Secret': this.getCredential('postExSecret') || '',
            'Content-Type': 'application/json',
          }
        );
  
        if (!response.success) {
          throw new Error(response.message || 'PostEx cancellation failed');
        }
  
        return {
          success: true,
          message: `PostEx AWB ${trackingId} cancelled successfully.`,
        };
      } catch (error) {
        const err = this.handleError(error);
        return {
          success: false,
          message: err.message || 'Failed to cancel PostEx AWB.',
        };
      }
    }
  
    async validateCredentials(): Promise<boolean> {
      try {
        this.requireCredential('postExApiKey', this.getCredential('postExApiKey'));
        this.requireCredential('postExSecret', this.getCredential('postExSecret'));
        this.requireCredential('postExMerchantId', this.getCredential('postExMerchantId'));
        return true;
      } catch (error) {
        throw new Error(`PostEx credentials validation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  
    // ================================================================
    // 🛠️ HELPER METHODS
    // ================================================================
  
    private mapPostExStatus(rawStatus: string): string {
      const map: Record<string, string> = {
        'processing': 'Preparing',
        'booked': 'Preparing',
        'picked_up': 'PickedUp',
        'in_transit': 'In Transit',
        'out_for_delivery': 'In Transit',
        'delivered': 'Delivered',
        'completed': 'Delivered',
        'returned': 'RTO',
        'failed': 'RTO',
        'cancelled': 'Cancelled',
      };
      return map[rawStatus.toLowerCase()] || 'Preparing';
    }
  
    private buildPostExPayload(data: ShipmentData): Record<string, unknown> {
      return {
        merchant_id: this.getCredential('postExMerchantId') || '',
        order_id: data.orderId,
        order_number: data.orderNumber,
        is_cod: data.isCod || false,
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
          recipient_name: data.destinationAddress.fullName,
          phone_number: data.destinationAddress.phone,
          address_line: data.destinationAddress.address,
          area: data.destinationAddress.area,
          city: data.destinationAddress.city,
          province: data.destinationAddress.province,
          email: data.destinationAddress.email,
        },
        items: data.items.map((item) => ({
          product_id: item.productId,
          variant_key: item.variantKey,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price || 0,
        })),
        insurance: data.insuranceValue || 0,
        notes: `Order: ${data.orderNumber}`,
        created_at: new Date().toISOString(),
      };
    }
  }
  
  export default PostExAdapter;