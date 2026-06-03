import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { ImagingStudy } from "./imaging-study.js";
import { createImagingStudySnapshot } from "./imaging-study.test-support.js";

describe("ImagingStudy rehydration", () => {
  it("rejects invalid rehydrated imaging study metadata", () => {
    const snapshot = createImagingStudySnapshot({
      id: "imaging-study-007"
    });

    expect(() =>
      ImagingStudy.rehydrate({
        ...snapshot,
        status: "draft" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      ImagingStudy.rehydrate({
        ...snapshot,
        numberOfSeries: 0
      })
    ).toThrow(DomainError);

    expect(() =>
      ImagingStudy.rehydrate({
        ...snapshot,
        numberOfInstances: 1
      })
    ).toThrow(DomainError);

    expect(() =>
      ImagingStudy.rehydrate({
        ...snapshot,
        series: [
          {
            ...snapshot.series[0],
            startedAt: "2026-05-28T02:59:00.000Z"
          }
        ]
      })
    ).toThrow(DomainError);

    expect(() =>
      ImagingStudy.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);
  });
});
