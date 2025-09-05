/**
 * Creem API Types
 * 
 * Type definitions for Creem payment system integration
 */

export interface ApiPricingTableDto {
  id: string;
  products: CreemProduct[];
}

export interface CreemProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: string;
  billing_type: "one-time" | "recurring";
  features: string[];
  featured: boolean;
  payment_link: string;
}

export interface CheckoutSession {
  id: string;
  object: string;
  product: string;
  status: string;
  checkout_url: string;
  success_url: string;
  mode: string;
}

export interface WebhookEvent {
  id: string;
  eventType: string;
  object: {
    request_id: string;
    object: string;
    id: string;
    customer: {
      id: string;
    };
    product: {
      id: string;
      billing_type: string;
    };
    status: string;
    metadata: Record<string, any>;
  };
}
