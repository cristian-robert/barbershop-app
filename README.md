# Barbershop Appointment System

A Next.js application for managing barbershop appointments with Google Calendar integration.

## Features

- Real-time appointment booking system
- Google Calendar synchronization
- Available time slots calculation based on service duration
- Multi-step booking process:
  1. Date selection
  2. Time slot selection (with visual availability indicators)
  3. Service selection
  4. Contact information collection
- Admin panel for managing:
  - Services
  - Appointments
  - Site settings
  - Media assets

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: PostgreSQL (via Neon)
- **Authentication**: Clerk
- **Calendar Integration**: Google Calendar API
- **Deployment**: Vercel

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Google Cloud Platform account with Calendar API enabled
- Clerk account for authentication

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd barbershop-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local`
   - Fill in all required environment variables

4. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Google Calendar Setup

1. Create a Google Cloud Project
2. Enable the Google Calendar API
3. Create a Service Account and download the credentials
4. Share your Google Calendar with the Service Account email
5. Add the Service Account credentials to your environment variables:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID`

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/barbershop"

# Google Calendar API
GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----"
GOOGLE_CALENDAR_ID="your-calendar-id@group.calendar.google.com"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
CLERK_WEBHOOK_SECRET="your-clerk-webhook-secret"

# Admin Configuration
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-admin-password"
```

## Project Structure

```
src/
├── actions/           # Server actions
├── app/              # Next.js app router
│   ├── api/          # API routes
│   ├── admin/        # Admin panel
│   └── appointments/ # Appointment booking
├── components/       # Shared components
├── lib/             # Utility functions
└── types/           # TypeScript types
```

## Features in Detail

### Appointment Booking

The appointment booking process is designed to be user-friendly and efficient:

1. **Date Selection**

   - Users select a date from the calendar
   - Past dates and Sundays are disabled
   - Calendar shows available days

2. **Time Slot Selection**

   - Available time slots are calculated based on:
     - Business hours (9 AM - 5 PM)
     - Existing appointments
     - Google Calendar events
     - Service duration
   - Unavailable slots are visually marked and disabled
   - 30-minute intervals between slots

3. **Service Selection**

   - List of available services with prices
   - Service duration affects time slot availability

4. **Contact Information**
   - Collection of guest information:
     - Name
     - Email
     - Phone number
   - Form validation
   - Confirmation system

### Calendar Synchronization

The system maintains a two-way sync with Google Calendar:

- Periodic sync every 5 minutes
- Real-time availability checks
- Status tracking (active/cancelled)
- Conflict prevention

### Admin Features

Administrators can:

- Manage services (add, edit, delete)
- View and manage appointments
- Update site settings
- Manage media assets
- View customer information

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
