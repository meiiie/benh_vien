import { readFile } from "node:fs/promises";

const nginxConfig = await readFile(new URL("../../apps/web/nginx.conf", import.meta.url), "utf8");

const requiredDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "script-src 'self'",
  "style-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'"
];

const requiredHeaders = [
  'add_header X-Content-Type-Options "nosniff" always;',
  'add_header X-Frame-Options "DENY" always;',
  'add_header Referrer-Policy "no-referrer" always;',
  'add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;',
  'add_header Cross-Origin-Resource-Policy "same-origin" always;',
  'add_header Cross-Origin-Opener-Policy "same-origin" always;',
  'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;'
];

for (const header of requiredHeaders) {
  assertIncludes(nginxConfig, header, `Missing web security header: ${header}`);
}

for (const directive of requiredDirectives) {
  assertIncludes(
    nginxConfig,
    directive,
    `Missing Content-Security-Policy directive: ${directive}`
  );
}

assertIncludes(
  nginxConfig,
  "Scope CSP to the SPA",
  "CSP must stay scoped to the SPA so proxied Swagger docs are not broken."
);
assertIncludes(
  nginxConfig,
  "server_tokens off;",
  "Web runtime must not expose the Nginx version in error pages."
);
assertIncludes(
  nginxConfig,
  "proxy_set_header X-Request-Id $http_x_request_id;",
  "Web edge must preserve upstream trace ids for proxied API requests."
);
assertNotIncludes(
  nginxConfig,
  "script-src 'self' 'unsafe-inline'",
  "SPA CSP must not allow inline scripts."
);
assertNotIncludes(
  nginxConfig,
  "style-src 'self' 'unsafe-inline'",
  "SPA CSP must not allow inline styles."
);

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Web runtime security header config",
      contentSecurityPolicy: requiredDirectives
    },
    null,
    2
  )
);

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(message);
  }
}

function assertNotIncludes(haystack, needle, message) {
  if (haystack.includes(needle)) {
    throw new Error(message);
  }
}
