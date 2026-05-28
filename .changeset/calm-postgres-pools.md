---
"@benh-vien-so/api": patch
---

Add configurable PostgreSQL repository pool limits and close owned repository pools during Fastify shutdown to reduce connection pressure in Docker/dev-prod environments.
