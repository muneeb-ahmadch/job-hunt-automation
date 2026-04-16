import { pathToFileURL } from "node:url";

import { coreScaffold } from "@job-hunt/core";
import { executionModes, laneTypes } from "@job-hunt/schemas";

export function getWorkerStatus(): string {
  return [
    "job-hunt worker scaffold",
    `core=${coreScaffold.packageName}`,
    `lanes=${laneTypes.length}`,
    `executionModes=${executionModes.length}`,
    "productFlows=not-implemented"
  ].join(" ");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(getWorkerStatus());
}
