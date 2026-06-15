# New Flower Tattoo

A modern, premium portfolio website for a tattoo artist built with Next.js 15, TypeScript, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 15 (App Router, standalone output)
- **Language**: TypeScript (strict mode, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: Zod
- **Image CDN**: Cloudinary (reference image uploads + optimized delivery)
- **Email**: Resend (artist notifications + customer confirmations)
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **Package Manager**: Yarn 4 (Corepack)

## Local Development

### Prerequisites

- Node.js 22+
- Yarn 4+
- Docker + Docker Compose

### Setup

1. Clone the repository
2. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

3. Install dependencies:

   ```bash
   yarn install
   ```

4. Start the database:

   ```bash
   docker compose up postgres -d
   ```

5. Run database migrations:

   ```bash
   yarn db:migrate
   ```

6. Start the development server:\

   ```bash
   yarn dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Docker Usage

Run the entire stack (application + database) with Docker Compose:

```bash
docker compose up
```

Stop all services:

```bash
docker compose down
```

Stop all services and remove volumes:

```bash
docker compose down -v
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

| Variable                | Description                                       | Required                  |
| ----------------------- | ------------------------------------------------- | ------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string                      | Yes                       |
| `NEXT_PUBLIC_SITE_URL`  | Public site URL (e.g. `https://newflower.studio`) | Yes                       |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                             | Yes (image uploads)       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                | Yes (image uploads)       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                             | Yes (image uploads)       |
| `RESEND_API_KEY`        | Resend email API key                              | Yes (email notifications) |
| `ARTIST_EMAIL`          | Email address to receive booking notifications    | Yes (email notifications) |
| `EMAIL_FROM`            | Sender address for outgoing emails                | Yes (email notifications) |
| `POSTGRES_USER`         | PostgreSQL username (Docker only)                 | Docker only               |
| `POSTGRES_PASSWORD`     | PostgreSQL password (Docker only)                 | Docker only               |
| `POSTGRES_DB`           | PostgreSQL database name (Docker only)            | Docker only               |

## Scripts

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `yarn dev`               | Start development server             |
| `yarn build`             | Build for production                 |
| `yarn start`             | Start production server              |
| `yarn lint`              | Run ESLint                           |
| `yarn lint:fix`          | Run ESLint with auto-fix             |
| `yarn format`            | Format code with Prettier            |
| `yarn format:check`      | Check formatting                     |
| `yarn typecheck`         | Run TypeScript type checking         |
| `yarn test`              | Run tests                            |
| `yarn test:watch`        | Run tests in watch mode              |
| `yarn test:coverage`     | Run tests with coverage report       |
| `yarn db:generate`       | Generate Prisma client               |
| `yarn db:migrate`        | Run database migrations (dev)        |
| `yarn db:migrate:deploy` | Run database migrations (production) |
| `yarn db:studio`         | Open Prisma Studio                   |

## Database

This project uses PostgreSQL with Prisma ORM.

### Models

- **Appointment** — Booking requests from clients
- **PortfolioItem** — Tattoo portfolio entries
- **Testimonial** — Client reviews

### Migrations

Generate a new migration after schema changes:

```bash
yarn db:migrate
```

Deploy migrations in production:

```bash
yarn db:migrate:deploy
```

## Build Process

```bash
yarn build
```

The project uses Next.js standalone output for optimized Docker images.

## Deployment

The application can be deployed to:

- **Render** — Connect the repository, set environment variables, use Docker deployment
- **Railway** — Import the repository, set environment variables
- **Fly.io** — Use `fly deploy` with the provided Dockerfile
- **Vercel** — Connect the repository (note: PostgreSQL must be hosted separately)

All deployment targets require the environment variables defined in `.env.example`.
