import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const capabilities = [
    "Đăng ký và đối soát định danh bệnh nhân",
    "Tạo, ký và lưu trữ tài liệu bệnh án điện tử",
    "Xuất dữ liệu liên thông theo HL7 FHIR",
    "Kết nối hình ảnh y khoa qua PACS/DICOM",
    "Theo dõi nhật ký truy cập và thao tác hồ sơ"
];
const contexts = [
    "Identity & Access",
    "Patient Registry",
    "Clinical Records",
    "Interoperability",
    "Imaging",
    "Audit & Compliance"
];
export function App() {
    return (_jsxs("main", { className: "shell", children: [_jsxs("section", { className: "hero", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "B\u1EA3n kh\u1EDFi \u0111\u1EA7u ki\u1EBFn tr\u00FAc" }), _jsx("h1", { children: "N\u1EC1n t\u1EA3ng b\u1EC7nh \u00E1n \u0111i\u1EC7n t\u1EED v\u00E0 li\u00EAn th\u00F4ng b\u1EC7nh vi\u1EC7n" }), _jsx("p", { className: "lede", children: "Thi\u1EBFt k\u1EBF theo h\u01B0\u1EDBng DDD, \u01B0u ti\u00EAn FHIR, DICOM v\u00E0 kh\u1EA3 n\u0103ng m\u1EDF r\u1ED9ng t\u1EEB prototype h\u1ECDc thu\u1EADt sang h\u1EC7 th\u1ED1ng th\u00ED nghi\u1EC7m nghi\u00EAm t\u00FAc." })] }), _jsxs("div", { className: "status-card", "aria-label": "Tr\u1EA1ng th\u00E1i d\u1EF1 \u00E1n", children: [_jsx("span", { children: "Phi\u00EAn b\u1EA3n" }), _jsx("strong", { children: "0.1.0" }), _jsx("small", { children: "Modular monolith, s\u1EB5n s\u00E0ng t\u00E1ch service khi c\u1EA7n." })] })] }), _jsxs("section", { className: "grid", children: [_jsxs("article", { className: "panel", children: [_jsx("h2", { children: "N\u0103ng l\u1EF1c c\u1ED1t l\u00F5i" }), _jsx("ul", { children: capabilities.map((item) => (_jsx("li", { children: item }, item))) })] }), _jsxs("article", { className: "panel accent", children: [_jsx("h2", { children: "Bounded context" }), _jsx("div", { className: "context-list", children: contexts.map((item) => (_jsx("span", { children: item }, item))) })] })] })] }));
}
