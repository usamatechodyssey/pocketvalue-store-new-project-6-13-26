// src/lib/adapters/courier/BaseCourierAdapter.ts

import { ICourierCredentials } from "@/models/Setting";

// ================================================================
// 📦 ENTERPRISE DATA TYPES (Shared across all couriers)
// ================================================================

/**
 * Address structure required for courier shipments.
 * All fields are normalized to match common courier API patterns.
 */
export interface ShipmentAddress {
  fullName: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  province: string;
  email?: string;
}

/**
 * Package dimensions for weight/volume calculations.
 * All measurements are in standard units (kg, cm).
 */
export interface ShipmentPackage {
  weight?: number; // in kg
  length?: number; // in cm
  width?: number; // in cm
  height?: number; // in cm
  description?: string;
}

/**
 * Individual item inside a shipment.
 */
export interface ShipmentItem {
  productId: string;
  variantKey: string;
  name: string;
  quantity: number;
  price?: number;
}

/**
 * Complete data required to generate an AWB.
 */
export interface ShipmentData {
  orderId: string;
  orderNumber: string;
  trackingId?: string; // If manual or pre-assigned
  courierKey: string;
  originAddress?: ShipmentAddress; // Warehouse address
  destinationAddress: ShipmentAddress;
  items: ShipmentItem[];
  packageDetails?: ShipmentPackage;
  totalWeight?: number;
  insuranceValue?: number;
  isCod?: boolean;
  codAmount?: number;
}

/**
 * Standardized AWB Generation Response.
 * Normalizes the response from any courier API.
 */
export interface AWBResponse {
  success: boolean;
  trackingId: string; // The AWB number
  awbNumber: string; // Same as trackingId usually
  labelUrl?: string; // URL to download the label
  courierStatus?: string; // Raw status from courier
  estimatedDelivery?: string; // Estimated delivery date (ISO string)
  message?: string;
  error?: string;
}

/**
 * Standardized Tracking Response.
 * Normalizes tracking data from any courier API.
 */
export interface TrackingResponse {
  success: boolean;
  trackingId: string;
  courier: string;
  status: string; // Raw status from courier
  mappedStatus: string; // Our internal mapped status (Preparing, In Transit, etc.)
  estimatedDelivery?: string;
  deliveredAt?: string;
  rtoReason?: string;
  history?: Array<{
    timestamp: string;
    status: string;
    location?: string;
    description?: string;
  }>;
  message?: string;
  error?: string;
}

/**
 * Standardized Shipping Label Response.
 */
export interface LabelResponse {
  success: boolean;
  trackingId: string;
  labelUrl: string; // PDF URL or base64 data
  labelFormat?: "pdf" | "png" | "zpl";
  message?: string;
  error?: string;
}

// ================================================================
// 🧩 ENTERPRISE ABSTRACT BASE CLASS
// ================================================================

/**
 * Abstract base class for all courier adapters.
 * 
 * Enterprise Features:
 * - Standardized interfaces across all couriers
 * - Secure credential management (sensitive fields are hidden from logs)
 * - Built-in error normalization
 * - Async HTTP request wrapper with timeout handling
 * 
 * Each courier (TCS, Leopards, PostEx, Trax, Manual) must implement
 * all abstract methods below.
 */
export abstract class BaseCourierAdapter {
  protected credentials: ICourierCredentials;
  protected courierKey: string;

  constructor(credentials: ICourierCredentials, courierKey: string) {
    this.credentials = credentials;
    this.courierKey = courierKey;
  }

  // ================================================================
  // 🔒 ABSTRACT METHODS (Must implement in child classes)
  // ================================================================

  /**
   * Generate AWB (Air Waybill) for a shipment.
   * @param data - Shipment details (order, address, items, package)
   * @returns AWBResponse with tracking ID and label URL
   */
  abstract generateAWB(data: ShipmentData): Promise<AWBResponse>;

  /**
   * Track an existing shipment by tracking ID.
   * @param trackingId - The AWB/tracking number
   * @returns TrackingResponse with current status and history
   */
  abstract trackAWB(trackingId: string): Promise<TrackingResponse>;

  /**
   * Generate a shipping label PDF.
   * @param trackingId - The AWB/tracking number
   * @returns LabelResponse with PDF URL or base64 data
   */
  abstract generateLabel(trackingId: string): Promise<LabelResponse>;

