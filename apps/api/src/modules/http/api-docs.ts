import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

export type ApiDocsOptions = {
  readonly version: string;
};

export async function registerApiDocs(
  app: FastifyInstance,
  options: ApiDocsOptions
): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "WiiiCare Nexus API",
        version: options.version,
        description: "API thử nghiệm cho hồ sơ bệnh án điện tử và liên thông FHIR."
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "HMAC"
          }
        }
      },
      tags: [
        {
          name: "fhir",
          description: "FHIR facade metadata and interoperability discovery"
        },
        {
          name: "auth",
          description: "Đăng nhập demo và xác thực phiên truy cập"
        },
        {
          name: "encounters",
          description: "Quản lý lượt khám, đợt điều trị và FHIR Encounter"
        },
        {
          name: "allergy-intolerances",
          description: "Quản lý dị ứng, chống chỉ định và FHIR AllergyIntolerance"
        },
        {
          name: "conditions",
          description: "Quản lý chẩn đoán, vấn đề sức khỏe và FHIR Condition"
        },
        {
          name: "observations",
          description: "Quản lý sinh hiệu, kết quả xét nghiệm có cấu trúc và FHIR Observation"
        },
        {
          name: "medication-requests",
          description: "Quản lý chỉ định thuốc, đơn thuốc và FHIR MedicationRequest"
        },
        {
          name: "medication-dispenses",
          description: "Quản lý cấp phát thuốc từ dược/kho và FHIR MedicationDispense"
        },
        {
          name: "medication-administrations",
          description: "Quản lý lần dùng thuốc thực tế và FHIR MedicationAdministration"
        },
        {
          name: "service-requests",
          description: "Quản lý chỉ định xét nghiệm, hình ảnh, thủ thuật và FHIR ServiceRequest"
        },
        {
          name: "workflow-tasks",
          description: "Quản lý hàng đợi thực thi y lệnh và FHIR Task"
        },
        {
          name: "procedures",
          description: "Quản lý thủ thuật, hoạt động y tế đã thực hiện và FHIR Procedure"
        },
        {
          name: "diagnostic-reports",
          description: "Quản lý báo cáo xét nghiệm, hình ảnh và FHIR DiagnosticReport"
        },
        {
          name: "imaging-studies",
          description: "Quản lý siêu dữ liệu PACS/DICOM và FHIR ImagingStudy"
        },
        {
          name: "clinical-documents",
          description: "Quản lý tài liệu lâm sàng và FHIR DocumentReference"
        },
        {
          name: "audit-events",
          description: "Truy vết truy cập, kiểm tra toàn vẹn audit và xuất FHIR AuditEvent"
        },
        {
          name: "patients",
          description: "Quản lý định danh và hồ sơ bệnh nhân"
        },
        {
          name: "provider-directory",
          description:
            "Quản lý danh bạ cơ sở y tế, nhân sự và endpoint liên thông FHIR/PACS/LIS"
        }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs"
  });
}
