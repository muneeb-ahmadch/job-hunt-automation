import { Type, type Static } from "@sinclair/typebox";

import { confidenceSchema } from "./common";

export const skillImportanceValues = ["must_have", "preferred", "contextual"] as const;
export type SkillImportance = (typeof skillImportanceValues)[number];

export const seniorityLevels = ["intern", "junior", "mid", "senior", "staff_plus", "unknown"] as const;
export type SeniorityLevel = (typeof seniorityLevels)[number];

export const employmentTypes = ["full_time", "part_time", "contract", "internship", "unknown"] as const;
export type EmploymentType = (typeof employmentTypes)[number];

export const remoteExpectations = ["remote", "hybrid", "onsite", "unknown"] as const;
export type RemoteExpectation = (typeof remoteExpectations)[number];

export const skillItemSchema = Type.Object(
  {
    raw_term: Type.String(),
    normalized_skill_id: Type.String(),
    importance: Type.Union([
      Type.Literal("must_have"),
      Type.Literal("preferred"),
      Type.Literal("contextual")
    ])
  },
  { additionalProperties: false }
);

export type SkillItem = Static<typeof skillItemSchema>;

export const jobExtractionOutputSchema = Type.Object(
  {
    job_title: Type.String(),
    company_name: Type.String(),
    seniority_level: Type.Union([
      Type.Literal("intern"),
      Type.Literal("junior"),
      Type.Literal("mid"),
      Type.Literal("senior"),
      Type.Literal("staff_plus"),
      Type.Literal("unknown")
    ]),
    employment_type: Type.Union([
      Type.Literal("full_time"),
      Type.Literal("part_time"),
      Type.Literal("contract"),
      Type.Literal("internship"),
      Type.Literal("unknown")
    ]),
    remote_expectation: Type.Union([
      Type.Literal("remote"),
      Type.Literal("hybrid"),
      Type.Literal("onsite"),
      Type.Literal("unknown")
    ]),
    must_have_skills: Type.Array(skillItemSchema),
    nice_to_have_skills: Type.Array(skillItemSchema),
    responsibilities: Type.Array(Type.String()),
    keywords: Type.Array(Type.String()),
    tools: Type.Array(Type.String()),
    location_constraints: Type.Array(Type.String()),
    work_auth_requirements: Type.Array(Type.String()),
    compensation_signals: Type.Optional(Type.Array(Type.String())),
    domain_signals: Type.Optional(Type.Array(Type.String())),
    education_requirements: Type.Optional(Type.Array(Type.String())),
    red_flags: Type.Array(Type.String()),
    parse_confidence: confidenceSchema
  },
  {
    $id: "job-extraction-output.schema.json",
    additionalProperties: false
  }
);

export type JobExtractionOutput = Static<typeof jobExtractionOutputSchema>;
