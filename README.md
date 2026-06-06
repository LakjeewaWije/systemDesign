# System Design Learning API

Purpose: This project is a NestJS backend built to learn practical system design through a doctor booking domain.

- Concurrency: Uses Redis locking to prevent multiple requests from booking the same slot at the same time.
- Idempotency: Uses payment idempotency keys to make booking/payment retries safe.
- CI/CD: Uses GitHub Actions to automate tests and build checks.
- Automated testing: Covers core booking behavior with unit and integration tests.
- Error handling: Uses consistent HTTP exceptions and response formatting for predictable API failures.
- Logging: Uses structured request logging to make backend behavior easier to trace.
