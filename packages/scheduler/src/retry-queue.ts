export const retryQueueStatus = "backoff-foundation" as const;

export function nextRetryAt(now: Date, backoffSeconds: number): string {
  return new Date(now.getTime() + backoffSeconds * 1000).toISOString();
}
