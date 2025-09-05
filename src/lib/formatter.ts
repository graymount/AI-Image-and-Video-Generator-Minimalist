/**
 * Formatting utilities for Creem payment system
 */

/**
 * Format money amount with currency symbol
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., "USD", "EUR")
 * @returns Formatted money string
 */
export function formatMoney(amount: number, currency: string = "USD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Format billing period for display
 * @param period - The billing period (e.g., "month", "year", "one-time")
 * @returns Display-friendly period string
 */
export function billingPeriodDisplay(period: string): string {
  const periodMap: Record<string, string> = {
    "month": "month",
    "year": "year", 
    "one-time": "one-time",
    "monthly": "month",
    "yearly": "year",
    "annual": "year",
  };
  
  return periodMap[period.toLowerCase()] || period;
}

/**
 * Format subscription status for display
 * @param status - The subscription status
 * @returns Display-friendly status string
 */
export function formatSubscriptionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    "active": "Active",
    "canceled": "Canceled",
    "cancelled": "Canceled", 
    "expired": "Expired",
    "pending": "Pending",
    "trialing": "Trial",
  };
  
  return statusMap[status.toLowerCase()] || status;
}
