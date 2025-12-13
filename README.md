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
│   ├── learn/             # Learn section (ignition timing, etc.)
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
- ✅ **Homepage v1** - Comprehensive homepage with hero, engine picker, example builds, tools, and account benefits
- ✅ **SEO Optimized** - Proper metadata, JSON-LD schema, and internal linking
- ✅ **Learn Section** - Educational content for ignition timing and engine modifications
- ✅ **Ignition Timing Calculator** - Interactive calculator for timing key selection
- ✅ **Advanced Timing Keys** - Support for 2°, 4°, and 6° timing keys with safety warnings

### Future Enhancements

- Engine workbench with SVG hotspots
- Stripe checkout integration
- Build persistence and sharing
- User authentication
- Build templates
- Advanced part recommendations

## Database Schema

See `prisma/schema.prisma` for the complete schema. Key models:

- **Engine**: Base engines (Predator 212, 420, 670, etc.) - includes `stockTimingDegBtdc` field
- **Part**: Performance parts (intake, exhaust, cam, springs, ignition/timing keys, etc.)
- **Vendor**: Vendors (Amazon, GoPowerSports, etc.)
- **VendorOffer**: Price listings for parts
- **Guide**: Installation guides with steps
- **Video**: Curated YouTube videos for installation, tuning, and safety
- **TodoTemplate**: Build checklists

## New Features Documentation

### Ignition Timing System

The ignition timing system allows users to:
- Learn about timing basics, advanced timing keys, and safety
- Use an interactive calculator to determine optimal timing
- Add timing keys (2°, 4°, 6°) to builds with automatic safety warnings
- See HP impact and risk levels for different timing configurations

**Timing Keys:**
- `timing-key-2deg`: Mild advance, safe for most builds
- `timing-key-4deg`: Moderate advance, requires billet flywheel
- `timing-key-6deg`: Aggressive advance, requires billet flywheel and billet rod

### Learn Section

The `/learn` section provides educational content:
- `/learn` - Index of all topics
- `/learn/ignition-timing` - Hub page for ignition timing
- `/learn/ignition-timing/basics` - Understanding TDC/BTDC
- `/learn/ignition-timing/flywheel-keys` - How timing keys work
- `/learn/ignition-timing/advanced-timing` - Optimization guide
- `/learn/ignition-timing/safety` - Critical safety information
- `/learn/ignition-timing/calculator` - Interactive calculator

### Editing Content

- **Learn Pages**: Edit files in `app/learn/` directory
- **Videos**: Add/update videos in `prisma/seed.ts` (videos section)
- **Example Builds**: Update `EXAMPLE_BUILDS` array in `app/page.tsx`
- **Popular Engines**: Update `POPULAR_ENGINE_SLUGS` in `app/page.tsx`

## License

Proprietary - Garage Built Digital LLC

