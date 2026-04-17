import { readJsoncFile } from "@job-hunt/core";
import {
  assertValid,
  hostCapabilitiesConfigSchema,
  type HostCapabilitiesConfig,
  type HostCapabilityProfile
} from "@job-hunt/schemas";

export const hostCapabilitiesStatus = "config-backed-foundation" as const;

export interface HostCapabilityRegistry {
  profiles: HostCapabilityProfile[];
  byHost: Map<string, HostCapabilityProfile>;
}

export function loadHostCapabilityRegistry(rootDir = process.cwd()): HostCapabilityRegistry {
  const config = assertValid(
    hostCapabilitiesConfigSchema,
    readJsoncFile("config/host-capabilities.jsonc", rootDir)
  ) as HostCapabilitiesConfig;
  const byHost = new Map(config.profiles.map((profile) => [profile.host, profile]));

  return {
    profiles: config.profiles,
    byHost
  };
}

export function resolveHostCapability(
  registry: HostCapabilityRegistry,
  host: string | null | undefined
): HostCapabilityProfile {
  if (!host) {
    return mustGetGenericProfile(registry);
  }

  const normalized = host.toLowerCase().replace(/^www\./, "");
  const exact = registry.byHost.get(normalized);
  if (exact) {
    return exact;
  }

  for (const profile of registry.profiles) {
    if (profile.host !== "generic" && normalized.endsWith(profile.host)) {
      return profile;
    }
  }

  if (normalized.includes("workday")) {
    return registry.byHost.get("workday") ?? mustGetGenericProfile(registry);
  }

  return mustGetGenericProfile(registry);
}

function mustGetGenericProfile(registry: HostCapabilityRegistry): HostCapabilityProfile {
  const generic = registry.byHost.get("generic");
  if (!generic) {
    throw new Error("Host capability registry must include a generic fallback profile.");
  }

  return generic;
}
