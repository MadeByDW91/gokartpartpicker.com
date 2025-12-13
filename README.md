# GoKart Part Picker

A web application for building and customizing go-kart engines with the right parts, comparing prices, and following step-by-step installation guides.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Fonts**: Oswald (headings), Inter (body)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/gokartpartpicker?schema=public"
   ```

4. Set up the database:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed the database
- `pnpm db:studio` - Open Prisma Studio

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── engines/           # Engine pages
│   ├── parts/             # Parts pages
│   ├── guides/            # Guide pages
│   ├── build/             # Build pages
│   └── search/            # Search page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── calculations.ts    # HP, RPM, cost calculations
│   ├── vendorSort.ts     # Vendor sorting logic
│   ├── buildStore.ts     # Build state management
│   └── prisma.ts         # Prisma client
├── prisma/               # Prisma schema and migrations
│   └── seed.ts           # Database seed script
└── docs/                 # Documentation
    ├── plan.md           # Implementation plan
    └── assumptions.md    # Implementation assumptions
```

## Features

### MVP (Phase 1)

- ✅ Browse engines and parts
- ✅ Compare vendor prices (Amazon-first sorting)
- ✅ Build workbench with live calculations
- ✅ HP range and safe RPM calculations
- ✅ Safety warnings for unsafe builds
- ✅ Step-by-step installation guides
- ✅ Search across engines, parts, and guides
- ✅ Build summary with export placeholder

### Future Enhancements

- Engine workbench with SVG hotspots
- Stripe checkout integration
- Build persistence and sharing
- User authentication
- Build templates
- Advanced part recommendations

## Database Schema

See `prisma/schema.prisma` for the complete schema. Key models:

- **Engine**: Base engines (Predator 212, 420, 670, etc.)
- **Part**: Performance parts (intake, exhaust, cam, springs, etc.)
- **Vendor**: Vendors (Amazon, GoPowerSports, etc.)
- **VendorOffer**: Price listings for parts
- **Guide**: Installation guides with steps
- **TodoTemplate**: Build checklists

## License

Proprietary - Garage Built Digital LLC

