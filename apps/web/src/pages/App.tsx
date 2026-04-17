import { executionModes, laneTypes, schemaRegistry } from "@job-hunt/schemas";

const scaffoldItems = [
  "Batch-first local workflow",
  "ATS/company lane is primary",
  "LinkedIn remains restricted",
  "Truthful artifacts only",
  "Dry-run before execution"
] as const;

export function App() {
  return (
    <main className="app-shell">
      <section className="intro-band">
        <p className="eyebrow">Foundation runtime</p>
        <h1>Job Hunt Automation</h1>
        <p className="lede">
          Local-first queues, lane routing, truthful artifacts, explicit approvals, and host-aware execution.
        </p>
      </section>

      <section className="status-grid" aria-label="Scaffold status">
        <article>
          <h2>Lane Types</h2>
          <p>{laneTypes.join(", ")}</p>
        </article>
        <article>
          <h2>Execution Modes</h2>
          <p>{executionModes.join(", ")}</p>
        </article>
        <article>
          <h2>Schema Contracts</h2>
          <p>{Object.keys(schemaRegistry).length} shared contracts validate config, model outputs, queues, and reviews.</p>
        </article>
        <article>
          <h2>Next Build Step</h2>
          <p>Build deterministic intake, normalization, scoring, routing, and dry-run workflow orchestration.</p>
        </article>
      </section>

      <section className="checklist-band" aria-label="Guardrails">
        <h2>Guardrails</h2>
        <ul>
          {scaffoldItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
