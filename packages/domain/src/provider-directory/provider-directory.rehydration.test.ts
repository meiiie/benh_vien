import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { ProviderDirectory, type ProviderDirectorySnapshot } from "./provider-directory.js";
import {
  createProviderDirectorySnapshot,
  withFirstEndpoint,
  withFirstOrganization,
  withFirstPractitionerRole
} from "./provider-directory.test-support.js";

describe("ProviderDirectory rehydration invariants", () => {
  it("rejects invalid rehydrated provider directory metadata", () => {
    const scenarios: readonly {
      readonly name: string;
      readonly snapshot: ProviderDirectorySnapshot;
      readonly message: string;
    }[] = [
      {
        name: "organization type",
        snapshot: withFirstOrganization(createProviderDirectorySnapshot(), {
          type: "clinic" as never
        }),
        message: "Loại cơ sở y tế"
      },
      {
        name: "endpoint status",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          status: "paused" as never
        }),
        message: "Trạng thái Endpoint"
      },
      {
        name: "endpoint connection type",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          connectionType: "graphql" as never
        }),
        message: "Loại kết nối Endpoint"
      },
      {
        name: "endpoint payload type",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          payloadTypes: []
        }),
        message: "payloadType"
      },
      {
        name: "contact system",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          contact: [
            {
              system: "fax" as never,
              value: "+84 225 000 000",
              use: "work"
            }
          ]
        }),
        message: "Hệ thống liên hệ"
      },
      {
        name: "role period order",
        snapshot: withFirstPractitionerRole(createProviderDirectorySnapshot(), {
          periodStart: "2026-05-29T00:00:00.000Z",
          periodEnd: "2026-05-28T00:00:00.000Z"
        }),
        message: "không được trước"
      },
      {
        name: "generatedAt",
        snapshot: {
          ...createProviderDirectorySnapshot(),
          generatedAt: "not-a-date"
        },
        message: "Provider Directory không hợp lệ"
      },
      {
        name: "endpoint createdAt",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          createdAt: "not-a-date"
        }),
        message: "createdAt của Endpoint"
      },
      {
        name: "endpoint persistence timeline",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          updatedAt: "1999-01-01T00:00:00.000Z"
        }),
        message: "Endpoint có updatedAt trước createdAt"
      }
    ];

    for (const scenario of scenarios) {
      const rehydrate = () => ProviderDirectory.rehydrate(scenario.snapshot);

      expect(rehydrate, scenario.name).toThrow(DomainError);
      expect(rehydrate, scenario.name).toThrow(scenario.message);
    }
  });
});
