# DocAppoint - Backend API (Modular Monolith)

**DocAppoint** is a comprehensive, production-ready doctor appointment booking system built with a **Modular Monolith** architecture in TypeScript.

---

## Tech Stack & Architecture

- **Runtime:** Node.js (v20 LTS) & TypeScript
- **Framework:** Express.js 5
- **Database:** MongoDB 7.0 with Mongoose ODM
- **Migrations:** `migrate-mongo`
- **Documentation:** Interactive Swagger / OpenAPI 3.0 UI (`/api/docs`)
- **Containerization:** Docker & Docker Compose (Multi-stage builds)
- **Authentication:** JWT (`TokenUtil`) & Bcrypt (`HashUtil`)
- **Validation:** Zod schemas
- **Storage & Payments:** Cloudinary & Razorpay

---

## Running with Docker (Recommended)

Start the entire stack (Backend + MongoDB 7.0 + Mongo Express GUI):

```bash
# Start all containers in detached mode
npm run docker:up

# Run database migrations in container
npm run docker:migrate

# Seed initial doctors into database in container
npm run docker:seed

# View live container logs
npm run docker:logs

# Stop and remove containers
npm run docker:down
```

### Services Started:
- **Backend API**: `http://localhost:3001`
- **Swagger Documentation**: `http://localhost:3001/api/docs`
- **MongoDB 7.0**: `localhost:27017`
- **Mongo Express GUI**: `http://localhost:8081`

---

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (.env)
Create a `.env` file in the root directory:

```env
PORT=3001
MONGODB_URI="mongodb://localhost:27017"
MONGODB_DB_NAME="docappoint"

# Cloudinary
CLOUDINARY_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_SECRET_KEY="your_secret_key"

# Admin
ADMIN_EMAIL="admin@docappoint.com"
ADMIN_PASSWORD="AdminPassword123"

# JWT
JWT_SECRET="your_secure_jwt_secret"

# Razorpay
KEY_ID="rzp_test_..."
KEY_SECRET="..."
CURRENCY="INR"
```

### 3. Run Migrations & Seed
```bash
npm run migrate:up
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

---

## Testing & Code Quality

```bash
# Run unit test suite (Jest)
npm test

# Run ESLint
npm run lint

# Run TypeScript type check
npm run typecheck

# Format code with Prettier
npm run format
```

---

## API Documentation

Interactive Swagger documentation is available at:
`http://localhost:3001/api/docs`

---

## License
MIT License
