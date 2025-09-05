/**
 * Webhook API Route
 * 
 * Handles incoming webhooks from Creem's payment system.
 * Processes both one-time payments and subscription lifecycle events.
 * Updates local database to maintain payment and subscription state.
 * 
 * @module api/webhook/creem
 */

import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  createUserSubscription,
  updateUserSubscription,
  getUserSubscriptionByUserId,
} from "@/backend/service/user_subscription";
import {
  createCreditUsage,
  getCreditUsageByUserId,
  updateCreditUsage,
} from "@/backend/service/credit_usage";
import {
  CreditUsage,
  PaymentHistory,
  UserSubscription,
} from "@/backend/type/type";
import {
  getPaymentHistoryById,
  updatePaymentHistory,
  createPaymentHistory,
} from "@/backend/service/payment_history";
import { UserSubscriptionStatusEnum } from "@/backend/type/enum/user_subscription_enum";

const prisma = new PrismaClient();

/**
 * Webhook Response Interface
 * 
 * Represents the structure of incoming webhook events from Creem.
 * This is a simplified version focusing on essential fields for the template.
 * 
 * @interface WebhookResponse
 * @property {string} id - Unique identifier for the webhook event
 * @property {string} eventType - Type of event (e.g., "checkout.completed", "subscription.paid")
 * @property {Object} object - Contains the event payload
 * @property {string} object.request_id - Contains userId for one-time payments
 * @property {string} object.id - Unique identifier for the payment/subscription
 * @property {Object} object.customer - Customer information
 * @property {Object} object.product - Product information including billing type
 * @property {string} object.status - Current status of the payment/subscription
 * @property {Object} object.metadata - Additional data passed during checkout
 */
export interface WebhookResponse {
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
    metadata: any;
  };
}

/**
 * POST /api/webhook/creem
 * 
 * Processes incoming webhook events from Creem's payment system.
 * Handles both one-time payments and subscription lifecycle events.
 * 
 * Event Types Handled:
 * 1. One-Time Payments:
 *    - checkout.completed: Payment successful, fulfill purchase
 * 
 * 2. Subscriptions:
 *    - subscription.paid: New subscription or successful renewal
 *    - subscription.canceled: Subscription cancellation requested
 *    - subscription.expired: Subscription ended (payment failed or period ended)
 * 
 * @async
 * @function
 * @param {NextRequest} req - Incoming webhook request containing event data
 * @returns {Promise<NextResponse>} Confirmation of webhook processing
 */
