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

The server connects to MongoDB before accepting requests. `GET /health` returns
`200` when the database is connected and `503` otherwise.

Run the current tests with `npm test`.

## Migration notes

- Architecture and migration planning documents are kept local and excluded from Git.
- `.env` and `node_modules` are intentionally excluded from version control.
