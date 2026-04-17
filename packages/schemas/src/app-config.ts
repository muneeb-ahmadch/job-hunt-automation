import { Type, type Static } from "@sinclair/typebox";

export const appConfigSchema = Type.Object(
  {
    $schema: Type.Optional(Type.String()),
    runtime: Type.Object(
      {
        environment: Type.Union([Type.Literal("local"), Type.Literal("test"), Type.Literal("ci")]),
        dryRun: Type.Boolean(),
        defaultBrowserHeaded: Type.Boolean(),
        timezone: Type.String()
      },
      { additionalProperties: false }
    ),
    storage: Type.Object(
      {
        databaseUrlEnv: Type.String({ minLength: 1 }),
        artifactRootEnv: Type.String({ minLength: 1 }),
        rawImportRootEnv: Type.String({ minLength: 1 }),
        screenshotRootEnv: Type.String({ minLength: 1 }),
        traceRootEnv: Type.String({ minLength: 1 }),
        logRootEnv: Type.String({ minLength: 1 }),
        browserProfileDirEnv: Type.String({ minLength: 1 }),
        domSnapshotRootEnv: Type.Optional(Type.String({ minLength: 1 }))
      },
      { additionalProperties: false }
    ),
    openai: Type.Object(
      {
        apiKeyEnv: Type.String({ minLength: 1 }),
        defaultModelEnv: Type.String({ minLength: 1 }),
        smallModelEnv: Type.String({ minLength: 1 }),
        strongModelEnv: Type.String({ minLength: 1 })
      },
      { additionalProperties: false }
    ),
    costControls: Type.Object(
      {
        enableCaching: Type.Boolean(),
        skipCoverLetterByDefault: Type.Boolean(),
        onlyGenerateArtifactsForTopPercent: Type.Integer({ minimum: 1, maximum: 100 }),
        onlyGenerateAnswersOnDemand: Type.Boolean(),
        monthlySoftUsdCapEnv: Type.String({ minLength: 1 })
      },
      { additionalProperties: false }
    ),
    routing: Type.Object(
      {
        mustHaveCoverageStrongSkipBelow: Type.Number({ minimum: 0, maximum: 100 }),
        prioritySkipBelow: Type.Number({ minimum: 0, maximum: 100 }),
        priorityConsiderBelow: Type.Number({ minimum: 0, maximum: 100 }),
        artifactCandidateAtOrAbove: Type.Number({ minimum: 0, maximum: 100 }),
        executionPriorityAtOrAbove: Type.Number({ minimum: 0, maximum: 100 })
      },
      { additionalProperties: false }
    ),
    security: Type.Object(
      {
        redactLogs: Type.Boolean(),
        sendCookiesToModels: Type.Literal(false),
        sendPasswordsToModels: Type.Literal(false),
        sendTokensToModels: Type.Literal(false)
      },
      { additionalProperties: false }
    ),
    logging: Type.Object(
      {
        levelEnv: Type.String({ minLength: 1 }),
        logToFile: Type.Boolean(),
        redact: Type.Boolean()
      },
      { additionalProperties: false }
    )
  },
  {
    $id: "app-config.schema.json",
    additionalProperties: false
  }
);

export type AppConfig = Static<typeof appConfigSchema>;