export async function POST(req: NextRequest) {
  try {
    const webhook = (await req.json()) as WebhookResponse;

    // Determine payment type based on billing_type
    const isSubscription = webhook.object.product.billing_type === "recurring";

    if (!isSubscription) {
      /**
       * One-Time Payment Flow
       * --------------------
       * 1. Verify payment completion via checkout.completed event
       * 2. Extract user ID from request_id (set during checkout)
       * 3. Store purchase record in database
       * 4. Enable access to purchased product/feature
       */
      if (webhook.eventType === "checkout.completed") {
        const userId = webhook.object.request_id;
        const productId = webhook.object.product.id;
        const providerCustomerId = webhook.object.customer.id;
        
        // Handle one-time payment similar to existing logic
        const currentDate = new Date();
        let newPeriodEnd = new Date(currentDate);
        newPeriodEnd.setMonth(currentDate.getMonth() + 1);

        // Update credit usage for one-time purchases
        let credit_usage_from_db: CreditUsage = await getCreditUsageByUserId(userId);
        
        if (credit_usage_from_db.period_end && credit_usage_from_db.period_end > newPeriodEnd) {
          newPeriodEnd = new Date(credit_usage_from_db.period_end);
        }

        if (!credit_usage_from_db) {
          await createCreditUsage({
            user_uuid: userId,
            credit_used: 0,
            credit_total: parseInt(webhook.object.metadata?.credit || "100"),
            period_start: currentDate,
            period_end: newPeriodEnd,
          });
        } else {
          await updateCreditUsage({
            user_uuid: userId,
            credit_used: credit_usage_from_db.credit_used,
            credit_total: credit_usage_from_db.credit_total + parseInt(webhook.object.metadata?.credit || "100"),
            period_start: credit_usage_from_db.period_start,
            period_end: newPeriodEnd,
          });
        }

        // Create payment history record
        await createPaymentHistory({
          user_uuid: userId,
          subscription_plan_id: parseInt(webhook.object.metadata?.subscriptionPlanId || "1"),
          amount: parseFloat(webhook.object.metadata?.amount || "0"),
          interval: webhook.object.metadata?.interval || "month",
          payment_status: "completed",
          payment_intent_id: webhook.object.id,
        });
      }
    } else {
      /**
       * Subscription Flow
       * ----------------
       * Handles the complete subscription lifecycle:
       * 
       * 1. subscription.paid
       *    - New subscription or successful renewal
       *    - Create/update subscription record
       *    - Enable access to subscription features
       * 
       * 2. subscription.canceled
       *    - User requested cancellation
       *    - Mark subscription for non-renewal
       *    - Optionally maintain access until period end
       * 
       * 3. subscription.expired
       *    - Final state: payment failed or canceled period ended
       *    - Update subscription status
       *    - Revoke access to subscription features
       */
      if (webhook.eventType === "subscription.paid") {
        const userId = webhook.object.metadata.userId;
        const productId = webhook.object.product.id;
        const providerCustomerId = webhook.object.customer.id;

        // Handle subscription payment similar to existing Stripe logic
        const currentDate = new Date();
        let newPeriodEnd = new Date(currentDate);
        
        // Set period based on interval
        if (webhook.object.metadata?.interval === "year") {
          newPeriodEnd.setFullYear(currentDate.getFullYear() + 1);
        } else {
          newPeriodEnd.setMonth(currentDate.getMonth() + 1);
        }

        // Create or update user subscription
        const existingSubscription = await getUserSubscriptionByUserId(userId);
        
        if (!existingSubscription || existingSubscription.length === 0) {
          await createUserSubscription({
            user_uuid: userId,
            subscription_plan_id: parseInt(webhook.object.metadata?.subscriptionPlanId || "1"),
            status: UserSubscriptionStatusEnum.ACTIVE,
            current_period_start: currentDate,
            current_period_end: newPeriodEnd,
            stripe_subscription_id: webhook.object.id,
            stripe_customer_id: providerCustomerId,
          });
        } else {
          await updateUserSubscription({
            user_uuid: userId,
            subscription_plan_id: parseInt(webhook.object.metadata?.subscriptionPlanId || "1"),
            status: UserSubscriptionStatusEnum.ACTIVE,
            current_period_start: currentDate,
            current_period_end: newPeriodEnd,
            stripe_subscription_id: webhook.object.id,
            stripe_customer_id: providerCustomerId,
          });
        }

        // Update credit usage
        let credit_usage_from_db: CreditUsage = await getCreditUsageByUserId(userId);
        
        if (!credit_usage_from_db) {
          await createCreditUsage({
            user_uuid: userId,
            credit_used: 0,
            credit_total: parseInt(webhook.object.metadata?.credit || "1000"),
            period_start: currentDate,
            period_end: newPeriodEnd,
          });
        } else {
          await updateCreditUsage({
            user_uuid: userId,
            credit_used: 0, // Reset for new period
            credit_total: parseInt(webhook.object.metadata?.credit || "1000"),
            period_start: currentDate,
            period_end: newPeriodEnd,
          });
        }
      }

      if (webhook.eventType === "subscription.canceled") {
        const userId = webhook.object.metadata.userId;
        
        // Update subscription status to handle cancellation
        await updateUserSubscription({
          user_uuid: userId,
          status: UserSubscriptionStatusEnum.CANCELLED,
          stripe_subscription_id: webhook.object.id,
        });
      }

      if (webhook.eventType === "subscription.expired") {
        const userId = webhook.object.metadata.userId;
        
        // Final subscription state update
        await updateUserSubscription({
          user_uuid: userId,
          status: UserSubscriptionStatusEnum.EXPIRED,
          stripe_subscription_id: webhook.object.id,
        });
      }
    }

    // Confirm webhook processing
    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
