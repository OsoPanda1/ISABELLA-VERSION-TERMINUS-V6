import { describe, expect, it } from "vitest";
import { predictRegression, type RegressionModel } from "../../../src/lib/native-ml/sovereign-core";

const approvedModel: RegressionModel = {
  weights: [2],
  bias: 1,
  artifactHash: "test-artifact-hash",
  model: {
    modelId: "test-regression",
    version: "1.0.0",
    territoryId: "test-territory",
    ownerId: "test-owner",
    task: "regression",
    algorithm: "deterministic-linear-sgd",
    datasetIds: ["test-dataset"],
    modelHash: "test-model-hash",
    createdAt: "2026-10-23T00:00:00.000Z",
    approvalStatus: "APPROVED",
  },
};

describe("native regression uncertainty contract", () => {
  it("never presents uncalibrated predictions as 100% confident", () => {
    const result = predictRegression(approvedModel, [[3]]);

    expect(result.predictions).toEqual([7]);
    expect(result.confidence).toBeNull();
    expect(result.explanation.confidenceStatus).toBe("uncalibrated");
    expect(result.requiresReview).toBe(true);
    expect(result.riskScore).toBe(1);
    expect(result.degraded).toBe(true);
  });
});
