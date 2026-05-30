import { Info } from "../../components/AppShell.js";
import { formatProviderEndpointConnectionType } from "../../lib/clinicalFormatters.js";
import type { ProviderDirectory } from "../../types/clinical.js";

type ProviderDirectoryPanelProps = {
  readonly directory?: ProviderDirectory;
  readonly isLoading: boolean;
  readonly onRefresh: () => Promise<void> | void;
};

export function ProviderDirectoryPanel({
  directory,
  isLoading,
  onRefresh
}: ProviderDirectoryPanelProps) {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Provider Directory</p>
          <h2>Cơ sở, nhân sự và endpoint liên thông</h2>
        </div>
        <button
          className="ghost-button"
          type="button"
          onClick={() => void onRefresh()}
          disabled={isLoading}
        >
          {isLoading ? "Đang tải..." : "Tải lại"}
        </button>
      </div>

      <div className="detail-grid compact">
        <Info label="Cơ sở/khoa phòng" value={`${directory?.organizations.length ?? 0}`} />
        <Info label="Nhân sự" value={`${directory?.practitioners.length ?? 0}`} />
        <Info label="Vai trò" value={`${directory?.practitionerRoles.length ?? 0}`} />
        <Info label="Endpoint" value={`${directory?.endpoints.length ?? 0}`} />
      </div>

      <div className="reference-list">
        {directory?.endpoints.map((endpoint) => (
          <div key={endpoint.id}>
            <strong>
              {endpoint.name} · {formatProviderEndpointConnectionType(endpoint.connectionType)}
            </strong>
            <span>
              {endpoint.id}; quản lý bởi {endpoint.managingOrganizationId}; payload{" "}
              {endpoint.payloadTypes.map((payloadType) => payloadType.display).join(", ")}.
            </span>
          </div>
        ))}
        {!directory ? (
          <p className="empty-state">
            Provider Directory chưa tải được. Bundle liên thông vẫn nên có
            Organization, Practitioner, PractitionerRole và Endpoint để bên nhận
            hiểu đúng các reference trong hồ sơ.
          </p>
        ) : null}
      </div>
    </article>
  );
}
