export const hostBucketsStatus = "deterministic-bucket-foundation" as const;

export function deriveHostBucket(input: { siteType: string; host: string | null | undefined }): string {
  const host = input.host?.toLowerCase().replace(/^www\./, "") || "unknown";
  return `${input.siteType}:${host}`;
}