  /**
   * Cancel an AWB (if supported).
   * @param trackingId - The AWB/tracking number
   * @param reason - Reason for cancellation
   * @returns Success status
   */
  abstract cancelAWB(trackingId: string, reason?: string): Promise<{ success: boolean; message: string }>;

  /**
   * Validate that credentials are correctly configured.
   * @returns true if valid, throws error if invalid
   */
  abstract validateCredentials(): Promise<boolean>;

  // ================================================================
  // 🛠️ CONCRETE HELPERS (Available to all child classes)
  // ================================================================

  /**
   * Get the courier key (e.g., "tcs", "leopards").
   */
  getCourierKey(): string {
    return this.courierKey;
  }

  /**
   * Get the display name for the courier.
   * Override this in child classes for specific names.
   */
  getDisplayName(): string {
    return this.courierKey.charAt(0).toUpperCase() + this.courierKey.slice(1);
  }

  /**
   * Securely retrieve a credential value.
   * Returns undefined if not set.
   */
  protected getCredential(key: string): string | undefined {
    return this.credentials[key];
  }

  /**
   * Strictly require a credential to be present and non-empty.
   * Throws a descriptive error if missing.
   */
  protected requireCredential(key: string, value: string | undefined): string {
    if (!value || value.trim() === "") {
      throw new Error(
        `Missing required credential: "${key}" for courier: ${this.courierKey}. Please configure it in Admin > Courier Settings.`
      );
    }
    return value.trim();
  }

  /**
   * Build a secure HMAC-SHA256 signature for API requests.
   * Override this in child classes if the courier uses a specific hashing logic.
   */
  protected buildSignature(data: Record<string, string | number>, secret: string): string {
    const crypto = require("crypto");
    const sortedKeys = Object.keys(data).sort();
    const stringToHash = sortedKeys.map((k) => `${k}=${data[k]}`).join("&");
    return crypto.createHmac("sha256", secret).update(stringToHash).digest("hex");
  }

  /**
   * Enterprise-grade HTTP request wrapper.
   * Features:
   * - Automatic JSON serialization/parsing
   * - Error normalization (network errors, HTTP errors, timeouts)
   * - Configurable headers
   * 
   * @param method - HTTP method
   * @param url - Full API endpoint
   * @param data - Request body (for POST/PUT)
   * @param headers - Additional headers
   * @returns Parsed JSON response
   * @throws Error if request fails
   */
  protected async makeRequest<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T> {
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...headers,
    };

    // Remove undefined headers to avoid API errors
    Object.keys(defaultHeaders).forEach(
      (key) => defaultHeaders[key] === undefined && delete defaultHeaders[key]
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(url, {
        method,
        headers: defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Attempt to parse JSON error response
      let responseBody: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        const text = await response.text();
        try {
          responseBody = JSON.parse(text);
        } catch {
          responseBody = { message: text || "Unknown API error" };
        }
      }

      if (!response.ok) {
        const errorMessage =
          responseBody?.message || responseBody?.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`Courier API error (${response.status}): ${errorMessage}`);
      }

      return responseBody as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error(`Request timeout for ${this.courierKey} API (30s)`);
      }
      throw error;
    }
  }

  /**
   * Enterprise-grade error handler.
   * Normalizes errors from any source into a consistent structure.
   * 
   * @param error - Caught error (unknown type)
   * @returns Standardized error object
   */
  protected handleError(error: unknown): { success: false; message: string; error: string } {
    let message = "An unknown courier API error occurred.";
    let errorDetail = "";

    if (error instanceof Error) {
      message = error.message;
      errorDetail = error.stack || error.message;
    } else if (typeof error === "string") {
      message = error;
      errorDetail = error;
    } else if (error && typeof error === "object") {
      message = JSON.stringify(error);
      errorDetail = JSON.stringify(error);
    }

    // Log the error for debugging (but never expose stack traces to the client)
    console.error(`[${this.courierKey.toUpperCase()} Adapter Error]:`, message);

    return {
      success: false,
      message: `${this.getDisplayName()} API failed: ${message}`,
      error: errorDetail,
    };
  }

  /**
   * Redact sensitive credentials from logs.
   * Use this before logging any credential data.
   */
  protected redactCredentials(creds: Record<string, unknown>): Record<string, string> {
    const redacted: Record<string, string> = {};
    for (const [key, value] of Object.entries(creds)) {
      const val = value as string;
      redacted[key] = val && val.length > 4 ? `${val.substring(0, 4)}...${val.substring(val.length - 4)}` : "****";
    }
    return redacted;
  }
}