# AI Agent Guidelines: DocAppointment Backend

This `AGENTS.md` file serves as the core instruction manual for any AI agent operating in this repository. It defines the architectural constraints and best practices necessary to maintain a scalable, maintainable Modular Monolith.

## 1. Architectural Rules: Modular Monolith
The codebase strictly follows a **Modular Monolith** architecture. Each domain/feature must be encapsulated in its own module inside `src/modules/`.

### The 4-Layer Separation
Inside each module (e.g., `src/modules/user/`), adhere to these layers:
1. **Route Layer (`*.routes.ts`)**: Defines HTTP endpoints and binds them to controllers. Handles request validation middlewares (e.g., Zod schemas) and route guards.
2. **Controller Layer (`*.controller.ts`)**: The entry point for requests. It validates parameters, calls the appropriate service, formats responses, and handles HTTP status codes. **Controllers MUST NOT contain business logic or call Repositories.**
3. **Service Layer (`*.service.ts`)**: The heart of the application. Contains ALL business logic. **Services MUST be completely agnostic of HTTP (Express).** They should not take `req` or `res` objects.
4. **Repository Layer (`*.repository.ts`)**: The ONLY layer permitted to interact with the database (Mongoose). All queries, projections, and database-specific logic live here.

## 2. Utility & Abstraction Rules
To keep the codebase scalable and maintainable, common cross-cutting concerns MUST be abstracted into utility files in `src/utils/`:
- **Authentication/Tokens (`token.util.ts`)**: Logic for signing and verifying JWT tokens should be centralized here. Do not use `jsonwebtoken` directly in services.
- **Hashing/Security (`hash.util.ts`)**: Logic for hashing passwords or comparing hashes (e.g., `bcrypt`) must be centralized.
- **Error Handling (`AppError.ts`)**: Use `AppError` for throwing predictable, formatted HTTP errors.

*Why?* Centralizing these logic blocks makes swapping libraries (e.g., moving from `jsonwebtoken` to another provider) trivial and keeps services clean and focused strictly on business logic.

## 3. Database & Migrations
- **Mongoose**: Schemas define the exact structure of the data. Mongoose will automatically create the collections in MongoDB when documents are first inserted.
- **Migrations (`migrate-mongo`)**: Use the `migrate-mongo` CLI for data patching or schema transformations. 
- **Seeding (`npm run seed`)**: Use the seed script to populate the database with initial data. Note that database connectivity requires your IP to be whitelisted in MongoDB Atlas.

## 4. Coding Standards
- **TypeScript**: Always use strict typing. Avoid `any`. Define proper interfaces for DTOs and Mongoose models.
- **Clean Code**: Keep functions small and single-purpose. Use descriptive variable names.
- **Async/Await**: Properly handle promises. Use `asyncWrapper` or global error handlers in Express routes to catch rejected promises.
