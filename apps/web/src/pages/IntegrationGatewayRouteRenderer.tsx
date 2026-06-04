import { GatewayAcknowledgementPage } from "./GatewayAcknowledgementPage.js";
import type { AppRouteRendererProps } from "./AppRouteRendererTypes.js";

type IntegrationGatewayRouteRendererProps = Pick<
  AppRouteRendererProps,
  | "apiBaseUrl"
  | "authSession"
  | "gatewayAcknowledgementForm"
  | "gatewayAcknowledgementResult"
  | "isSubmittingGatewayAcknowledgement"
  | "onGatewayAcknowledgementFormChange"
  | "onGatewayAcknowledgementSubmit"
>;

export function IntegrationGatewayRouteRenderer({
  apiBaseUrl,
  authSession,
  gatewayAcknowledgementForm,
  gatewayAcknowledgementResult,
  isSubmittingGatewayAcknowledgement,
  onGatewayAcknowledgementFormChange,
  onGatewayAcknowledgementSubmit
}: IntegrationGatewayRouteRendererProps) {
  return (
    <GatewayAcknowledgementPage
      apiBaseUrl={apiBaseUrl}
      authSession={authSession}
      form={gatewayAcknowledgementForm}
      isSubmitting={isSubmittingGatewayAcknowledgement}
      onFormChange={onGatewayAcknowledgementFormChange}
      onSubmit={onGatewayAcknowledgementSubmit}
      result={gatewayAcknowledgementResult}
    />
  );
}
