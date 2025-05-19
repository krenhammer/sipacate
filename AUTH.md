# Sipacate

A complete authentication and subscription management solution built with Next.js 15, Better Auth, and Stripe integration.

## Features

- **Framework:** Next.js 15 (App Router)
- **Authentication:** Powered by [Better Auth](https://better-auth.vercel.app)
  - Email/Password sign-in/sign-up
  - Social authentication (Google)
  - Multi-Session Management (Switch between logged-in accounts)
  - Anonymous User Sessions
  - Email Verification
  - Password Reset
  - Admin Capabilities (User management, Impersonation)
  - API Key Management (Generation, Rate Limiting, Permissions)
  - Organization/Team Management (Invitations, Member roles)
- **Payments & Subscriptions:**
  - Stripe integration
  - Multiple subscription tiers (Basic, Pro, Enterprise) with defined limits
  - Free trials for paid plans
  - Customer creation on sign-up
  - Webhook handling for subscription events
- **Database:**
  - Drizzle ORM
  - PostgreSQL support (Neon serverless recommended)
  - Database migrations
- **UI & UX:**
  - [shadcn/ui](https://ui.shadcn.com) component library
  - Custom components for session switching, API keys, user status, etc.
  - Light/Dark mode theme toggle
  - Responsive design
- **Development & Tooling:**
  - TypeScript
  - [TanStack Query](https://tanstack.com/query) for data fetching & caching
  - `bun` package manager
  - [Biome](https://biomejs.dev) for linting and formatting
- **Deployment Ready:**
  - Configuration for Vercel and Cloudflare Pages

### Detailed Authentication Features:

- **Core:** Email/password, Google OAuth.
- **Session:** Secure session management, multi-device session tracking, ability to switch active sessions, revoke specific sessions.
- **User Flow:** Sign up, sign in, sign out, password reset, email verification.
- **Access Control:** Admin role, API key permissions, organization/team roles.
- **Advanced:** Anonymous sessions, user impersonation (for admins).

### Subscription Management Details:

- **Provider:** Stripe.
- **Plans:** Configurable plans (e.g., Basic, Pro, Enterprise) with specific feature limits (projects, storage).
- **Billing:** Automatic customer creation, webhook integration for real-time subscription updates.
- **Trials:** Support for free trial periods on specific plans.

### Organization & Collaboration:

- **Structure:** Users can belong to organizations and teams within them.
- **Invitations:** Invite users to join organizations via email.
- **Creation Control:** Optionally restrict organization creation to specific user roles (e.g., admins).
- **Team Limits:** Set maximum number of teams per organization.

### API Key Functionality:

- **Management:** Users can generate, view, and revoke API keys.
- **Security:** Rate limiting per key, configurable permissions (read/write access to different resources like teams, members, etc.).
- **Metadata:** Optional metadata storage associated with keys.

### Other Notable Features:

- **Admin Dashboard:** Overview of users, sessions, potentially other admin tasks.
- **API Documentation:** Likely integrated for developer use.
- **Customizable UI:** Leverages shadcn/ui for easy theme customization.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **Authentication:** [Better Auth](https://better-auth.vercel.app)
- **Database:** [Drizzle ORM](https://orm.drizzle.team) with PostgreSQL (Neon recommended)
- **UI:** [Tailwind CSS](https://tailwindcss.com) with [shadcn/ui](https://ui.shadcn.com)
- **Payments:** [Stripe](https://stripe.com)
- **State Management:** [TanStack Query](https://tanstack.com/query)
- **Package Manager:** [Bun](https://bun.sh)
- **Linting/Formatting:** [Biome](https://biomejs.dev)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/better-auth-nextjs-starter.git
cd better-auth-nextjs-starter
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables by copying the example file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```
# Authentication
BETTER_AUTH_SECRET="generate a secret key"

# Database (Choose one option)
# For PostgreSQL:
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# For Cloudflare D1:
CLOUDFLARE_ACCOUNT_ID="your_account_id"
CLOUDFLARE_API_TOKEN="your_api_token"
D1_DATABASE_ID="your_db_id"
D1_DATABASE_NAME="your_db_name"

# For Turso:
TURSO_DATABASE_URL="libsql://your-database-url"
TURSO_AUTH_TOKEN="your-auth-token"

# Stripe (for subscription functionality)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

5. Generate the auth schema and perform migrations:

```bash
# Generate Better Auth schema
bun x @better-auth/cli generate

# Generate and apply database migrations
bun db:generate
bun db:migrate
```

## Stripe Integration Setup

1. Create a Stripe account if you don't have one: [https://stripe.com](https://stripe.com)

2. Set up your Stripe products and prices:

```bash
bun stripe:seed
```

This will create the necessary subscription products and prices in your Stripe account and update your `.env` file with the price IDs.

3. For local development, set up the Stripe webhook listener:

```bash
bun stripe:webhook
```

Copy the webhook signing secret provided and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

## Development

Start the development server:

```bash
bun dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Deployment Options

### Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your repository
3. Configure environment variables in the Vercel dashboard
4. Deploy

### Cloudflare Pages

1. Set up your Cloudflare account and create a new Pages project
2. Configure your environment variables in the Cloudflare dashboard
3. Deploy using:

```bash
bun run deploy
```

## Project Structure

- `/app` - Next.js App Router pages, layouts, and route handlers
  - `/api` - API routes (likely including Better Auth handlers, webhooks)
  - `/admin` - Admin dashboard pages
  - `/api-keys` - Pages for managing API keys
  - `/auth` - Authentication pages (sign-in, sign-up, etc.)
  - `/dashboard` - Main user dashboard
  - `/organization` - Pages for managing organizations/teams (Likely exists or nested)
  - `/settings` - User profile and settings pages
  - `/pricing` - Subscription pricing page
  - `/verify-email` - Email verification page
- `/components` - Reusable UI components (including `shadcn/ui` and custom ones)
  - `/ui` - shadcn/ui components
  - `/api-keys` - Components specific to API key management
- `/lib` - Core utilities, client setup (`auth-client.ts`), server setup (`auth.ts`), Stripe config (`custom-stripe.ts`?)
- `/database` - Drizzle schema (`schema.ts`), migrations, connection setup (`db.ts`)
- `/hooks` - Custom React hooks (e.g., `use-auth-hooks.ts`, `use-invitations-hook.ts`)
- `/styles` - Global styles and Tailwind configuration (if separate)
- `/public` - Static assets

## Authentication Routes (Examples)

- `/auth/sign-in`: User login
- `/auth/get-started`: New user registration (or `/auth/sign-up`)
- `/auth/forgot-password`: Password reset request
- `/auth/reset-password`: Password reset confirmation (usually via link)
- `/verify-email`: Email verification confirmation (usually via link)

## Key User Flows

- **Onboarding:** Sign up -> Verify Email -> (Optional: Create Organization) -> Access Dashboard
- **Session Management:** Sign in -> View active sessions -> Switch between accounts -> Add another account -> Sign out a specific session
- **Organization:** Create Org -> Invite Member -> Manage Team Members -> Manage Org Settings
- **API Keys:** Generate Key -> Copy Key -> Set Permissions -> Revoke Key
- **Subscription:** View Pricing -> Select Plan -> Enter Payment (Stripe Checkout) -> Manage Subscription (Cancel/Change)
- **Admin:** View Users -> Impersonate User -> Manage Global Settings

## License

MIT
