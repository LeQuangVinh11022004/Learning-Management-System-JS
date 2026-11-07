# Learning Management System backend

This repository is being migrated from the existing OJT backend in small,
reviewable increments. The current first slice contains the Express bootstrap,
database connection lifecycle, health endpoint and centralized error handling.
Feature modules will be added in later batches.

## Technology

- Node.js and Express
- MongoDB with Mongoose
- Joi validation, Passport/JWT, Swagger and integrations will be migrated with
  their corresponding feature batches

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set the local MongoDB URL and JWT secret.
3. Run `npm run dev`.

The application validates the port, shutdown timeout and active environment's
MongoDB URL before connecting or opening the HTTP listener. Invalid settings
are reported together at startup.

The server connects to MongoDB before accepting requests. `GET /health/live`
checks that the process is running. `GET /health/ready` checks MongoDB
connectivity; the existing `GET /health` endpoint remains as a compatibility
alias. Readiness returns `200` when MongoDB is connected and `503` otherwise.
Each request receives an `X-Request-Id` response header. Use this identifier to
correlate access logs with error responses.
Set `CORS_ORIGINS` to a comma-separated list of allowed browser origins when
deploying; local development origins are used when it is unset. Startup
validation requires each configured value to be an HTTP(S) origin without a
path.
Non-health requests are rate limited per client IP. Configure the window with
`RATE_LIMIT_WINDOW_MS` and the request cap with `RATE_LIMIT_MAX_REQUESTS`.
The default in-memory store is process-local; multi-instance deployments should
use a shared rate-limit store.

Run the current tests with `npm test`.

## Migration notes

- Architecture and migration planning documents are kept local and excluded from Git.
- `.env` and `node_modules` are intentionally excluded from version control.
