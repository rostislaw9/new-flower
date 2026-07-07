# New Flower Tattoo

Production website for New Flower Tattoo studio. Built with Next.js, TypeScript, and Prisma.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)

## Overview

The website provides:

- **Gallery** — Tattoo work showcase with category filtering and featured pieces
- **Booking System** — Appointment request form with status tracking
- **Client Reviews** — Testimonials and ratings display
- **Admin Dashboard** — Management interface for gallery, bookings, reviews, about content, and FAQ
- **Multi-Language** — English and Thai with automatic locale detection
- **Image Management** — Cloudinary integration for optimized image delivery
- **Email Notifications** — Automated booking confirmations and status updates via Resend
- **SEO** — JSON-LD structured data, dynamic sitemaps, robots.txt

## Tech Stack

### Core

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/) (Strict mode with `exactOptionalPropertyTypes`)
- **Runtime**: Node.js 22+

### Frontend

- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) toast library
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) (dark mode)

### Backend

- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM 6](https://www.prisma.io/)
- **Image CDN**: [Cloudinary](https://cloudinary.com/) (upload, storage, optimization)
- **Email**: [Resend](https://resend.com/) (transactional emails)

### Developer Experience

- **Package Manager**: [Yarn 4](https://yarnpkg.com/) (Corepack)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting**: [ESLint 9](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)

## Features

### Public Pages

- **Homepage** — Hero section, featured gallery, testimonials, CTA
- **Gallery** — Gallery with category filtering, detailed lightbox views
- **About** — Artist biography, journey timeline (content managed via DB)
- **Booking** — Appointment request form with validation
- **Reviews** — Client testimonials and ratings
- **FAQ** — Frequently asked questions (content managed via DB)
- **Contact** — Contact form and information

### Admin Dashboard

- **Dashboard** — Overview with key metrics and statistics
- **Gallery Management** — Create, edit, delete, feature, and reorder gallery items
- **Booking Management** — View, filter, and update appointment statuses
- **Review Management** — Moderate and feature client reviews
- **Artist Images Management** — Manage artist portrait and shop logo
- **About Page Management** — Edit biography and journey timeline with localized content
- **FAQ Management** — Manage FAQ groups, questions, and translations
- **Responsive Sidebar** — Collapsible navigation with mobile support

### Technical Features

- **Multi-Language** — English and Thai with automatic locale detection
- **Responsive Design** — Mobile-first approach
- **Dark Mode** — Theme switching with next-themes
- **SEO** — JSON-LD structured data, dynamic sitemaps, robots.txt
- **Performance** — Image optimization, code splitting, caching strategies
- **Type Safety** — Full TypeScript coverage with strict mode
- **Error Handling** — Comprehensive error boundaries and fallbacks

## Quick Start

### Prerequisites

- **Node.js** 22+ ([Download](https://nodejs.org/))
- **Yarn** 4+ (run `corepack enable` if needed)
- **Docker** + **Docker Compose** (for local PostgreSQL)

### Installation

1. **Install dependencies**

   ```bash
   yarn install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration (see [Environment Variables](#environment-variables) below)

3. **Start PostgreSQL**

   ```bash
   docker compose up postgres -d
   ```

4. **Run database migrations**

   ```bash
   yarn db:migrate
   ```

5. **Start development server**

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Setup

The `docker-compose.yml` defines a PostgreSQL database and a Next.js dev server for local development.

```bash
# Start both PostgreSQL and Next.js dev server
docker compose up

# Start PostgreSQL only (for local yarn dev)
docker compose up postgres -d

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                | Description                       | Required    | Example                                    |
| ----------------------- | --------------------------------- | ----------- | ------------------------------------------ |
| `DATABASE_URL`          | PostgreSQL connection string      | Yes         | `postgresql://user:pass@localhost:5432/db` |
| `NEXT_PUBLIC_SITE_URL`  | Public site URL                   | Yes         | `https://newflower.tattoo`                 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name             | Yes         | `your-cloud-name`                          |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                | Yes         | `your-api-key`                             |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret             | Yes         | `your-api-secret`                          |
| `RESEND_API_KEY`        | Resend email API key              | Yes         | `re_xxxxx`                                 |
| `ARTIST_EMAIL`          | Email for booking notifications   | Yes         | `artist@studio.com`                        |
| `EMAIL_FROM`            | Sender email address              | Yes         | `Studio <noreply@studio.com>`              |
| `ADMIN_USERNAME`        | Admin dashboard basic auth user   | Yes         | `admin`                                    |
| `ADMIN_PASSWORD`        | Admin dashboard basic auth pass   | Yes         | `secure_password`                          |
| `CRON_SECRET`           | Bearer token for cron endpoints   | Optional    | `your-cron-secret`                         |
| `POSTGRES_USER`         | PostgreSQL username (Docker)      | Docker only | `flower`                                   |
| `POSTGRES_PASSWORD`     | PostgreSQL password (Docker)      | Docker only | `secure_password`                          |
| `POSTGRES_DB`           | PostgreSQL database name (Docker) | Docker only | `flower_db`                                |

## Scripts

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `yarn dev`               | Start development server with hot reload |
| `yarn build`             | Build for production                     |
| `yarn start`             | Start production server                  |
| `yarn lint`              | Run ESLint (strict, no warnings)         |
| `yarn lint:fix`          | Fix ESLint issues automatically          |
| `yarn format`            | Format code with Prettier                |
| `yarn format:check`      | Check code formatting                    |
| `yarn typecheck`         | Run TypeScript type checking             |
| `yarn i18n:check`        | Validate translation files               |
| `yarn test`              | Run tests once                           |
| `yarn test:watch`        | Run tests in watch mode                  |
| `yarn test:coverage`     | Generate coverage report                 |
| `yarn db:generate`       | Generate Prisma client                   |
| `yarn db:migrate`        | Create and run migrations (dev)          |
| `yarn db:migrate:deploy` | Run migrations (production)              |
| `yarn db:studio`         | Open Prisma Studio GUI                   |
| `yarn db:seed`           | Seed database with sample data           |
| `yarn db:sync-prod`      | Sync production data to local database   |

## Database Schema

### Appointment

Stores booking requests from clients.

```typescript
- id: String (CUID)
- fullName: String
- email: String
- phone: String?
- contactMethod: String
- tattooDescription: String
- bodyPlacement: String?
- tattooSize: String?
- preferredDates: String[]
- budgetRange: String?
- referenceImages: String[]
- status: AppointmentStatus (pending, contacted, approved, rejected, completed)
- createdAt: DateTime
- updatedAt: DateTime
```

### GalleryItem

Represents a tattoo gallery entry.

```typescript
- id: String (CUID)
- title: String
- description: String?
- imageUrl: String (Cloudinary URL)
- category: String
- featured: Boolean
- displayOrder: Int
- width: Int (image dimensions)
- height: Int
- createdAt: DateTime
- updatedAt: DateTime
```

### Review

Client testimonials and ratings.

```typescript
- id: String (CUID)
- clientName: String
- clientEmail: String?
- rating: Int (1-5)
- text: String
- featured: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### AboutBio + AboutBioTranslation

Artist biography with localized title and description.

```typescript
// AboutBio
- id: String (CUID)
- createdAt: DateTime
- updatedAt: DateTime

// AboutBioTranslation
- id: String (CUID)
- bioId: String (FK → AboutBio)
- locale: String (en, th)
- title: String
- description: String
- unique: [bioId, locale]
```

### AboutJourney + AboutJourneyTranslation

Journey timeline entries with localized title and description. Year is stored once per journey (calendar year).

```typescript
// AboutJourney
- id: String (CUID)
- displayOrder: Int
- year: String (calendar year, e.g. "2016")
- createdAt: DateTime
- updatedAt: DateTime

// AboutJourneyTranslation
- id: String (CUID)
- journeyId: String (FK → AboutJourney)
- locale: String (en, th)
- title: String
- description: String
- unique: [journeyId, locale]
```

### FaqGroup + FaqGroupTranslation

FAQ categories with localized titles.

```typescript
// FaqGroup
- id: String (CUID)
- displayOrder: Int
- createdAt: DateTime
- updatedAt: DateTime

// FaqGroupTranslation
- id: String (CUID)
- groupId: String (FK → FaqGroup)
- locale: String (en, th)
- title: String
- unique: [groupId, locale]
```

### FaqQuestion + FaqTranslation

Individual FAQ questions with localized question and answer text.

```typescript
// FaqQuestion
- id: String (CUID)
- groupId: String (FK → FaqGroup)
- displayOrder: Int
- createdAt: DateTime
- updatedAt: DateTime

// FaqTranslation
- id: String (CUID)
- questionId: String (FK → FaqQuestion)
- locale: String (en, th)
- questionText: String
- answerText: String
- unique: [questionId, locale]
```

## Project Structure

```text
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes
│   │   ├── admin/         # Admin dashboard
│   │   │   ├── about/     # About page content management
│   │   │   ├── artist-images/ # Artist portrait & logo
│   │   │   ├── bookings/  # Booking management
│   │   │   ├── faq/       # FAQ management
│   │   │   ├── gallery/   # Gallery management
│   │   │   ├── reviews/   # Review moderation
│   │   │   └── layout.tsx # Admin layout with sidebar
│   │   ├── about/         # Public about page
│   │   ├── booking/       # Booking form
│   │   ├── gallery/       # Public gallery
│   │   ├── reviews/       # Reviews page
│   │   └── ...
│   ├── api/               # API routes
│   │   ├── cron/          # Cron endpoints (cloudinary cleanup)
│   │   └── gallery/       # Gallery endpoint (public, paginated)
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── sections/         # Page sections
│   ├── styled/           # Styled UI components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                  # Utilities and helpers
│   ├── actions/          # Server actions (mutations + data fetching)
│   ├── email/            # Email templates
│   ├── schemas/          # Zod validation schemas
│   └── ...
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── i18n/                 # Internationalization config
```

## Deployment

Docker is used for local development only. Production deployment is handled separately.

## Testing

Run the test suite:

```bash
yarn test
```

Watch mode for development:

```bash
yarn test:watch
```

Generate coverage report:

```bash
yarn test:coverage
```

## Development Guide

### Adding a New Page

1. Create route in `src/app/[locale]/your-page/page.tsx`
2. Add translations to `messages/en.json` and `messages/th.json`
3. Update navigation if needed

### Adding Admin Features

1. Create component in `src/components/admin/`
2. Add server action in `src/lib/actions/`
3. Create page in `src/app/[locale]/admin/your-feature/`
4. Add to admin sidebar in `src/app/[locale]/admin/layout.tsx`

### Database Changes

1. Update `prisma/schema.prisma`
2. Run `yarn db:migrate`
3. Name the migration descriptively

### Adding Translations

1. Add keys to `messages/en.json`
2. Add translations to `messages/th.json`
3. Use `useTranslations()` hook in components
4. Run `yarn i18n:check` to validate key parity

### Syncing Production Data to Local

To copy production database data to your local environment:

```bash
yarn db:sync-prod
```

This script dumps data from the production database (using `DATABASE_URL` from `.env`) and imports it locally. It syncs all content tables: appointments, gallery items, reviews, about bios/journeys, and FAQ groups/questions with their translations.

## Cron Jobs

### Cloudinary Image Cleanup

Removes unused images from Cloudinary that aren't referenced in the database.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://newflower.tattoo/api/cron/cloudinary-cleanup
```

For local development:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/cloudinary-cleanup
```

The `CRON_SECRET` environment variable must be set. The endpoint returns a JSON summary of deleted and remaining images.

## Security

- **TypeScript Strict Mode** — Catches type errors at compile time
- **Input Validation** — Zod schemas validate all user input
- **CSRF Protection** — Built-in Next.js protection
- **SQL Injection Prevention** — Prisma parameterized queries
- **Environment Variables** — Sensitive data never committed
- **API Routes** — Server-side validation and authentication ready

## Performance

- **Image Optimization** — Cloudinary handles resizing and caching
- **Code Splitting** — Automatic with Next.js App Router
- **Database Indexing** — Strategic indexes on frequently queried fields
- **Caching** — Next.js built-in caching strategies
