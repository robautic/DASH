/**
 * Webhook handler service for DataCrazy events (leads created, stage updated, message received)
 */

export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: string;
}

export function processWebhookEvent(payload: WebhookPayload) {
  console.log(`[DataCrazy Webhook] Event received: ${payload.event}`, payload.data);
  return { processed: true, event: payload.event };
}
