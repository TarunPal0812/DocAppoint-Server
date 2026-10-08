# AI Reference Document: Modular Monolith Architecture

## 1. Architectural Rules
This project follows a strict **Modular Monolithic** design. Each domain/feature is encapsulated in its own module directory, enforcing strict isolation.

### 4-Layer Architecture Constraints
Inside each module (e.g., `src/modules/user/`), the following strict layer separation must be adhered to:
- **Route Layer (`*.routes.ts`)**: Responsible ONLY for defining HTTP methods, endpoints, validation middlewares (e.g., Zod), and authentication guards.
- **Controller Layer (`*.controller.ts`)**: Parses incoming request payloads/params, calls the appropriate Service, handles HTTP-specific statuses, and returns responses. **Controllers MUST NEVER call Repositories or Models directly.**
- **Service Layer (`*.service.ts`)**: Contains ALL business logic. It orchestrates transactional tasks. **Services MUST be completely decoupled from HTTP frameworks (like Express).**
- **Repository Layer (`*.repository.ts`)**: The ONLY layer that interacts directly with the database (Mongoose/MongoDB). All queries must happen here. **Services call Repositories.**
- **Interfaces & Models (`*.interface.ts`, `*.model.ts`)**: Strongly typed Mongoose documents and Data Transfer Objects (DTOs).

## 2. Directory Structure Conventions
```text
src/
├── config/             # Global configurations (e.g., env variables, db connect)
├── middlewares/        # Global Express middlewares (e.g., global error handler)
├── utils/              # Shared utilities (e.g., logger)
├── types/              # Global TypeScript types
├── scripts/            # Build/seed scripts
└── modules/            # Domain modules
    └── user/           # Example module
        ├── user.routes.ts
        ├── user.controller.ts
        ├── user.service.ts
        ├── user.repository.ts
        ├── user.model.ts
        ├── user.interface.ts
        └── user.service.spec.ts
```

## 3. Adding a New Module
When adding a new module (e.g., `Product`), you must create all the necessary files adhering to the layers described above.
1. Define the Interface/Types (`product.interface.ts`).
2. Create the Mongoose Schema & Model (`product.model.ts`).
3. Implement the Data Access Layer (`product.repository.ts`).
4. Implement the Business Logic (`product.service.ts`).
5. Create the HTTP Handlers (`product.controller.ts`).
6. Define the Endpoints & Validation (`product.routes.ts`).
7. Register the routes in the main application file (e.g., `src/app.ts`).

## 4. Error Handling
- **Global Error Handler**: Use the centralized error handling middleware located in `src/middlewares/errorHandler.middleware.ts`.
- **AppError Class**: Throw custom errors using the `AppError` class (e.g., `throw new AppError('User not found', 404)`). Never leak internal stack traces to the client in production.
- **Async Catching**: Always use an async wrapper or try-catch block in Controllers, passing errors to `next(error)`.

## 5. Logging
- **Logger Utility**: Use the configured Winston logger from `src/utils/logger.ts`.
- Avoid `console.log()` in production code. Use `logger.info()`, `logger.error()`, `logger.warn()`, or `logger.debug()`.
- Logs are rotated daily and formatted differently for development (colored) and production (JSON).

## 6. Testing Guidelines
- Use **Jest** (`jest.config.ts`) for testing.
- Unit tests must be written for the **Service Layer** as a minimum (`*.spec.ts`).
- Repositories and external services must be **fully mocked** in Service tests to ensure business logic isolation.

## 7. Database Migrations (MongoDB)
- **Tooling**: We use `migrate-mongo` to track and apply database migrations.
- **Location**: All migration scripts must reside in `src/migrations/`.
- **Workflow**:
  - Do NOT modify the database schema structures manually in production.
  - Generate a new migration file: `npx migrate-mongo create <migration-name>`
  - Implement the `up()` and `down()` methods using the native MongoDB Node.js driver to transform the data or create indexes.
  - Apply migrations during deployment BEFORE starting the Node.js server using `npx migrate-mongo up`.

## 8. Formatting & Code Quality
- **ESLint & Prettier**: Follow the configured rules. Run `npm run lint` and `npm run format` before pushing code.
- **Git Hooks**: Husky and lint-staged are configured to automatically lint and type-check on pre-commit. **Do not bypass the hooks.**
- Always compile TypeScript cleanly (`npx tsc --noEmit`) before proposing changes.

## 8. Path Aliasing
Use configured TypeScript path aliases:
- `@modules/*` -> `src/modules/*`
- `@config/*` -> `src/config/*`
- `@middlewares/*` -> `src/middlewares/*`
- `@utils/*` -> `src/utils/*`
