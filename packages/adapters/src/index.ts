export const adapterTargetOrder = [
  "greenhouse",
  "lever",
  "generic",
  "workday-assist",
  "linkedin-restricted"
] as const;

export const adaptersScaffold = {
  packageName: "@job-hunt/adapters",
  purpose: "API, ATS, browser, Workday assist, and LinkedIn restricted adapter implementations"
} as const;
