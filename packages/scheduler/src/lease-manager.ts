export const leaseManagerStatus = "basic-lease-token-foundation" as const;

export function calculateLeaseExpiry(now: Date, leaseSeconds: number): string {
  return new Date(now.getTime() + leaseSeconds * 1000).toISOString();
}
